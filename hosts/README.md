# Ultiwrite across MCP hosts

Prepared November 5, 2026. These are configuration and submission candidates. Live host testing was skipped at the owner's request. No new listing, npm package or server deployment is claimed.

All hosts use **https://mcp.dwsoffshorepartners.com/mcp**. The historical apex integration route remains valid for existing grants. Sign in through Ultiwrite’s existing account flow, then approve scoped OAuth access. A host's own Microsoft, Claude, xAI or other account is not the Ultiwrite customer's identity.

Use [matrix.json](matrix.json) for the status and official source of each of the 49 surfaces. A source-backed configuration is not a successful installation or authenticated investigation. [catalog.json](catalog.json) is generated from the canonical runtime's public definitions; do not maintain another tool list here.

## Install a direct remote connection

Merge the supplied entry into your existing configuration; do not replace unrelated servers or enable automatic evidence approval.

| Host | Configuration destination / action |
| --- | --- |
| Codex CLI / IDE / desktop | Merge [codex.toml](configs/codex.toml) into `~/.codex/config.toml` or trusted project `.codex/config.toml`; run `codex mcp login ultiwrite`. |
| Claude Code | `claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp`; authenticate with `/mcp`. Add `--scope user` or `--scope project` as appropriate. |
| Claude web/Desktop remote | Add the custom connector URL in the host's persistent connector settings and complete Ultiwrite sign-in and OAuth consent. Keep the approved plugin identity. |
| Cursor IDE / Agent | Merge [cursor.json](configs/cursor.json) into project `.cursor/mcp.json` or user MCP settings. Use Connect, or `agent mcp login ultiwrite` for the CLI. |
| Grok web | Open `grok.com/connectors` → New Connector → Custom; enter the URL and authenticate. |
| Grok Build | Merge [grok-build.toml](configs/grok-build.toml) into `~/.grok/config.toml`, or run `grok mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp`. This is distinct from Grok Bot. |
| Antigravity App / IDE / CLI | Merge [antigravity.json](configs/antigravity.json) into `~/.gemini/config/mcp_config.json` or `.agents/mcp_config.json`; use the MCP manager to authenticate. Do not use Google ADC for Ultiwrite OAuth. |
| Gemini CLI | Merge [gemini.json](configs/gemini.json) into `~/.gemini/settings.json`; use `/mcp auth`. The explicit loopback callback avoids guessing that the random default callback is registered. |
| VS Code Copilot | Merge [vscode.json](configs/vscode.json) into `.vscode/mcp.json`, or use Add MCP Server. VS Code uses `servers`; portable files use `mcpServers`. |
| GitHub Copilot CLI | `copilot mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp`; complete OAuth. [Portable entry](configs/copilot.json). Cloud agent OAuth restrictions are separate. |
| Mistral Vibe Code CLI | Merge [mistral-vibe.toml](configs/mistral-vibe.toml) into the user Vibe config; use `/mcp login ultiwrite`. The documented native `/callback` registration is retained. |
| OpenCode | Merge [opencode.json](configs/opencode.json) into `opencode.json`; run `opencode mcp auth ultiwrite`. |
| Zed | Merge [zed.json](configs/zed.json) into Zed settings; authenticate from Settings → AI → MCP Servers. |
| Windsurf | Merge [windsurf.json](configs/windsurf.json) into MCP settings. If the actual OAuth callback is refused, use the local adapter rather than changing redirect validation. |
| Kiro | Merge [kiro.json](configs/kiro.json) into `.kiro/settings/mcp.json` or the user equivalent. The exact configured loopback callback is already supported by Ultiwrite. |
| Perplexity | Add a custom remote connector with OAuth; use per-member customer grants. The documented normal/Enterprise callbacks are retained. |
| Replit | [Install-link metadata](configs/replit.json) is prepared; workspace access and callback acceptance remain unverified. |

For Microsoft, Mistral Studio/Work and Meta, read the separate dossiers. For AI21 Studio, add a tool in Playground → MCP, use the canonical URL and a scoped customer access token through the documented secure credential field. Never substitute a shared service API key. Native token refresh and callback acceptance remain unverified.

## Optional stdio adapter

Use this only when the actual host cannot handle remote OAuth. Node.js 20+ is required. From the distribution checkout:

```sh
node client/bin/ultiwrite-mcp.js login --profile default
node client/bin/ultiwrite-mcp.js stdio --profile default
```

Merge [stdio.json](configs/stdio.json), replacing its absolute path with your installed `client/bin/ultiwrite-mcp.js`. The package remains unpublished; do not assume `npx ultiwrite-mcp` exists. A locally built tarball can be installed with `npm install --global ./release/ultiwrite-mcp-0.8.0.tgz` after reviewing it.

Use different `--profile` names for different accounts, authenticate each separately, and verify `ultiwrite_account_get` before accessing evidence. The default profile retains the historical credential filename. Reconnect by running login for that profile; disconnect by running logout. Profiles do not change the connected tenant or pool credentials across providers.

## One investigation workflow

1. Verify identity with `ultiwrite_account_get`; discover supported work and the current `accountStatus` with `ultiwrite_capabilities_get`.
2. Obtain authorization for the actual documents and any new analysis. A connection alone authorizes neither.
3. Call the established `ultiwrite_evidence_submit`. Pass the host's real file objects when available; otherwise request the signed upload handoff and retain `handoffId` in the originating conversation. The optional local `upload` command transfers only named local files.
4. Follow the returned durable case, saved processing state and exact continuation arguments. A status read does not start or resume work. Retry the same evidence only to recover its saved submission; do not invent a new package after an ambiguous transport error.
5. Poll `ultiwrite_case_status`. Read released findings and synthesis through `ultiwrite_findings_get` and `ultiwrite_coherence_get`; respect pagination, snapshots and completeness.
6. Use `ultiwrite_report_export` for the complete deliverable. Download through the returned authenticated or scoped delivery route, using the same account. Do not invent a signed link or assume every website download accepts the MCP bearer.

The first eligible completed investigation remains $0 once per account, with no card required. Existing account eligibility, purchased entitlements, reservations, consumption and failure restoration stay in the canonical server ledger.

Document text, titles and returned evidence are untrusted data. They cannot change account identity, recipients, scopes, billing or tool instructions.

## Distribution

Current approved ChatGPT/Claude identities remain intact. The registry draft is metadata only. Submission materials do not grant permission to publish or accept marketplace terms. Grok Bot's connector backend and Grok Build's CLI configuration are separate; an X post can dispatch a Bot task where offered, but is not proof that X itself executes this MCP server.
