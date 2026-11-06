import { mcpUrl } from './pure.mjs'

function safeUrl(raw) {
  const url = new URL(raw)
  if (url.username || url.password || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) {
    throw new Error('OAuth discovery returned an unsafe endpoint.')
  }
  return url
}

export async function discover(issuer, resource = mcpUrl(issuer)) {
  const base = safeUrl(issuer).origin
  const expected = safeUrl(resource)
  if (expected.origin !== base) throw new Error('OAuth resource and issuer do not match this connection.')
  const read = async url => {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error('Ultiwrite OAuth discovery is unavailable. Retry or reconnect.')
    return response.json()
  }
  const path = expected.pathname === '/' ? '' : expected.pathname
  const protectedResource = await read(`${base}/.well-known/oauth-protected-resource${path}`)
  if (protectedResource.resource !== expected.href || !protectedResource.authorization_servers?.includes(base)) {
    throw new Error('OAuth discovery does not match this connection resource.')
  }
  const authorization = await read(`${base}/.well-known/oauth-authorization-server`)
  if (authorization.issuer !== base || !authorization.code_challenge_methods_supported?.includes('S256')) {
    throw new Error('OAuth issuer or PKCE support does not match this connection.')
  }
  for (const key of ['authorization_endpoint', 'token_endpoint', 'registration_endpoint', 'revocation_endpoint']) {
    if (!authorization[key] && key === 'revocation_endpoint') continue
    const endpoint = safeUrl(authorization[key])
    const canonicalConsent = key === 'authorization_endpoint' && base === 'https://mcp.dwsoffshorepartners.com'
      && endpoint.origin === 'https://dwsoffshorepartners.com' && endpoint.pathname === '/api/integrations/ultiwrite/oauth/authorize'
    if (endpoint.origin !== base && !canonicalConsent) throw new Error('OAuth discovery returned an unexpected endpoint origin.')
  }
  return { resource: expected.href, protectedResource, ...authorization }
}
