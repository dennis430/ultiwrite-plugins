#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--redirects', '--output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: node prepare-oauth-registration.mjs --redirects EXACT_CALLBACKS_JSON --output REGISTRATION_JSON');
  if (options[args[i]]) throw new Error(`Duplicate option: ${args[i]}`);
  options[args[i]] = args[i + 1];
}
if (!options['--redirects'] || !options['--output']) throw new Error('Both --redirects and --output are required. Input is a JSON array copied from this app in Google Connected Console.');
const redirects = JSON.parse(await readFile(options['--redirects'], 'utf8'));
const hosts = new Set(['oauth-redirect.googleusercontent.com', 'oauth-redirect-sandbox.googleusercontent.com', 'oauth-redirect-test.googleusercontent.com']);
if (!Array.isArray(redirects) || !redirects.length || redirects.length > 6) throw new Error('Supply the one to six exact app-specific callback URIs shown by Google.');
for (const redirect of redirects) {
  if (typeof redirect !== 'string' || redirect !== redirect.trim()) throw new Error('Each callback must be an exact URL string.');
  const url = new URL(redirect);
  if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password || url.port || url.search || url.hash || !/^\/[ra]\/[A-Za-z0-9._-]+$/.test(url.pathname) || /YOUR_|REPLACE|PLACEHOLDER/i.test(url.pathname)) {
    throw new Error('Callback must be an exact Google Connected Apps HTTPS URI in a documented /r/ or /a/ family, with no wildcard, credentials, query or fragment. Verify any different future form against current Google docs.');
  }
}
const request = {
  client_name: 'Ultiwrite for Google Connected Apps',
  client_uri: 'https://dwsoffshorepartners.com',
  redirect_uris: [...new Set(redirects)],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
  scope: 'ultiwrite:read ultiwrite:evidence'
};
await writeFile(options['--output'], `${JSON.stringify(request, null, 2)}\n`, { flag: 'wx' });
process.stdout.write('Prepared registration request. Add these exact URIs to the authorized server allowlist before registering the client. No registration or production change was performed.\n');
