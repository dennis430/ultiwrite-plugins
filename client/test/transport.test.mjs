import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'

const home = await mkdtemp(join(tmpdir(), 'ultiwrite-transport-'))
const credentials = join(home, '.config/ultiwrite/credentials.json')
await mkdir(join(home, '.config/ultiwrite'), { recursive: true })
let origin, transferred, refreshed = 0
const server = createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const bytes = Buffer.concat(chunks)
  const body = () => JSON.parse(bytes)
  const reply = value => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)) }
  if (req.url === '/api/integrations/ultiwrite/oauth/token') {
    assert.equal(new URLSearchParams(bytes.toString()).get('refresh_token'), 'old-refresh')
    refreshed++
    return reply({ access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 3600 })
  }
  if (req.url === '/object') { transferred = bytes; return res.end() }
  if (req.url.includes('/staging/presign')) {
    const file = body().files[0]
    return reply({ files: [{ ...file, fileName: file.name, uploadId: 'synthetic', mode: 'single', uploadUrl: `${origin}/object`, bindingToken: 'synthetic', expiresAt: Date.now() + 60000 }] })
  }
  if (req.url.includes('/staging/complete')) return reply({ status: 'stored', bytes: transferred.length })
  if (req.url.startsWith('/api/integrations/ultiwrite/upload?')) return reply({ ok: true, caseId: 'saved-case', status: 'processing' })
  const message = body()
  if (req.headers.authorization === 'Bearer old-access') { res.statusCode = 401; return reply({ error: 'expired' }) }
  assert.equal(req.headers.authorization, 'Bearer new-access')
  if (message.id === undefined) { res.statusCode = 202; return res.end() }
  const result = message.method === 'tools/call' && message.params.name === 'ultiwrite_evidence_submit'
    ? { isError: true, content: [{ type: 'text', text: JSON.stringify({ uploadLink: `${origin}/api/integrations/ultiwrite/upload?t=synthetic` }) }] }
    : { accepted: message.method }
  reply({ jsonrpc: '2.0', id: message.id, result })
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
origin = `http://127.0.0.1:${server.address().port}`
await writeFile(credentials, JSON.stringify({ access_token: 'old-access', refresh_token: 'old-refresh', client_id: 'synthetic', issuer: origin }), { mode: 0o600 })
const bin = new URL('../bin/ultiwrite-mcp.js', import.meta.url)
const start = args => spawn(process.execPath, [bin.pathname, ...args], { env: { ...process.env, ULTIWRITE_HOME: home }, stdio: ['pipe', 'pipe', 'pipe'] })
const child = start(['stdio'])
let output = '', errors = ''
child.stdout.on('data', chunk => { output += chunk })
child.stderr.on('data', chunk => { errors += chunk })
try {
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n')
  const deadline = Date.now() + 4000
  while (!output.includes('initialize') && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20))
  assert.match(output, /initialize/, 'stdio must reply while stdin remains open')
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n')
  child.stdin.end()
  await once(child, 'close')
  const replies = output.trim().split('\n').map(line => JSON.parse(line))
  assert.deepEqual(replies.map(reply => reply.id), [1, 2])
  assert.equal(refreshed, 1)
  assert.equal(JSON.parse(await readFile(credentials, 'utf8')).refresh_token, 'new-refresh')
  const input = join(home, 'authorized-evidence.csv')
  const evidence = 'legal_name,gross_sales\nSynthetic Example LLC,12345\n'
  await writeFile(input, evidence)
  const uploader = start(['upload', input])
  let receipt = ''
  uploader.stdout.on('data', chunk => { receipt += chunk })
  uploader.stderr.on('data', chunk => { errors += chunk })
  assert.equal((await once(uploader, 'close'))[0], 0)
  assert.equal(transferred.toString(), evidence)
  assert.equal(JSON.parse(receipt).caseId, 'saved-case')
  assert.doesNotMatch(output + receipt + errors, /old-access|new-access|new-refresh/)
  console.log('PASS streaming stdio, notification, refresh rotation, real local-file transfer and credential non-disclosure')
} finally { child.kill(); server.closeAllConnections(); server.close() }
