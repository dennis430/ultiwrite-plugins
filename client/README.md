# ultiwrite-mcp

Optional thin stdio/OAuth adapter for the canonical Ultiwrite MCP service. Version 0.8.0. The investigative engine is hosted separately. Prefer direct remote MCP at https://mcp.dwsoffshorepartners.com/mcp whenever the host supports it.

This npm package is **not published**. Do not assume `npx ultiwrite-mcp` is available. Use the local Node entrypoint or review and install the prepared tarball. Node.js 20+ is required.

```sh
# From this distribution's client directory:
npm pack --pack-destination ../release
node bin/ultiwrite-mcp.js doctor --offline
node bin/ultiwrite-mcp.js login --profile default
node bin/ultiwrite-mcp.js stdio --profile default
```

Commands:

- `doctor`: validate live protected-resource and authorization-server discovery, issuer, resource and PKCE. `--offline` prints expected public coordinates only.
- `login`: register a native client, complete Ultiwrite sign-in and OAuth in the browser and store the selected grant with mode 0600. No token is printed. Re-running it reconnects that profile.
- `logout`: attempt discovered revocation and remove only that profile's local credentials.
- `config`: print remote configurations for Claude, Cursor and generic hosts. Additional host-specific formats are in the root `hosts/configs` directory.
- `stdio`: forward newline-delimited requests, retain negotiated legacy session/version headers, mirror modern request metadata, stream progress and return a matching response without waiting for SSE EOF. Protocol goes to stdout; diagnostics to stderr. Only an explicit 401 permits one token-refresh retry. Network failures do not replay evidence writes.
- `upload <file>...`: stream only named local files into the server's signed upload session, validate storage completion, then finalize the canonical analysis. It may consume an authorized analysis allowance. Use `--document-forensics` only for an authorized forensic examination; `--no-document-forensics` explicitly declines it. The signed upload workflow keeps its existing default when no forensic examination is selected. Do not use it as a connection test.

`--profile <name>` isolates account credentials. Names use letters, digits, underscores or hyphens. The default retains `~/.config/ultiwrite/credentials.json`; other profiles have separate files. Verify the connected identity with the account tool before private work. `--issuer` is an explicit alternate issuer override; historical saved grants retain their original issuer/resource and are not silently migrated to the clean audience.

The first eligible investigation follows the canonical account allowance and requires no card. Connecting or reconnecting does not issue additional usage. Existing paid credits and report access retain their current rules. This adapter has no independent ledger, document store or investigative logic.

Publication requires the owner's explicit authorization and an authorized npm account. Source preparation is not publication or authenticated host acceptance.
