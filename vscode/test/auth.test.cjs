const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { AuthController } = require('../out/auth');
const { MCP_PATH } = require('../out/service');

async function authFixture(options = {}) {
  const data = new Map(); let origin; let browserUrl; let storedClient; let refreshes = 0; let revoked = false;
  const storage = { get: async key => data.get(key), store: async (key, value) => data.set(key, value), delete: async key => data.delete(key) };
  let unblockRefresh; const refreshWait = new Promise(resolve => { unblockRefresh = resolve; });
  const server = http.createServer(async (req, res) => {
    const buffers = []; for await (const value of req) buffers.push(value); const raw = Buffer.concat(buffers).toString();
    const json = value => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value)); };
    if (req.url === '/.well-known/oauth-protected-resource') return json({ resource: origin + MCP_PATH });
    if (req.url === '/.well-known/oauth-authorization-server') return json({ issuer: origin, authorization_endpoint: origin + '/authorize', token_endpoint: origin + '/token', registration_endpoint: origin + '/register', code_challenge_methods_supported: ['S256'] });
    if (req.url === '/register') { storedClient = JSON.parse(raw); assert.equal(storedClient.application_type, 'native'); assert.equal(storedClient.token_endpoint_auth_method, 'none'); return json({ client_id: 'fixture-client' }); }
    if (req.url === '/token') {
      const params = new URLSearchParams(raw);
      assert.equal(params.get('client_id'), 'fixture-client'); assert.equal(params.get('resource'), origin + MCP_PATH);
      if (params.get('grant_type') === 'refresh_token') {
        refreshes++; assert.equal(params.get('refresh_token'), 'fixture-refresh');
        if (options.holdRefresh) await refreshWait;
        return json({ access_token: 'renewed-access', refresh_token: 'rotated-refresh', token_type: 'Bearer', expires_in: 3600 });
      }
      assert.equal(params.get('redirect_uri'), storedClient.redirect_uris[0]);
      assert.equal(createHash('sha256').update(params.get('code_verifier')).digest('base64url'), browserUrl.searchParams.get('code_challenge'));
      return json({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'Bearer', scope: 'ultiwrite:read ultiwrite:evidence' });
    }
    if (req.url === '/api/integrations/ultiwrite/oauth/revoke') { revoked = true; return json({}); }
    res.statusCode = 404; res.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = 'http://127.0.0.1:' + server.address().port;
  const open = async url => {
    browserUrl = new URL(url);
    const callback = new URL(browserUrl.searchParams.get('redirect_uri'));
    callback.searchParams.set('state', 'wrong-state'); callback.searchParams.set('iss', origin); callback.searchParams.set('code', 'fixture-code');
    const wrong = await fetch(callback); assert.equal(wrong.status, 400); await wrong.text();
    callback.searchParams.set('state', browserUrl.searchParams.get('state'));
    callback.searchParams.set('iss', options.badIssuer ? 'https://unexpected.invalid' : origin);
    const right = await fetch(callback); await right.text();
    return true;
  };
  const auth = new AuthController(storage, open, () => {}, fetch, origin);
  return { auth, data, state: () => ({ browserUrl, refreshes, revoked }), unblockRefresh, close: async () => { auth.dispose(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}

test('OAuth uses real loopback callback, state validation, S256 and resource binding; only the SecretStorage adapter receives credentials', async () => {
  const f = await authFixture();
  try {
    const session = await f.auth.signIn();
    assert.equal(session.accessToken, 'fixture-access');
    assert.equal(f.data.size, 1);
    assert.match(f.state().browserUrl.searchParams.get('redirect_uri'), /^http:\/\/127\.0\.0\.1:\d+\/callback$/);
    assert.equal(f.state().browserUrl.searchParams.get('scope'), 'ultiwrite:read ultiwrite:evidence');
    assert.equal(await f.auth.token(), 'fixture-access');
    await f.auth.disconnect(); assert.equal(f.data.size, 0); assert.equal(f.state().revoked, true);
  } finally { await f.close(); }
});

test('unexpected OAuth issuer never persists a connection', async () => {
  const f = await authFixture({ badIssuer: true });
  try { await assert.rejects(f.auth.signIn(), /did not come from Ultiwrite/); assert.equal(f.data.size, 0); }
  finally { await f.close(); }
});

test('concurrent token refreshes are serialized and rotate refresh tokens', async () => {
  const f = await authFixture();
  try {
    await f.auth.signIn();
    const tokens = await Promise.all([f.auth.token(undefined, true), f.auth.token(undefined, true), f.auth.token(undefined, true)]);
    assert.deepEqual(tokens, ['renewed-access', 'renewed-access', 'renewed-access']);
    assert.equal(f.state().refreshes, 1); assert.equal((await f.auth.saved()).refreshToken, 'rotated-refresh');
  } finally { await f.close(); }
});

test('disconnect during an in-flight refresh cannot resurrect the old account', async () => {
  const f = await authFixture({ holdRefresh: true });
  try {
    await f.auth.signIn();
    const pending = f.auth.token(undefined, true); void pending.catch(() => {});
    const deadline = Date.now() + 3000;
    while (!f.state().refreshes && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(f.state().refreshes, 1);
    await f.auth.disconnect(false); f.unblockRefresh();
    await assert.rejects(pending); assert.equal(await f.auth.saved(), undefined);
  } finally { f.unblockRefresh(); await f.close(); }
});

test('stored credentials for an unexpected issuer are discarded', async () => {
  const f = await authFixture();
  try { await f.auth.signIn(); const [key, json] = [...f.data][0]; f.data.set(key, JSON.stringify({ ...JSON.parse(json), issuer: 'https://unexpected.invalid' })); assert.equal(await f.auth.saved(), undefined); assert.equal(f.data.size, 0); }
  finally { await f.close(); }
});

for (const operation of ['saved', 'token']) test(`delayed ${operation} reads cannot return an account replaced during SecretStorage access`, async () => {
  const issuer = 'https://dwsoffshorepartners.com';
  const value = accessToken => JSON.stringify({ issuer, accessToken, clientId: 'fixture-client', expiresAt: Date.now() + 3_600_000, scopes: ['ultiwrite:read'] });
  let stored = value('account-a'); let held = true; let release;
  const waiting = new Promise(resolve => { release = resolve; });
  const storage = {
    get: async () => { const snapshot = stored; if (held) { held = false; await waiting; } return snapshot; },
    store: async (_key, raw) => { stored = raw; },
    delete: async () => { stored = undefined; },
  };
  const auth = new AuthController(storage, async () => { throw new Error('Browser must not open during this race'); });
  try {
    const oldRead = auth[operation](); void oldRead.catch(() => {});
    await auth.disconnect(false);
    stored = value('account-b');
    release();
    if (operation === 'token') await assert.rejects(oldRead, /connection changed/);
    else assert.equal((await oldRead).accessToken, 'account-b');
    assert.equal(await auth.token(), 'account-b');
  } finally { release(); auth.dispose(); }
});
