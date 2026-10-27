#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile, chmod, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, basename } from 'node:path'
import { createInterface } from 'node:readline'
import { credentialPath, clientConfig, expectedDoctor, mcpUrl, pkce, redact, REDIRECT_URI, DEFAULT_ORIGIN } from '../lib/pure.mjs'

const args = process.argv.slice(2)
const command = args[0] ?? 'doctor'
const rest = args.slice(1)
const flag = name => rest.includes(name)
const option = name => {
  const index = rest.indexOf(name)
  return index >= 0 ? rest[index + 1] : undefined
}

function origin() {
  return (option('--issuer') || process.env.ULTIWRITE_MCP_ISSUER || DEFAULT_ORIGIN).replace(/\/$/, '')
}

async function readCredentials() {
  try { return JSON.parse(await readFile(credentialPath(), 'utf8')) } catch { return null }
}

async function writeCredentials(value) {
  const path = credentialPath()
  await mkdir(dirname(path), { recursive: true, mode: 0o700 })
  await writeFile(path, JSON.stringify(value), { mode: 0o600 })
  await chmod(path, 0o600)
}

async function doctor() {
  if (flag('--offline')) {
    process.stdout.write(`${JSON.stringify(expectedDoctor(origin()), null, 2)}\n`)
    return
  }
  const base = origin()
  const resource = await fetch(`${base}/.well-known/oauth-protected-resource`)
  const authorization = await fetch(`${base}/.well-known/oauth-authorization-server`)
  const resourceBody = await resource.json()
  const authorizationBody = await authorization.json()
  const ok = resource.ok && authorization.ok && resourceBody.resource === mcpUrl(base) && authorizationBody.issuer === base
  process.stdout.write(`${JSON.stringify({ ok, endpoint: resourceBody.resource, issuer: authorizationBody.issuer, scopes: resourceBody.scopes_supported, package: 'ultiwrite-mcp@0.7.1' }, null, 2)}\n`)
  if (!ok) process.exitCode = 1
}

async function config() {
  process.stdout.write(`${JSON.stringify(clientConfig(origin()), null, 2)}\n`)
}

async function logout() {
  const saved = await readCredentials()
  let revoked = false
  if (saved?.refresh_token || saved?.access_token) {
    revoked = true
    try {
      await fetch(`${saved.issuer || origin()}/api/integrations/ultiwrite/oauth/revoke`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: saved.refresh_token || saved.access_token }),
      })
    } catch { /* local removal still proceeds */ }
  }
  await rm(credentialPath(), { force: true })
  process.stderr.write(`Local Ultiwrite credentials removed. Revocation ${revoked ? 'attempted' : 'not attempted'}.\n`)
}

