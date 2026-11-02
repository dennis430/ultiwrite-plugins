// Integration overlay for the canonical Next.js MCP host, not this thin package.
// Source: https://developers.google.com/connected-apps/gpc/prerequisites
export const dynamic = 'force-dynamic';

export async function GET() {
  let tokens: unknown;
  try {
    tokens = JSON.parse(process.env.GOOGLE_CONNECTED_APPS_VERIFICATION_TOKENS ?? '[]');
  } catch {
    return Response.json({ error: 'Domain verification is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!Array.isArray(tokens) || tokens.length === 0 || tokens.some(token =>
    typeof token !== 'string' || !token.trim() || token !== token.trim() || /[\u0000-\u0020<>]/u.test(token) || /YOUR_VERIFICATION_TOKEN|REPLACE_ME|PLACEHOLDER/i.test(token)
  )) {
    return Response.json({ error: 'Domain verification is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return Response.json({ verification_tokens: [...new Set(tokens)] }, { headers: { 'Cache-Control': 'no-store' } });
}
