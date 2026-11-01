const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { ServiceClient, selectFiles, safeUploadLink, safeStorageUrl, safeServiceUrl, parseRpc, toolPayload } = require('../out/service');

async function fixture(options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'ultiwrite-vscode-test-'));
  const file = join(directory, 'authorized-evidence.csv');
  const bytes = Buffer.from('legal_name,gross_sales\nSynthetic Example LLC,12345\n');
  await writeFile(file, bytes);
  const received = []; let finalized = 0; let refreshed = 0; let committed; let origin; let initCount = 0; let continuation;
  const server = http.createServer(async (req, res) => {
    const chunks = []; for await (const part of req) chunks.push(part); const data = Buffer.concat(chunks);
    const body = () => JSON.parse(data.toString());
    const json = value => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)); };
    try {
      if (req.url.startsWith('/storage/')) {
        assert.equal(req.headers.authorization, undefined, 'OAuth must never reach object storage');
        received.push(data); res.setHeader('etag', '"part-etag"');
        if (options.storageFails) { res.statusCode = 503; return res.end(); }
        return res.end();
      }
      if (req.url.includes('/staging/presign')) {
        assert.equal(req.headers.authorization, undefined, 'Signed handoff operates without forwarding OAuth');
        const file = body().files[0];
        return json({ files: [{ fileName: options.mismatch ? 'different.csv' : file.name, size: file.size, contentType: file.contentType, uploadId: 'synthetic', bindingToken: 'signed-receipt', expiresAt: Date.now() + 60000, mode: options.multipart ? 'multipart' : 'single', partSize: 20, multipartId: 'parts', uploadUrl: origin + '/storage/whole' }] });
      }
      if (req.url.includes('/staging/parts')) return json({ urls: body().partNumbers.map(partNumber => ({ partNumber, url: origin + '/storage/' + partNumber })) });
      if (req.url.includes('/staging/complete')) {
        if (options.multipart) assert.equal(body().parts.length, Math.ceil(bytes.length / 20));
        return json({ ok: true });
      }
      if (req.url.startsWith('/api/integrations/ultiwrite/upload?')) { finalized++; committed = body(); return json({ ok: true, caseId: 'synthetic-case', state: 'processing' }); }
      const message = body();
      if (req.headers.authorization === 'Bearer expired') { res.statusCode = 401; return json({ message: 'never reflect sensitive server bodies' }); }
      assert.equal(req.headers.authorization, 'Bearer authorized');
      if (message.method === 'initialize') { initCount++; res.setHeader('mcp-session-id', 'fixture-session'); return json({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: '2025-03-26' } }); }
      assert.equal(req.headers['mcp-session-id'], 'fixture-session');
      if (!message.id) { res.statusCode = 202; return res.end(); }
      continuation = message.params.arguments;
      const payload = { uploadLink: options.foreignLink ? 'https://unexpected.invalid/api/integrations/ultiwrite/upload?t=secret' : origin + '/api/integrations/ultiwrite/upload?t=fixture-handoff' };
      return json({ jsonrpc: '2.0', id: message.id, result: { isError: true, content: [{ type: 'text', text: JSON.stringify(payload) }] } });
    } catch (error) { res.statusCode = 500; res.end(error.message); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  const client = new ServiceClient(async (_signal, refresh) => { if (refresh) refreshed++; return options.expired && !refreshed ? 'expired' : 'authorized'; }, fetch, origin);
  return { client, file, bytes, received, state: () => ({ finalized, refreshed, committed, initCount, continuation }), close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); } };
}

test('actual selected bytes reach single storage; refresh rotates; explicit DF false survives', async () => {
  const f = await fixture({ expired: true });
  try {
    const result = await f.client.upload(await selectFiles([f.file]), false, () => {});
    assert.equal(result.caseId, 'synthetic-case');
    assert.deepEqual(Buffer.concat(f.received), f.bytes);
    assert.equal(f.state().finalized, 1); assert.equal(f.state().refreshed, 1); assert.equal(f.state().initCount, 1);
    assert.equal(f.state().committed.documentForensics, false); assert.equal(f.state().continuation.documentForensics, false);
    assert.equal(f.state().committed.files[0].bindingToken, 'signed-receipt');
  } finally { await f.close(); }
});

