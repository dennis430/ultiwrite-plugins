import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { mcpUrl, credentialPath, redact } from '../lib/pure.mjs'
import { requestHeaders } from '../lib/transport.mjs'
import { discover } from '../lib/oauth.mjs'

test('new connections use the clean resource; historical issuer and default credentials remain valid', () => {
  assert.equal(mcpUrl(), 'https://mcp.dwsoffshorepartners.com/mcp')
  assert.equal(mcpUrl('https://dwsoffshorepartners.com'), 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp')
  assert.equal(credentialPath({ ULTIWRITE_HOME: '/tmp/example' }), '/tmp/example/.config/ultiwrite/credentials.json')
  assert.notEqual(credentialPath({ ULTIWRITE_HOME: '/tmp/example' }, 'second'), credentialPath({ ULTIWRITE_HOME: '/tmp/example' }))
  assert.throws(() => credentialPath({}, '../escape'))
  assert.deepEqual(redact({ nested: [{ access_token: 'secret', refresh_token: 'secret2' }] }), { nested: [{ access_token: '[redacted]', refresh_token: '[redacted]' }] })
})

test('modern names and resource URIs use MCP base64 sentinel encoding without corrupting the body', () => {
  const message = { method: 'resources/read', params: { uri: 'file:///évidence', _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' } } }
  const headers = requestHeaders(message)
  assert.equal(headers['mcp-name'], `=?base64?${Buffer.from(message.params.uri).toString('base64')}?=`)
  assert.equal(headers['mcp-method'], 'resources/read')
  assert.equal(headers['mcp-protocol-version'], '2026-07-28')
  assert.equal(requestHeaders({ method: 'tools/call', params: { ...message.params, name: ' padded ' } })['mcp-name'], '=?base64?IHBhZGRlZCA=?=')
})

test('OAuth discovery validates audience, issuer, PKCE and endpoint origins before sending credentials', async () => {
  let mode = 'valid', issuer
  const server = createServer((req, res) => {
    res.setHeader('content-type', 'application/json')
    const resource = `${issuer}/api/integrations/ultiwrite/mcp`
    res.end(JSON.stringify(req.url.startsWith('/.well-known/oauth-protected-resource')
      ? { resource: mode === 'audience' ? `${issuer}/other` : resource, authorization_servers: [issuer] }
      : { issuer: mode === 'issuer' ? 'https://other.example' : issuer, code_challenge_methods_supported: mode === 'pkce' ? ['plain'] : ['S256'],
        authorization_endpoint: `${issuer}/consent`, registration_endpoint: `${issuer}/registration`, token_endpoint: mode === 'token' ? 'https://other.example/token' : `${issuer}/tokens` }))
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  issuer = `http://127.0.0.1:${server.address().port}`
  try {
    assert.equal((await discover(issuer)).token_endpoint, `${issuer}/tokens`)
    for (mode of ['audience', 'issuer', 'pkce', 'token']) await assert.rejects(discover(issuer), /OAuth/)
  } finally { server.closeAllConnections(); server.close() }
})

test('bridge forwards progress before an SSE result, preserves legacy session/version, and does not wait for EOF', { timeout: 10000 }, async () => {
  const home = await mkdtemp(join(tmpdir(), 'ultiwrite-sse-'))
  await mkdir(join(home, '.config/ultiwrite'), { recursive: true })
  const seen = []
  const server = createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const message = JSON.parse(Buffer.concat(chunks))
    seen.push({ method: message.method, headers: req.headers })
    res.setHeader('content-type', 'application/json')
    if (message.method === 'initialize') {
      res.setHeader('Mcp-Session-Id', 'synthetic-session')
      return res.end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: '2025-11-25' } }))
    }
    if (message.id === undefined) { res.statusCode = 202; return res.end() }
    res.setHeader('content-type', 'text/event-stream')
    res.write(': heartbeat\r\n\r\n')
    res.write('event: message\r\ndata: {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"test","progress":1}}\r\n\r\n')
    // Data fields form a single event; split both an event and a UTF-8 character across chunks.
    res.write('data: {"jsonrpc":"2.0",\r\ndata: "id":2,"result":{"text":"')
    const text = Buffer.from('évidence')
    res.write(text.subarray(0, 1))
    setTimeout(() => { res.write(text.subarray(1)); res.write('"}}\r\n\r\n') }, 20)
    // Deliberately keep the HTTP response open after the result.
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const issuer = `http://127.0.0.1:${server.address().port}`
  await writeFile(join(home, '.config/ultiwrite/credentials.json'), JSON.stringify({ access_token: 'fixture-secret', issuer }))
  const child = spawn(process.execPath, [new URL('../bin/ultiwrite-mcp.js', import.meta.url).pathname, 'stdio'], { env: { ...process.env, ULTIWRITE_HOME: home } })
  let output = '', errors = ''
  child.stdout.on('data', b => { output += b })
  child.stderr.on('data', b => { errors += b })
  try {
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } }) + '\n')
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n')
    const deadline = Date.now() + 2500
    while (!output.includes('évidence') && Date.now() < deadline) await new Promise(r => setTimeout(r, 20))
    assert.match(output, /notifications\/progress/, 'progress must arrive while the stream remains open')
    assert.match(output, /évidence/, 'the matching result must arrive without waiting for EOF')
    assert.equal(seen[2].headers['mcp-session-id'], 'synthetic-session')
    assert.equal(seen[2].headers['mcp-protocol-version'], '2025-11-25')
    assert.doesNotMatch(output + errors, /fixture-secret/)
    child.stdin.end()
    assert.equal((await once(child, 'close'))[0], 0)
  } finally {
    child.kill(); server.closeAllConnections(); server.close(); await rm(home, { recursive: true, force: true })
  }
})
