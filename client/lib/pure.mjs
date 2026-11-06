import { createHash, randomBytes } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const DEFAULT_ORIGIN = 'https://mcp.dwsoffshorepartners.com'
// Retain the original public resource for saved grants and alternate issuers.
export const LEGACY_MCP_URL = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
export const MCP_PATH = new URL(LEGACY_MCP_URL).pathname
export const REDIRECT_URI = 'http://127.0.0.1:6274/oauth/callback'
export const IOS_REDIRECT_URI = 'ultiwrite://oauth/callback'

export function mcpUrl(origin = DEFAULT_ORIGIN) {
  return new URL(new URL(origin).origin === DEFAULT_ORIGIN ? '/mcp' : MCP_PATH, origin).href
}

export function credentialPath(env = process.env, profile = 'default') {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(profile)) throw new Error('Invalid account profile. Use letters, numbers, hyphens or underscores.')
  const home = env.ULTIWRITE_HOME || env.HOME || homedir()
  return join(home, '.config', 'ultiwrite', profile === 'default' ? 'credentials.json' : `credentials-${profile}.json`)
}

export function pkce() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge, method: 'S256' }
}

export function redact(value) {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redact)
  return Object.fromEntries(Object.entries(value).map(([key, item]) =>
    [key, /^(access_token|refresh_token|token|authorization|client[_]secret|bindingToken)$/i.test(key) ? '[redacted]' : redact(item)]))
}

export function clientConfig(origin = DEFAULT_ORIGIN) {
  const url = mcpUrl(origin)
  return {
    claude: { mcpServers: { ultiwrite: { type: 'http', url } } },
    cursor: { mcpServers: { ultiwrite: { type: 'streamable-http', url } } },
    generic: { mcpServers: { ultiwrite: { type: 'streamable-http', url } } },
  }
}

export function expectedDoctor(origin = DEFAULT_ORIGIN) {
  return {
    ok: true,
    offline: true,
    endpoint: mcpUrl(origin),
    issuer: origin,
    scopes: ['ultiwrite:read', 'ultiwrite:evidence'],
    redirectUri: REDIRECT_URI,
    package: 'ultiwrite-mcp@0.8.0',
  }
}