async function login() {
  const base = origin()
  const { verifier, challenge } = pkce()
  const registered = await fetch(`${base}/api/integrations/ultiwrite/oauth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ application_type: 'native', redirect_uris: [REDIRECT_URI] }),
  })
  const client = await registered.json()
  if (!registered.ok || !client.client_id) {
    process.stderr.write('Client registration was refused. No credential was stored.\n')
    process.exitCode = 1
    return
  }
  const state = pkce().verifier
  const authorize = new URL(`${base}/api/integrations/ultiwrite/oauth/authorize`)
  authorize.searchParams.set('response_type', 'code')
  authorize.searchParams.set('client_id', client.client_id)
  authorize.searchParams.set('redirect_uri', REDIRECT_URI)
  authorize.searchParams.set('code_challenge', challenge)
  authorize.searchParams.set('code_challenge_method', 'S256')
  authorize.searchParams.set('state', state)
  authorize.searchParams.set('scope', 'ultiwrite:read ultiwrite:evidence')
  authorize.searchParams.set('resource', mcpUrl(base))
  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', REDIRECT_URI)
      if (url.pathname !== '/oauth/callback' || url.searchParams.get('state') !== state) {
        res.writeHead(400); res.end('Invalid sign-in callback.'); return
      }
      res.end('Ultiwrite login received. You can close this window.')
      server.close()
      clearTimeout(timeout)
      if (url.searchParams.get('iss') !== base || !url.searchParams.get('code')) reject(new Error('Sign-in was refused or returned an unexpected issuer.'))
      else resolve(url.searchParams.get('code'))
    })
    const timeout = setTimeout(() => { server.close(); reject(new Error('Sign-in timed out. Run login again.')) }, 300_000)
    server.on('error', error => { clearTimeout(timeout); reject(error) })
    server.listen(6274, '127.0.0.1', () => process.stderr.write(`Open this URL and approve Ultiwrite:\n${authorize.href}\n`))
  })
  const token = await fetch(`${base}/api/integrations/ultiwrite/oauth/token`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: client.client_id, code_verifier: verifier, resource: mcpUrl(base) }),
  })
  const body = await token.json()
  if (!token.ok) {
    process.stderr.write('Token exchange failed. No credential was stored.\n')
    process.exitCode = 1
    return
  }
  await writeCredentials({ ...body, client_id: client.client_id, issuer: base })
  process.stderr.write(`Signed in. Credentials stored at ${credentialPath()} (not printed).\n`)
}

async function rpc(message) {
  let saved = await readCredentials()
  if (!saved?.access_token) {
    throw new Error('Not signed in. Run ultiwrite-mcp login.')
  }
  const version = message.params?._meta?.['io.modelcontextprotocol/protocolVersion']
  const mirrored = version ? { 'mcp-protocol-version': version, 'mcp-method': message.method, ...(message.params?.name ? { 'mcp-name': message.params.name } : {}) } : {}
  const send = () => fetch(mcpUrl(saved.issuer || origin()), {
    method: 'POST',
    headers: { authorization: `Bearer ${saved.access_token}`, 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...mirrored },
    body: JSON.stringify(message),
    redirect: 'error',
  })
  let response = await send()
  if (response.status === 401 && saved.refresh_token && saved.client_id) {
    await response.body?.cancel()
    const refresh = await fetch(`${saved.issuer}/api/integrations/ultiwrite/oauth/token`, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, redirect: 'error',
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: saved.refresh_token, client_id: saved.client_id, resource: mcpUrl(saved.issuer) }),
    })
    const renewed = await refresh.json()
    if (!refresh.ok || !renewed.access_token) throw new Error('Sign-in expired. Run ultiwrite-mcp login again.')
    saved = { ...saved, ...renewed }
    await writeCredentials(saved)
    response = await send()
  }
  if (response.status === 202 || response.status === 204) { await response.body?.cancel(); return null }
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Ultiwrite refused the request (${response.status}). Check your sign-in and account access.`) }
  const type = response.headers.get('content-type') ?? ''
  if (type.includes('text/event-stream')) {
    const text = await response.text()
    const data = text.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).filter(Boolean).at(-1)
    return data ? JSON.parse(data) : null
  }
  return response.json()
}

