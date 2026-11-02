#!/usr/bin/env node
// This helper registers a public OAuth client only when --register is explicit.
// It grants no user access and never creates a Microsoft tenant configuration.
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const body = JSON.parse(await readFile(resolve(root, 'oauth-registration.json'), 'utf8'));
const discoveryUrl = 'https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server';
const resourceUrl = 'https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp';
const expectedServer = 'https://mcp.dwsoffshorepartners.com/mcp';
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output') { if (!args[++i]) throw new Error('--output needs a filename'); }
  else if (args[i] !== '--register') throw new Error(`Unknown argument: ${args[i]}`);
}
if (!args.includes('--register')) {
  console.log(JSON.stringify({ action: 'preview-only', discoveryUrl, request: body, next: 'Run with --register after choosing the intended Microsoft publication account. Reuse the returned public client ID for static OAuth configuration.' }, null, 2));
  process.exit(0);
}
const outputFlag = args.indexOf('--output');
const output = resolve(outputFlag >= 0 ? args[outputFlag + 1] : resolve(root, 'microsoft-oauth.local.json'));
try { await access(output); throw new Error(`Output already exists: ${output}. Reuse that registration instead of creating another.`); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Request failed: HTTP ${response.status} at ${url}`);
  return response.json();
}
const [metadata, resource] = await Promise.all([jsonRequest(discoveryUrl), jsonRequest(resourceUrl)]);
if (metadata.issuer !== 'https://mcp.dwsoffshorepartners.com'
  || metadata.registration_endpoint !== 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register'
  || metadata.authorization_endpoint !== 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize'
  || metadata.token_endpoint !== 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token'
  || !metadata.token_endpoint_auth_methods_supported?.includes('none')
  || !metadata.code_challenge_methods_supported?.includes('S256')
  || resource.resource !== expectedServer
  || !resource.authorization_servers?.includes(metadata.issuer)) {
  throw new Error('Live OAuth metadata changed. Review the publisher configuration before registering.');
}
const registered = await jsonRequest(metadata.registration_endpoint, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
if (typeof registered.client_id !== 'string' || !registered.client_id || registered.token_endpoint_auth_method !== 'none') {
  throw new Error('The server did not return the expected public OAuth client registration.');
}
const config = {
  createdAt: new Date().toISOString(),
  registrationMode: 'static-public-pkce',
  publicClientId: registered.client_id,
  microsoftCallback: body.redirect_uris[0],
  baseUrl: expectedServer,
  authorizationEndpoint: metadata.authorization_endpoint,
  tokenEndpoint: metadata.token_endpoint,
  refreshEndpoint: metadata.token_endpoint,
  scopes: 'ultiwrite:read ultiwrite:evidence',
  pkce: true,
  microsoftOrgRestriction: 'Any Microsoft 365 organization for public distribution; own organization for development',
  microsoftAppRestriction: 'Any Teams app',
};
await writeFile(output, JSON.stringify(config, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
console.log(`Public OAuth client registered. Configuration saved at ${output}. No user consent, access token, Microsoft tenant configuration or marketplace submission was performed.`);
