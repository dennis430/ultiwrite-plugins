import { createHash, randomBytes } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const DEFAULT_ORIGIN = 'https://dwsoffshorepartners.com'
export const MCP_PATH = '/api/integrations/ultiwrite/mcp'
export const REDIRECT_URI = 'http://127.0.0.1:6274/oauth/callback'
export const IOS_REDIRECT_URI = 'ultiwrite://oauth/callback'

export function mcpUrl(origin = DEFAULT_ORIGIN) {
  return new URL(MCP_PATH, origin).href
}

export function credentialPath(env = process.env) {
  const home = env.ULTIWRITE_HOME || env.HOME || homedir()
  return join(home, '.config', 'ultiwrite', 'credentials.json')
}

export function pkce() {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge, method: 'S256' }
}

export function redact(value) {
  if (!value || typeof value !== 'object') return value
  const copy = { ...value }
  for (const key of ['access_token', 'refresh_token', 'token', 'authorization']) {
    if (copy[key]) copy[key] = '[redacted]'
  }
  return copy
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
    package: 'ultiwrite-mcp@0.7.1',
  }
}
