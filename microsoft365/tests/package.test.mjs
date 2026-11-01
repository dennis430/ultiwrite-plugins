import test from 'node:test';
import assert from 'node:assert/strict';
import { unzipSync } from 'fflate';
import { service, parseEnv, environmentName, ensureProvisioned, sourceFixture, renderManifests, substitute, deterministicZip, sourceEntries, publicRegistrationRequest, checkRegistrationResult, validateDiscovery } from '../scripts/lib.mjs';

test('release rendering refuses unprovisioned configuration and schema fixtures', async () => {
  await assert.rejects(renderManifests({}), /Missing real ULTIWRITE_MCP_CLIENT_ID/);
  assert.throws(() => ensureProvisioned({ ...sourceFixture, ULTIWRITE_MCP_CLIENT_ID: 'public-schema-test-client' }), /Missing provisioned TEAMS_APP_ID/);
  assert.throws(() => ensureProvisioned({ TEAMS_APP_ID: 'f4bedde6-e4d5-4bdb-a8b4-dd3cfa46e490', ULTIWRITE_MCP_CLIENT_ID: 'public-schema-test-client', ULTIWRITE_MCP_AUTH_ID: sourceFixture.ULTIWRITE_MCP_AUTH_ID, APP_NAME_SUFFIX: '' }), /Missing real ULTIWRITE_MCP_AUTH_ID/);
});

test('source rendering resolves the local instructions and only expected manifest variables', async () => {
  const result = await renderManifests(sourceFixture, { sourceOnly: true });
  assert.equal(result.app.id, sourceFixture.TEAMS_APP_ID);
  assert.equal(result.plugin.runtimes[0].auth.reference_id, sourceFixture.ULTIWRITE_MCP_AUTH_ID);
  assert.ok(result.agent.instructions.startsWith('You are Ultiwrite'));
  assert.equal(result.agent.instructions.includes('$[file('), false);
  assert.throws(() => substitute('${{UNEXPECTED_ID}}', { UNEXPECTED_ID: 'value' }), /Unexpected manifest variable/);
});

test('environment names cannot escape the local configuration directory', () => {
  assert.equal(environmentName(['--env', 'review']), 'review');
  for (const name of ['../../production', '/tmp/test', 'review\nOTHER=value', 'DEV', 'a'.repeat(25)]) assert.throws(() => environmentName(['--env', name]));
  assert.throws(() => environmentName(['--other', 'dev']));
});

test('environment parser preserves empty values but rejects interpolation, duplicate keys, and shell statements', () => {
  assert.deepEqual(parseEnv('# comment\nAPP_NAME_SUFFIX=\nTEAMSFX_ENV="dev"\n'), { APP_NAME_SUFFIX: '', TEAMSFX_ENV: 'dev' });
  assert.throws(() => parseEnv('TEAMSFX_ENV=dev\nTEAMSFX_ENV=prod'), /Duplicate/);
  assert.throws(() => parseEnv('export TEAMSFX_ENV=dev'), /unsupported line/);
  assert.throws(() => parseEnv('TEAMSFX_ENV=${UNTRUSTED}'), /Unsupported interpolation/);
});

test('public registration requests exact Microsoft redirect and secretless authorization code flow', () => {
  const body = publicRegistrationRequest();
  assert.deepEqual(body.redirect_uris, [service.redirect]);
  assert.equal(body.token_endpoint_auth_method, 'none');
  assert.deepEqual(body.grant_types, ['authorization_code', 'refresh_token']);
  assert.equal(body.scope, 'ultiwrite:read ultiwrite:evidence');
  assert.equal(Object.keys(body).some(key => /secret|password|access_token/.test(key)), false);
});

test('registration response is rejected if callback or authentication method changes', () => {
  const valid = { client_id: 'public-schema-test-client', redirect_uris: [service.redirect], token_endpoint_auth_method: 'none' };
  assert.equal(checkRegistrationResult(valid), valid.client_id);
  assert.throws(() => checkRegistrationResult({ ...valid, redirect_uris: ['https://example.org/callback'] }), /exact Microsoft callback/);
  assert.throws(() => checkRegistrationResult({ ...valid, token_endpoint_auth_method: 'basic' }), /public OAuth client/);
});

test('discovery binds public PKCE configuration to the canonical resource and issuer', () => {
  const resource = { resource: service.resource, authorization_servers: [service.origin] };
  const auth = { issuer: service.origin, authorization_endpoint: service.authorization, token_endpoint: service.token, registration_endpoint: service.registration, code_challenge_methods_supported: ['S256'], token_endpoint_auth_methods_supported: ['none'], scopes_supported: service.scopes };
  assert.equal(validateDiscovery(resource, auth).pkce, 'S256');
  assert.throws(() => validateDiscovery({ ...resource, resource: 'https://example.org/mcp' }, auth), /canonical/);
  assert.throws(() => validateDiscovery(resource, { ...auth, token_endpoint: 'https://example.org/token' }), /endpoint metadata/);
  assert.throws(() => validateDiscovery(resource, { ...auth, code_challenge_methods_supported: ['plain'] }), /S256/);
});

test('archive bytes are reproducible independently of input enumeration and preserve exact content', () => {
  const first = deterministicZip({ 'b.txt': Buffer.from('second'), 'a.txt': Buffer.from('first') });
  const second = deterministicZip({ 'a.txt': Buffer.from('first'), 'b.txt': Buffer.from('second') });
  assert.deepEqual(first, second);
  assert.deepEqual(Object.keys(unzipSync(first)), ['a.txt', 'b.txt']);
  assert.equal(Buffer.from(unzipSync(first)['a.txt']).toString(), 'first');
});

test('unsafe archive member names cannot be packaged', () => {
  for (const name of ['../escape', '/absolute', 'a/../../escape', 'a\\escape', 'a//b']) assert.throws(() => deterministicZip({ [name]: Buffer.from('test') }), /Unsafe archive member/);
});

test('source archive excludes local tenant state, caches, outputs, and dependency code', async () => {
  const entries = await sourceEntries();
  const names = Object.keys(entries);
  for (const prefix of ['env/', 'node_modules/', '.cache/', 'dist/', 'appPackage/build/']) assert.equal(names.some(name => name.startsWith(prefix)), false);
  assert.ok(names.includes('package-lock.json'));
  assert.ok(names.includes('appPackage/ai-plugin.json'));
  assert.ok(names.includes('docs/reviewer-scenarios.md'));
  const plugin = JSON.parse(Buffer.from(entries['appPackage/ai-plugin.json']).toString());
  assert.equal(plugin.runtimes[0].auth.reference_id, '${{ULTIWRITE_MCP_AUTH_ID}}');
});
