# OAuth

Ultiwrite MCP authentication is OAuth. A shared API key is not accepted. An unauthenticated POST to the MCP URL returns 401 and tells the client to send the bearer token from the Ultiwrite authorization server.

Canonical resource:

https://mcp.dwsoffshorepartners.com/mcp

Discovery for the clean endpoint:

- `https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp`
- `https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server`

Expected clean-endpoint metadata after authorized deployment; re-check before a host test:

- Resource matches the canonical MCP URL
- Issuer is `https://mcp.dwsoffshorepartners.com`
- Grant types: authorization code and refresh token
- PKCE method: S256
- Token endpoint authentication method: none (public client)
- Registration endpoint is advertised
- Scopes: `ultiwrite:read`, `ultiwrite:evidence`
- Bearer tokens are sent in the Authorization header

The advertised authorization endpoint uses the existing consent page on `dwsoffshorepartners.com` and preserves the exact requested resource. Token and registration endpoints use the MCP issuer host. Clients should follow discovery rather than guess a host. This package does not embed a client credential, refresh token, or bearer token.

Sequence 1 packaging observed the legacy apex resource and issuer. Those existing identities remain valid; changing this source does not migrate registered connections or establish live verification of the new URL.

`ultiwrite:read` covers account capability, case list, status, findings, coherence, and export links for the signed-in account.
`ultiwrite:evidence` covers submitting authorized evidence into that same account.

Connecting does not grant extra analyses, does not take payment, and does not reach another account's records.
