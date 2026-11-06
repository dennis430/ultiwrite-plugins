# Ultiwrite plugins

Ultiwrite is an asymmetric diligence engine: ordinary commercial documents open a wider investigation across financial, identity, integrity, operational and external-context evidence. Publisher: DWS Offshore Fund. This repository contains thin public connectors and workflow guidance; the analytical service is hosted separately.

## Connector packages

| Directory | Version | Contents |
| --- | --- | --- |
| `chatgpt/` | 0.10.0 | Existing ChatGPT/Codex identity and five workflows, with current account/usage guidance |
| `claude/` | 0.10.0 | Existing Claude identity, connection recovery and five workflows |
| `cursor/` | 0.10.0 | Existing Cursor identity and five discoverable workflows |
| `grokbot/` | 0.9.0 | Separate Grok Bot submission dossier; distinct from Grok Build |
| `client/` | 0.8.0 | Optional local OAuth/stdio adapter; npm publication outstanding |
| `hosts/` | 0.10.1 | 54-surface compatibility matrix, 16 config examples, hosted-client guide, API example and generated public tool catalog |

This release supplies source and versioned artifacts for the existing canonical MCP service. The owner requested that live host testing be skipped; host acceptance remains unverified. npm publication and marketplace submissions are separate. Historical approved package identities and archive bytes are preserved.

## Connect

Preferred endpoint: **https://mcp.dwsoffshorepartners.com/mcp**. The historical apex `/api/integrations/ultiwrite/mcp` route remains valid for existing connections and audiences.

Sign in through Ultiwrite’s existing account flow, then approve the specific host’s scoped OAuth grant. The host account and customer account are separate. Verify `ultiwrite_account_get` after connecting, reconnecting or switching accounts. Read `ultiwrite_capabilities_get` for current capabilities, account limits, paid credits and complimentary availability. Evidence consent and server usage accounting still govern analysis.

The first eligible complimentary investigation remains available once per account, with no card required. Canonical account eligibility and the existing server ledger govern complimentary and purchased usage.

[Installation and host-specific configurations](hosts/README.md) · [Hosted SaaS clients](hosts/hosted-clients.md) · [Per-surface status](hosts/matrix.json) · [Canonical public tool catalog](hosts/catalog.json). Unknown host behavior and external approvals remain explicit; a model name alone is not an MCP host.

## Downloads

Download the versioned `release/` files below or use them from a distribution checkout. The host adapter bundle is `release/ultiwrite-host-adapters-0.10.1.zip`; the optional client tarball is `release/ultiwrite-mcp-0.8.0.tgz`.

<!-- CURRENT_DOWNLOADS_START -->
| Archive | SHA-256 |
| --- | --- |
| [`ultiwrite-chatgpt-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.10.0.zip) | `aa928684cdbb4383aea0e4cb09fe2bfd67c90181ff4b120237889826312b14b5` |
| [`ultiwrite-cursor-plugin-0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.10.0.zip) | `52e7b6b11346b07a05b8ccbe71467e9055a1db3274d15b770df99500f34f1dee` |
| [`Ultiwrite_Claude_Plugin_v0.10.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.10.0.zip) | `bcedcbec17239d1dc99ed3aecbf0a47af18fd265d33074c28b16184445e82b20` |
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
