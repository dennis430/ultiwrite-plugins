# Ultiwrite plugins

**Asymmetric Diligence & Investigative Intelligence**

Your documents are the starting point. Not the limits of the investigation.

Ultiwrite expands the evidence beyond initial documents, investigates relevant external information, and reconciles the combined picture to reveal findings and test conclusions the original files alone could not support. This repository contains thin connectors and distribution packaging—not the proprietary investigative engine or customer records. Publisher: **DWS Offshore Fund**.

## Distribution preparation — November 1, 2026

The new `distribution/` source prepares 21 channel packs with a single messaging catalog, platform-specific installation/submission instructions, explicit blockers and host acceptance checklists. It includes new MCP manifests, automation adapters, a WordPress admin connector, a Workspace sidebar and a Chrome manual evidence-handoff extension.

**Preparation is not publication.** Microsoft is a certification template/finalizer, not a certified connector. HubSpot is a handoff tied to existing unmerged backend work, not a completed deal integration. Existing marketplace identities and released ZIPs have not been overwritten.

Run with Node.js 22:

```sh
node scripts/verify-distribution.mjs
```

Windows: double-click `VERIFY.cmd`. Outputs go to `dist/distribution/`; begin with `START_HERE.md`. Run `python scripts/prepare-distribution-assets.py` with Pillow installed to produce approved-logo size variants. No verification or build command submits an application or publishes a package.

See [distribution/README.md](distribution/README.md), [the channel catalog](distribution/catalog.json), and [the website-positioning Codex prompt](docs/handoffs/CODEX_PUBLIC_POSITIONING_2026-11-01.md). Native platform validation, actual OAuth/API acceptance and publisher-account approvals are separate from local tests.

## Existing connector releases

| Directory | Version | Purpose |
|---|---|---|
| `claude/` | 0.8.3 | Claude remote MCP plus account connection, evidence, report and follow-up skills. |
| `chatgpt/` | 0.7.1 | Existing ChatGPT/Codex listing source; preserve that listing identity. |
| `cursor/` | 0.7.1 | Cursor plugin and Streamable HTTP MCP configuration. |
| `grokbot/` | 0.7.1 | Existing Grok Bot submission package; consumer Grok availability is not implied. |
| `client/` | 0.7.1 | Local wrapper; npm publication is not established. |

The submitted EmDash package remains on its separate PR #12 branch. It is not silently merged by this distribution work.

Historical ZIPs remain in `release/`, including `Ultiwrite_Claude_Plugin_v0.8.3.zip`, `ultiwrite-chatgpt-plugin-0.7.1.zip` and `ultiwrite-cursor-plugin-0.7.1.zip`. Consult `release/SHA256SUMS.txt` and `release/INVENTORY.json` for exact hashes and members. `node scripts/pack-public-connectors.mjs --check` checks existing source/archive parity. GitHub availability does not prove directory approval or an installed client's version.

## Hosted service and account

Canonical MCP: https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp

Claude clean-host MCP: https://mcp.dwsoffshorepartners.com/mcp

Both reach the same hosted service and account. MCP clients use native OAuth; do not embed a dashboard API key in their config. API-based automation adapters separately require explicit account API approval and retain the service's existing quotas and analysis entitlements.

Setup: https://dwsoffshorepartners.com/docs/mcp
API documentation: https://dwsoffshorepartners.com/docs/api
Website: https://dwsoffshorepartners.com
Support: https://dwsoffshorepartners.com/contact
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms

## Claude installation and recovery

Upload the current Claude ZIP through the host's plugin interface, or use the existing Claude Code marketplace entry:

```text
/plugin marketplace add dennis430/ultiwrite-plugins
/plugin install ultiwrite@ultiwrite
```

Ask to connect Ultiwrite and confirm the account. Use the host's Ultiwrite connector controls or Claude Code's `/mcp` authentication action to reconnect. See `claude/README.md` for recovery and account switching.

`server.draft.json` remains the historical unpublished draft. The new `server.json` is a prepared registry candidate; neither is a publication receipt. Preserve `io.github.dennis430/ultiwrite` if that namespace is already registered.

## License boundary

The MIT grant covers the original thin connector code described in LICENSE and NOTICE, not the hosted analytical service. The WordPress adapter carries its own GPL-2.0-or-later notice. Public connectors contain no engine source, customer records or credentials.
