# Google Connected Apps backend handoff

This document describes the channel-specific work still required in the canonical hosted service. It contains no private engine source.

## Domain route

Copy `server-overlay/google-connected-apps-route.ts` into the canonical Next.js service at `app/.well-known/google-connected-apps/route.ts`, then deploy it on the host serving `mcp.dwsoffshorepartners.com`. The public kit supplies a standalone route adapter; it does not contain a private application tree. Configure the actual verification tokens from the console in `GOOGLE_CONNECTED_APPS_VERIFICATION_TOKENS` as a JSON array. Ensure host/middleware routing does not redirect the well-known URL to the main website. Required result: direct HTTPS 200 with the exact `verification_tokens` array.

## Exact callback allowlist

The current backend inspection for this preparation found no Google Connected Apps callbacks in its trusted-client redirects. The actual app-specific addresses are generated in Google Connected Console after app creation; those values cannot be known or filled in beforehand.

Copy the exact URIs from the console into a local JSON array, then run:

```bash
node scripts/prepare-oauth-registration.mjs --redirects /absolute/path/google-callbacks.json --output /absolute/path/google-registration.json
```

The helper only prepares a public-client DCR body. It does not call the registration endpoint. Add the exact returned callbacks to the canonical authorization server's approved client configuration, preserving strict redirect matching. Register the client after that server change is authorized and deployed, or let Google's DCR flow register it. Do not replace the trust boundary with a suffix match accepting arbitrary Google-hosted URLs.

Google's [OAuth guide](https://developers.google.com/connected-apps/mcp/oauth) documents three hosts with `/r/` and `/a/` callback families. Its [registration troubleshooting guide](https://developers.google.com/connected-apps/gpc/troubleshooting) directs publishers to use all six app-specific URIs from the console. The generator validates those families but never fabricates the app ID.

## Compatibility proof

Complete metadata discovery → DCR or preregistration → PKCE consent → token exchange → protected account tool → token refresh → revoke/reconnect in Google's actual developer environment. The live unauthenticated MCP returns 401, so select user-delegated authorization and supply a usable review account before tool sync.

If Google's persistent-linking token behavior differs from the server's current policy, reproduce that failure first and make a scoped client-compatible change. Preserve existing hosts, account isolation and current permission checks. No global token or permission change is implemented by this handoff.