test('multipart chunks reassemble exactly and true DF is preserved', async () => {
  const f = await fixture({ multipart: true });
  try { await f.client.upload(await selectFiles([f.file]), true, () => {}); assert.deepEqual(Buffer.concat(f.received), f.bytes); assert.equal(f.state().committed.documentForensics, true); assert.equal(f.state().finalized, 1); }
  finally { await f.close(); }
});

test('service transport preserves omission; UI separately requires explicit DF because current staging server coerces omission', async () => {
  const f = await fixture();
  try { await f.client.upload(await selectFiles([f.file]), undefined, () => {}); assert.equal('documentForensics' in f.state().committed, false); assert.equal('documentForensics' in f.state().continuation, false); }
  finally { await f.close(); }
});

test('storage failure never commits a partial evidence submission', async () => {
  const f = await fixture({ storageFails: true });
  try { await assert.rejects(f.client.upload(await selectFiles([f.file]), false, () => {}), /did not reach storage/); assert.equal(f.state().finalized, 0); }
  finally { await f.close(); }
});

test('mismatched upload plan transfers nothing and does not start analysis', async () => {
  const f = await fixture({ mismatch: true });
  try { await assert.rejects(f.client.upload(await selectFiles([f.file]), false, () => {}), /metadata/); assert.equal(f.received.length, 0); assert.equal(f.state().finalized, 0); }
  finally { await f.close(); }
});

test('a cross-origin upload handoff is refused before any file leaves the computer', async () => {
  const f = await fixture({ foreignLink: true });
  try { await assert.rejects(f.client.upload(await selectFiles([f.file]), false, () => {}), /outside Ultiwrite/); assert.equal(f.received.length, 0); assert.equal(f.state().finalized, 0); }
  finally { await f.close(); }
});

test('file mutation after selection blocks upload and final submission', async () => {
  const f = await fixture();
  try { const files = await selectFiles([f.file]); await writeFile(f.file, 'changed'); await assert.rejects(f.client.upload(files, false, () => {}), /changed before upload/); assert.equal(f.received.length, 0); assert.equal(f.state().finalized, 0); }
  finally { await f.close(); }
});

test('cancellation before submission leaves the server untouched', async () => {
  const f = await fixture();
  try { const controller = new AbortController(); controller.abort(); await assert.rejects(f.client.upload(await selectFiles([f.file]), false, () => {}, controller.signal)); assert.equal(f.state().initCount, 0); assert.equal(f.state().finalized, 0); }
  finally { await f.close(); }
});

test('service links reject hostile schemes, credentials, invalid handoff path and absent token', () => {
  assert.throws(() => safeServiceUrl('javascript:alert(1)'));
  assert.throws(() => safeServiceUrl('https://user:password@dwsoffshorepartners.com/report'));
  assert.throws(() => safeUploadLink('https://dwsoffshorepartners.com/api/other?t=x'));
  assert.throws(() => safeUploadLink('https://dwsoffshorepartners.com/api/integrations/ultiwrite/upload'));
  assert.throws(() => safeStorageUrl('http://untrusted.example/file'));
  assert.equal(safeStorageUrl('https://storage.example/file?signed=opaque').protocol, 'https:');
});

test('SSE result parsing selects matching request and preserves multiline data', () => {
  const text = 'event: message\ndata: {"jsonrpc":"2.0","id":2,"result":{"ignored":true}}\n\n' + 'data: {"jsonrpc":"2.0",\ndata: "id":1,"result":{"valid":true}}\n\n';
  assert.deepEqual(parseRpc(text, 'text/event-stream', 1), { valid: true });
  assert.throws(() => parseRpc('{"jsonrpc":"2.0","id":2,"result":{}}', 'application/json', 1));
  assert.deepEqual(toolPayload({ structuredContent: { caseId: 'c' } }), { caseId: 'c' });
});

