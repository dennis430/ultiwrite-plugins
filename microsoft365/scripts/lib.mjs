import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { zipSync } from 'fflate';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const require = createRequire(import.meta.url);
export const service = Object.freeze({
  origin: 'https://dwsoffshorepartners.com',
  resource: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp',
  authorization: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize',
  token: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token',
  registration: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register',
  redirect: 'https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect',
  scopes: ['ultiwrite:read', 'ultiwrite:evidence'],
});
export const templateKeys = ['TEAMS_APP_ID', 'ULTIWRITE_MCP_AUTH_ID', 'APP_NAME_SUFFIX'];
export const sourceFixture = Object.freeze({
  TEAMS_APP_ID: '12345678-1234-4234-8234-123456789abc',
  ULTIWRITE_MCP_AUTH_ID: 'source-schema-validation-only',
  APP_NAME_SUFFIX: '-dev',
});
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
export const jsonBytes = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
export function environmentName(args = process.argv.slice(2)) {
  assert(args.length === 0 || (args.length === 2 && args[0] === '--env'), 'Usage: --env dev (or another lowercase environment name)');
  const name = args[1] ?? 'dev';
  assert(/^[a-z][a-z0-9-]{0,19}$/.test(name), 'Environment names must be up to 20 lowercase letters, digits, or hyphens; no paths.');
  return name;
}
export function envPath(name) { return join(root, 'env', `.env.${environmentName(['--env', name])}`); }
export function parseEnv(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    assert(match, 'Environment file contains an unsupported line. Use KEY=value without shell commands.');
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    assert(!value.includes('\0') && !value.includes('${') && !value.includes('$(') && !value.includes('`'), `Unsupported interpolation in ${match[1]}.`);
    assert(!Object.hasOwn(result, match[1]), `Duplicate environment variable ${match[1]}.`);
    result[match[1]] = value;
  }
  return result;
}
export async function loadEnvironment(name, { optional = false } = {}) {
  try { return parseEnv(await readFile(envPath(name), 'utf8')); }
  catch (error) {
    if (optional && error.code === 'ENOENT') return {};
    if (error.code === 'ENOENT') throw new Error(`Run npm run setup -- --env ${name} first.`);
    throw error;
  }
}
export async function saveEnvironment(name, values) {
  await mkdir(join(root, 'env'), { recursive: true, mode: 0o700 });
  const lines = Object.entries(values).map(([key, value]) => {
    assert(/^[A-Z][A-Z0-9_]*$/.test(key) && typeof value === 'string' && !/[\r\n\0]/.test(value), 'Unsafe environment value.');
    return `${key}=${value}`;
  });
  await writeFile(envPath(name), `# Local tenant configuration. Keep this file out of source control.\n${lines.join('\n')}\n`, { mode: 0o600 });
}
export function ensureClientId(values) {
  const id = values.ULTIWRITE_MCP_CLIENT_ID;
  assert(typeof id === 'string' && /^[A-Za-z0-9._:-]{8,200}$/.test(id) && !/example|placeholder|replace|source-schema|your[-_]/i.test(id),
    'Missing real ULTIWRITE_MCP_CLIENT_ID. After the Teams callback is enabled on the service, run npm run register-client -- --env dev (use your environment name).');
}
export function ensureProvisioned(values) {
  ensureClientId(values);
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(values.TEAMS_APP_ID ?? '') && values.TEAMS_APP_ID !== sourceFixture.TEAMS_APP_ID,
    'Missing provisioned TEAMS_APP_ID. Run npm run provision for this environment.');
  assert(/^[A-Za-z0-9._:-]{8,250}$/.test(values.ULTIWRITE_MCP_AUTH_ID ?? '') && !/example|placeholder|replace|source-schema|your[-_]/i.test(values.ULTIWRITE_MCP_AUTH_ID),
    'Missing real ULTIWRITE_MCP_AUTH_ID from Microsoft OAuth token-store provisioning.');
  assert(typeof values.APP_NAME_SUFFIX === 'string' && /^(-[a-z0-9-]{1,20})?$/.test(values.APP_NAME_SUFFIX), 'Invalid APP_NAME_SUFFIX.');
}
export function substitute(value, values) {
  if (typeof value === 'string') return value.replace(/\$\{\{([A-Z][A-Z0-9_]*)\}\}/g, (_, key) => {
    assert(templateKeys.includes(key), `Unexpected manifest variable ${key}.`);
    assert(typeof values[key] === 'string', `Missing manifest variable ${key}.`);
    return values[key];
  });
  if (Array.isArray(value)) return value.map(item => substitute(item, values));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, substitute(item, values)]));
  return value;
}
export async function renderManifests(values, { sourceOnly = false } = {}) {
  if (!sourceOnly) ensureProvisioned(values);
  const app = substitute(await readJson(join(root, 'appPackage/manifest.json')), values);
  const agent = await readJson(join(root, 'appPackage/declarativeAgent.json'));
  assert(agent.instructions === "$[file('instructions.md')]", 'Only the local instructions.md include is supported.');
  agent.instructions = (await readFile(join(root, 'appPackage/instructions.md'), 'utf8')).trim();
  const plugin = substitute(await readJson(join(root, 'appPackage/ai-plugin.json')), values);
  assert(!JSON.stringify({ app, agent, plugin }).includes('${{'), 'Unresolved manifest variable.');
  return { app, agent, plugin };
}
export function safeArchiveName(name) {
  assert(typeof name === 'string' && !isAbsolute(name) && !name.includes('\\') && !name.split('/').some(part => !part || part === '.' || part === '..') && !name.includes('\0'), 'Unsafe archive member path.');
}
export function deterministicZip(entries) {
  const files = {};
  for (const name of Object.keys(entries).sort()) {
    safeArchiveName(name);
    assert(entries[name] instanceof Uint8Array, `Archive member ${name} is not bytes.`);
    files[name] = [entries[name], { mtime: new Date(1980, 0, 1, 0, 0, 0), os: 3, attrs: 0o100644 << 16 }];
  }
  return zipSync(files, { level: 9 });
}
export async function sourceEntries() {
  const entries = {};
  const topFiles = ['.gitignore', 'README.md', 'LICENSE', 'NOTICE', 'package.json', 'package-lock.json', 'm365agents.yml', 'm365agents.local.yml'];
  for (const name of topFiles) entries[name] = await readFile(join(root, name));
  for (const folder of ['appPackage', 'assets', 'scripts', 'tests', 'docs', 'certification']) {
    async function walk(path) {
      for (const item of await readdir(path, { withFileTypes: true })) {
        if (item.name === 'build' || item.name.startsWith('.')) continue;
        const full = join(path, item.name);
        assert(!item.isSymbolicLink(), 'Source archives cannot contain symlinks.');
        if (item.isDirectory()) await walk(full);
        else {
          const name = relative(root, full).replaceAll('\\', '/');
          safeArchiveName(name);
          assert(/\.(json|md|mjs|png|yml)$/.test(name), `Unexpected source asset ${name}.`);
          entries[name] = await readFile(full);
        }
      }
    }
    await walk(join(root, folder));
  }
  return entries;
}
export async function writeArchive(filename, entries, kind) {
  const bytes = deterministicZip(entries);
  await mkdir(join(root, 'dist'), { recursive: true });
  await writeFile(join(root, 'dist', filename), bytes);
  const inventory = {
    kind, file: filename, sha256: sha256(bytes), bytes: bytes.length,
    members: Object.keys(entries).sort().map(path => ({ path, bytes: entries[path].length, sha256: sha256(entries[path]) })),
  };
  await writeFile(join(root, 'dist', `${filename}.inventory.json`), jsonBytes(inventory));
  await writeFile(join(root, 'dist', `${filename}.sha256`), `${inventory.sha256}  ${filename}\n`);
  return inventory;
}
export async function getJson(url, fetcher = fetch) {
  const response = await fetcher(url, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { accept: 'application/json' } });
  assert(response.ok, `Discovery request returned HTTP ${response.status}: ${url}`);
  return response.json();
}
export function validateDiscovery(resource, auth) {
  assert(resource.resource === service.resource, 'MCP resource metadata does not match the canonical Ultiwrite resource.');
  assert(resource.authorization_servers?.includes(service.origin), 'Protected resource advertises an unexpected issuer.');
  assert(auth.issuer === service.origin, 'OAuth metadata has an unexpected issuer.');
  assert(auth.authorization_endpoint === service.authorization && auth.token_endpoint === service.token && auth.registration_endpoint === service.registration, 'OAuth endpoint metadata changed. Review the service contract before registering.');
  assert(auth.code_challenge_methods_supported?.includes('S256'), 'Server must support S256 PKCE.');
  assert(auth.token_endpoint_auth_methods_supported?.includes('none'), 'Server must support a public OAuth client.');
  for (const scope of service.scopes) assert(auth.scopes_supported?.includes(scope), `Server does not advertise ${scope}.`);
  return { resource: resource.resource, issuer: auth.issuer, pkce: 'S256', clientAuthentication: 'none', scopes: service.scopes };
}
export async function discovery(fetcher = fetch) {
  const [resource, auth] = await Promise.all([
    getJson(`${service.origin}/.well-known/oauth-protected-resource`, fetcher),
    getJson(`${service.origin}/.well-known/oauth-authorization-server`, fetcher),
  ]);
  return validateDiscovery(resource, auth);
}
export function publicRegistrationRequest() {
  return {
    client_name: 'Ultiwrite for Microsoft 365 Copilot',
    redirect_uris: [service.redirect],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    scope: service.scopes.join(' '),
  };
}
export function checkRegistrationResult(body) {
  assert(body.token_endpoint_auth_method === 'none', 'Registration did not return a public OAuth client. Stop and review server compatibility.');
  assert(Array.isArray(body.redirect_uris) && body.redirect_uris.length === 1 && body.redirect_uris[0] === service.redirect, 'Registration response does not confirm the exact Microsoft callback.');
  ensureClientId({ ULTIWRITE_MCP_CLIENT_ID: body.client_id });
  return body.client_id;
}
export function main(run) {
  run().catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
}
