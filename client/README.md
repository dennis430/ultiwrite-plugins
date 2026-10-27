# ultiwrite-mcp

Thin client for the canonical Ultiwrite MCP service. It does not contain the diligence engine.

Endpoint: `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`

This package is **not published**. `npx ultiwrite-mcp` will not work until an authorized npm account publishes it. License: MIT for this client wrapper only. The analytical service is not included.

## Local proof

```bash
cd packaging/npx/ultiwrite-mcp
npm pack --pack-destination ../../dist
npx --package ../../dist/ultiwrite-mcp-0.7.1.tgz ultiwrite-mcp doctor --offline
```

## Commands

- `ultiwrite-mcp doctor` checks the live protected-resource and authorization-server metadata. No token is printed.
- `ultiwrite-mcp doctor --offline` prints the expected endpoint and scopes without a network call.
- `ultiwrite-mcp login` registers a native client for `http://127.0.0.1:6274/oauth/callback`, prints the authorize URL, and stores the token at `~/.config/ultiwrite/credentials.json` mode `0600`. The token is not printed.
- `ultiwrite-mcp logout` attempts revocation, then deletes the local file.
- `ultiwrite-mcp config` prints Claude, Cursor, and generic MCP configuration. No secrets.
- `ultiwrite-mcp stdio` maintains a newline-delimited MCP session, forwarding each request as it arrives. Protocol bytes go to stdout. Diagnostics go to stderr. Expired access tokens refresh through the original account grant when available.
- `ultiwrite-mcp upload <file...>` streams only the selected local files to scoped storage, verifies completion and finalizes the canonical analysis. Large files use multipart transfer. The result contains the saved case id. Document forensics stays off. The account's allowance and limits apply.

## Publish, when an npm account is authorized

```bash
cd packaging/npx/ultiwrite-mcp
npm publish --access public
```

`npm whoami` was unauthenticated in the Stage 1 environment, so publication was not performed.

First completed analysis is $0.00. Contact us for further-analysis pricing. No card is required and there is no automatic charge. This client does not take payment.
