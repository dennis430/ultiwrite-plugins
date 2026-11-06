# Ultiwrite plugins

Ultiwrite is an asymmetric diligence engine: ordinary commercial documents open a wider investigation across financial, identity, integrity, operational and external-context evidence. Publisher: DWS Offshore Fund. This repository contains thin public connectors and workflow guidance; the analytical service is hosted separately.

## Prepared candidates

| Directory | Version | Contents |
| --- | --- | --- |
| `chatgpt/` | 0.10.0 | Existing ChatGPT/Codex identity and five workflows, with current account/usage guidance |
| `claude/` | 0.10.0 | Existing Claude identity, connection recovery and five workflows |
| `cursor/` | 0.10.0 | Existing Cursor identity and five discoverable workflows |
| `grokbot/` | 0.9.0 | Separate Grok Bot submission dossier; distinct from Grok Build |
| `client/` | 0.8.0 | Optional local OAuth/stdio adapter; npm publication outstanding |
| `hosts/` | 0.10.0 | 49-surface compatibility matrix, 16 config examples, API example and generated public tool catalog |

These candidates are prepared for review. They have not been merged, deployed, published to npm or submitted to marketplaces. The owner requested that live host testing be skipped. Historical approved package identities and archive bytes are preserved.

## Connect

Preferred endpoint: **https://mcp.dwsoffshorepartners.com/mcp**. The historical apex `/api/integrations/ultiwrite/mcp` route remains valid for existing connections and audiences.

Sign in through Ultiwrite’s existing account flow, then approve the specific host’s scoped OAuth grant. The host account and customer account are separate. Verify `ultiwrite_account_get` after connecting, reconnecting or switching accounts. Read `ultiwrite_capabilities_get` for current capabilities, account limits, paid credits and complimentary availability. Evidence consent and server usage accounting still govern analysis.

The first eligible completed investigation remains $0 once per account, with no card required. Canonical account eligibility and the existing server ledger govern complimentary and purchased usage.

[Installation and host-specific configurations](hosts/README.md) · [Per-surface status](hosts/matrix.json) · [Canonical public tool catalog](hosts/catalog.json). Unknown host behavior and external approvals remain explicit; a model name alone is not an MCP host.

## Prepared downloads

Use the local `release/` files now. The remote links below resolve only after authorized source publication. The host adapter bundle is `release/ultiwrite-host-adapters-0.10.0.zip`; the optional client tarball is `release/ultiwrite-mcp-0.8.0.tgz`.

<!-- CURRENT_DOWNLOADS_START -->
| Archive | SHA-256 |
| --- | --- |
| [`ultiwrite-chatgpt-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.10.0.zip) | `27b88e63bc9856def2914e1b9039bc2f32045dc2ad75b9fcf4791e8af28a1e75` |
| [`ultiwrite-cursor-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.10.0.zip) | `6eb3167fca57a43b6b267e767868abc7a248c0c286befa0b43f2b1b7a56a51e4` |
| [`Ultiwrite_Claude_Plugin_v0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.10.0.zip) | `17040986830ff4b421a688e4351790848058da53fdbc034caac6002891489985` |
<!-- CURRENT_DOWNLOADS_END -->

`release/INVENTORY.json`, `release/SHA256SUMS.txt` and `RELEASE_MANIFEST.json` record source/archive hashes and historical preservation. New packages do not replace old archives.

## Preparation

```sh
node scripts/validate-public-plugins.mjs
node scripts/pack-public-connectors.mjs
node scripts/pack-public-connectors.mjs --check
```

These structural and archive checks are not authenticated host acceptance. The original discovery prompt suite remains in `evals/`. It does not establish that a model selected the plugin.

Canonical editable sources are maintained in the private application packaging directories. Keep them synchronized before export. The MIT license applies to original connector files; the hosted investigative service is not included. Public positioning is maintained in [POSITIONING.md](POSITIONING.md).
