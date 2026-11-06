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

Authenticate with **Google**, then approve the specific host's scoped Ultiwrite grant. The host account and customer account are separate. Verify `ultiwrite_account_get` after connecting, reconnecting or switching accounts. Read `ultiwrite_capabilities_get` for current capabilities, account limits, paid credits and complimentary setup status. Evidence consent and server usage accounting still govern analysis.

New complimentary usage requires Stripe card verification and promotion eligibility. Account creation, connection, existing reports and existing paid entitlements remain accessible without card setup. Card setup creates no charge or subscription.

[Installation and host-specific configurations](hosts/README.md) · [Per-surface status](hosts/matrix.json) · [Canonical public tool catalog](hosts/catalog.json). Unknown host behavior and external approvals remain explicit; a model name alone is not an MCP host.

## Prepared downloads

Use the local `release/` files now. The remote links below resolve only after authorized source publication. The host adapter bundle is `release/ultiwrite-host-adapters-0.10.0.zip`; the optional client tarball is `release/ultiwrite-mcp-0.8.0.tgz`.

<!-- CURRENT_DOWNLOADS_START -->
| Archive | SHA-256 |
| --- | --- |
| [`ultiwrite-chatgpt-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.10.0.zip) | `ab80175263356e90e59ab66392db50df2f4c8916d93b182fc719a2dbc81388a2` |
| [`ultiwrite-cursor-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.10.0.zip) | `364a2e5a3c98d13607637d709734052374ef2f1ef8259b18e8480bb35a8bfe8a` |
| [`Ultiwrite_Claude_Plugin_v0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.10.0.zip) | `628e198edba317f1cb212d4e62f8b2905b8843f489d8d7221b6179978856a40d` |
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