async function stdio() {
  process.stderr.write('ultiwrite-mcp stdio bridge\n')
  for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    if (!line.trim()) continue
    let message
    try {
      message = JSON.parse(line)
      const result = await rpc(message)
      if (result && message.id !== undefined) process.stdout.write(`${JSON.stringify(result)}\n`)
    } catch (error) {
      process.stderr.write(`${error.message}\n`)
      if (message?.id !== undefined || !message) process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: message?.id ?? null, error: { code: message ? -32001 : -32700, message: message ? 'Request failed. Check Ultiwrite sign-in and connection.' : 'Invalid JSON.' } })}\n`)
    }
  }
}

async function upload() {
  const files = rest.filter((item, index) => !item.startsWith('--') && rest[index - 1] !== '--issuer')
  if (!files.length) {
    process.stderr.write('Usage: ultiwrite-mcp upload <file>...\n')
    process.exitCode = 2
    return
  }
  const selected = await Promise.all(files.map(async file => {
    const metadata = await stat(file)
    if (!metadata.isFile() || !metadata.size) throw new Error('Select nonempty regular files.')
    return { path: file, name: basename(file), size: metadata.size, contentType: 'application/octet-stream' }
  }))
  const opened = await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'ultiwrite_evidence_submit', arguments: {} } })
  const result = JSON.parse(opened?.result?.content?.find(item => item.type === 'text')?.text || '{}')
  const saved = await readCredentials()
  const link = new URL(result.uploadLink || 'https://invalid.invalid')
  if (link.origin !== new URL(saved.issuer).origin || !link.searchParams.get('t')) throw new Error('Ultiwrite did not return a valid account upload handoff.')
  const staging = step => new URL(`/api/integrations/ultiwrite/upload/staging/${step}${link.search}`, link)
  const post = async (url, body) => {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), redirect: 'error' })
    const value = await response.json()
    if (!response.ok || value.ok === false) throw new Error(value.message || value.error || 'Upload step failed. Retry the saved handoff.')
    return value
  }
  const minted = await post(staging('presign'), { files: selected.map(({ path, ...file }) => file) })
  if (minted.files?.length !== selected.length) throw new Error('Upload plan does not match the selected files.')
  const receipts = []
  for (const [index, plan] of minted.files.entries()) {
    const file = selected[index]
    const receipt = Object.fromEntries(['uploadId', 'fileName', 'size', 'contentType', 'bindingToken', 'expiresAt'].map(key => [key, plan[key]]))
    const put = async (url, start, end) => {
      const target = new URL(url)
      if (target.protocol !== 'https:' && !(target.protocol === 'http:' && link.protocol === 'http:' && target.hostname === '127.0.0.1' && link.hostname === '127.0.0.1')) throw new Error('Storage requires HTTPS.')
      const response = await fetch(target, { method: 'PUT', headers: { 'content-length': String(end - start + 1), 'content-type': file.contentType }, body: createReadStream(file.path, { start, end }), duplex: 'half', redirect: 'error' })
      await response.body?.cancel()
      if (!response.ok) throw new Error('A selected file did not reach storage. No analysis was started.')
      return response.headers.get('etag')
    }
    const completed = { uploadRef: receipt, uploadId: plan.uploadId, expectedSize: file.size }
    if (plan.mode === 'multipart') {
      if (!Number.isSafeInteger(plan.partSize) || plan.partSize <= 0 || !plan.multipartId) throw new Error('Invalid multipart plan.')
      const parts = []
      for (let partNumber = 1; partNumber <= Math.ceil(file.size / plan.partSize); partNumber++) {
        const urls = await post(staging('parts'), { uploadRef: receipt, uploadId: plan.uploadId, multipartId: plan.multipartId, partNumbers: [partNumber] })
        const target = (urls.urls || []).find(item => item.partNumber === partNumber)
        if (!target?.url) throw new Error('A multipart transfer URL is missing.')
        const etag = await put(target.url, (partNumber - 1) * plan.partSize, Math.min(partNumber * plan.partSize, file.size) - 1)
        if (!etag) throw new Error('Storage did not confirm the uploaded part.')
        parts.push({ partNumber, etag })
      }
      Object.assign(completed, { multipartId: plan.multipartId, parts })
    } else await put(plan.uploadUrl, 0, file.size - 1)
    await post(staging('complete'), completed)
    receipts.push(receipt)
    process.stderr.write(`Uploaded file ${index + 1} of ${selected.length}.\n`)
  }
  const committed = await post(new URL(`/api/integrations/ultiwrite/upload${link.search}`, link), { files: receipts, documentForensics: false })
  process.stdout.write(`${JSON.stringify(redact(committed), null, 2)}\n`)
}

const commands = { doctor, login, logout, stdio, config, upload }
if (!commands[command]) {
  process.stderr.write('Commands: doctor, login, logout, stdio, config, upload\n')
  process.exitCode = 2
} else {
  try { await commands[command]() } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1 }
}
