# Official MCP Registry

The prepared primary identity is **com.dwsoffshorepartners/ultiwrite**. `server.json` is a remote-only registry manifest, so publishing the npm wrapper is not a prerequisite. Authentication for customers remains the existing OAuth flow.

**Publication status: NOT_SUBMITTED.** A live registry query during preparation returned no Ultiwrite entries. The root `server.draft.json` is an older historical draft; use this directory's schema-conforming manifest for the new submission.

## Account and ownership steps

1. Download the official publisher CLI from https://github.com/modelcontextprotocol/registry/releases and put `mcp-publisher` on your PATH. On macOS, `brew install mcp-publisher` is also documented. The publisher CLI is distinct from the Ultiwrite npm wrapper.
2. Use the domain identity already prepared in `server.json`. Generate ownership material on your own computer, outside this repository:

   ```sh
   node distribution/registry/prepare-domain.mjs /absolute/private/ultiwrite-registry
   ```

   This writes a private Ed25519 key and a public `dns-record.txt`. Add that TXT value to the **dwsoffshorepartners.com apex** using your existing DNS provider. Do not delete existing TXT records. The same public value can alternatively be served at `https://dwsoffshorepartners.com/.well-known/mcp-registry-auth` for the registry's documented HTTP verification route.
3. After DNS propagates, authenticate without printing the private key:

   ```sh
   node distribution/registry/login-domain.mjs /absolute/private/ultiwrite-registry/publisher-key.pem
   ```

   If you selected the HTTP proof route, append `--method http` to that command. DNS is the default.

4. Validate without publishing:

   ```sh
   mcp-publisher validate distribution/registry/server.json
   ```

5. When publication is approved, run:

   ```sh
   mcp-publisher publish distribution/registry/server.json
   ```

6. Verify the exact identity at https://registry.modelcontextprotocol.io/v0.1/servers/com.dwsoffshorepartners%2Fultiwrite/versions/latest . Save the publication receipt and published version.

No extra marketplace seller account is required for domain verification. The proof belongs to this publisher; never reuse a key from an example or put the private key in GitHub.

### Windows PowerShell

Run these from the repository root. Use a new directory beneath your Windows user profile; do not place ownership material in a checkout.

```powershell
$ultiwriteRegistryDir = Join-Path $env:USERPROFILE 'UltiwritePrivate\registry'
node distribution/registry/prepare-domain.mjs $ultiwriteRegistryDir
# Add the public value from dns-record.txt to the domain's apex TXT records.
$ultiwriteRegistryKey = Join-Path $ultiwriteRegistryDir 'publisher-key.pem'
node distribution/registry/login-domain.mjs $ultiwriteRegistryKey
mcp-publisher validate distribution/registry/server.json
# Run the following only when the publication is approved.
mcp-publisher publish distribution/registry/server.json
```

## Optional GitHub identity

If a domain identity is deliberately declined, `server.github.json` is a prepared alternative for **io.github.dennis430/ultiwrite**. Authenticate with `mcp-publisher login github`, approve the CLI's device flow at https://github.com/login/device using the `dennis430` account, validate that alternative file, then publish it. Choose one identity before publication; do not create duplicate listings as an automatic fallback.

## Downstream directories

The registry exposes metadata for downstream discovery. Each directory controls its own ingestion, review and listing behavior. Registry publication does not guarantee a Glama, PulseMCP, mcp.directory or host-store listing, and it is not a prerequisite for the other six submissions prepared here.

## Official references

- Remote manifests: https://modelcontextprotocol.io/registry/remote-servers
- Publisher authentication: https://modelcontextprotocol.io/registry/authentication
- Publisher commands: https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/cli/commands.md
- Schema: https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json