test('follow-up advances only the returned existing case and stops on a saved report', async () => {
  let continued = 0;
  const calls = [];
  const client = new ServiceClient(async () => 'fixture-access', async (_url, request) => {
    const rpc = JSON.parse(request.body);
    if (rpc.method === 'notifications/initialized') return new Response(null, { status: 202 });
    let result;
    if (rpc.method === 'initialize') result = { protocolVersion: '2025-03-26' };
    else {
      calls.push(rpc.params);
      if (rpc.params.name === 'ultiwrite_evidence_submit') { continued++; result = { structuredContent: { caseId: 'same-case', status: 'processing' } }; }
      else result = { structuredContent: continued ? { workflowStatus: 'completed', linkedReportId: 'saved-report' } : { workflowStatus: 'processing', continuation: { tool: 'ultiwrite_evidence_submit', caseId: 'same-case' } } };
    }
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result }), { headers: { 'content-type': 'application/json' } });
  });
  const result = await client.followCase('same-case', () => {}, new AbortController().signal, 1, 3000);
  assert.equal(result.linkedReportId, 'saved-report');
  assert.equal(continued, 1);
  assert.deepEqual(calls.filter(call => call.name === 'ultiwrite_evidence_submit').map(call => call.arguments), [{ caseId: 'same-case' }]);
});

test('a foreign case continuation cannot redirect follow-up work', async () => {
  let writes = 0;
  const client = new ServiceClient(async () => 'fixture-access', async (_url, request) => {
    const rpc = JSON.parse(request.body);
    if (rpc.method === 'notifications/initialized') return new Response(null, { status: 202 });
    if (rpc.params?.name === 'ultiwrite_evidence_submit') writes++;
    const result = rpc.method === 'initialize' ? { protocolVersion: '2025-03-26' } : { structuredContent: { workflowStatus: 'processing', continuation: { tool: 'ultiwrite_evidence_submit', caseId: 'other-case' } } };
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result }), { headers: { 'content-type': 'application/json' } });
  });
  await client.followCase('same-case', () => {}, new AbortController().signal, 1, 15);
  assert.equal(writes, 0);
});

test('analysis continuation and upload finalization receive the backend 300-second request budget', async t => {
  const budgets = [];
  t.mock.method(AbortSignal, 'timeout', value => { budgets.push(value); return new AbortController().signal; });
  const f = await fixture();
  try {
    await f.client.upload(await selectFiles([f.file]), true, () => {});
    assert.ok(budgets.includes(45000), 'read calls remain bounded');
    assert.ok(budgets.filter(value => value === 300000).length >= 3, 'evidence handoff, object PUT and engine finalization have long-operation budgets');
  } finally { await f.close(); }
});

test('an old account response is rejected after reset and cannot overwrite the new account identity', async () => {
  let current = 'account-a'; let release; let oldRequestStarted;
  const started = new Promise(resolve => { oldRequestStarted = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  const client = new ServiceClient(async () => current, async (_url, request) => {
    const rpc = JSON.parse(request.body);
    if (rpc.method === 'notifications/initialized') return new Response(null, { status: 202 });
    let result = { protocolVersion: '2025-03-26' };
    if (rpc.method === 'tools/call') {
      const identity = request.headers.authorization;
      if (identity === 'Bearer account-a') { oldRequestStarted(); await held; }
      result = { structuredContent: { account: { email: identity === 'Bearer account-a' ? 'a@example.invalid' : 'b@example.invalid' } } };
    }
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result }), { headers: { 'content-type': 'application/json' } });
  });
  const old = client.call('ultiwrite_account_get'); void old.catch(() => {});
  await started; client.reset(); current = 'account-b';
  const fresh = await client.call('ultiwrite_account_get'); assert.equal(fresh.account.email, 'b@example.invalid');
  release(); await assert.rejects(old, /account connection changed/);
});
