# OAuth

Ultiwrite MCP authentication is OAuth. A shared API key is not accepted. An unauthenticated POST to the MCP URL returns 401 and tells the client to send the bearer token from the Ultiwrite authorization server.

Canonical resource:

https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp

Discovery, both live on the public site:

- `https://dwsoffshorepartners.com/.well-known/oauth-protected-resource`
- `https://dwsoffshorepartners.com/.well-known/oauth-authorization-server`

Observed production metadata during Sequence 1 packaging, re-check before a host test:

- Resource matches the canonical MCP URL
- Issuer is `https://dwsoffshorepartners.com`
- Grant types: authorization code and refresh token
- PKCE method: S256
- Token endpoint authentication method: none (public client)
- Registration endpoint is advertised
- Scopes: `ultiwrite:read`, `ultiwrite:evidence`
- Bearer tokens are sent in the Authorization header

The public authorize path on `dwsoffshorepartners.com` redirects to the canonical consent host and keeps the public resource. Clients that follow discovery should use the advertised authorization endpoint rather than a guessed host. This package does not embed a client credential, refresh token, or bearer token.

`ultiwrite:read` covers account capability, case list, status, findings, coherence, and export links for the signed-in account.
`ultiwrite:evidence` covers submitting authorized evidence into that same account.

Connecting does not grant extra analyses, does not take payment, and does not reach another account's records.
