# Ultiwrite plugins

Ultiwrite is an asymmetric diligence engine: ordinary commercial documents open a wider investigation across financial, identity, integrity, operational and external-context evidence. Publisher: DWS Offshore Fund. This repository contains thin public connectors and workflow guidance; the analytical service is hosted separately.

## Connector packages

| Directory | Version | Contents |
| --- | --- | --- |
| `chatgpt/` | 0.11.0 candidate | Existing ChatGPT/Codex identity and six workflows, including typed case disposition |
| `claude/` | 0.11.0 candidate | Existing Claude identity, connection recovery and six workflows |
| `cursor/` | 0.11.0 candidate | Existing Cursor identity and six discoverable workflows |
| `grokbot/` | 0.9.0 | Separate Grok Bot submission dossier; distinct from Grok Build |
| `client/` | 0.8.0 | Optional local OAuth/stdio adapter; npm publication outstanding |
| `hosts/` | 0.13.0 | 55-surface compatibility matrix, 16 config examples, enterprise adoption/operations guides, directory review packets, hosted-client guide, API example and generated public tool catalog |

This tree is an unpublished 0.11.0 source candidate for the existing canonical MCP service. It adds the current ninth public tool, explicit case disposition, customer requirement-set intake guidance and saved requirement-applicability interpretation. Native host acceptance is NOT_RUN; provider import, directory review, deployment and publication are separate. The public repository and authenticated website remain on their distinct 0.10.0 archive families until an authorized release. Historical approved package identities and archive bytes are preserved.

## Connect

Preferred endpoint: **https://mcp.dwsoffshorepartners.com/mcp**. The historical apex `/api/integrations/ultiwrite/mcp` route remains valid for existing connections and audiences.

Sign in through Ultiwrite’s existing account flow, then approve the specific host’s scoped OAuth grant. The host account and customer account are separate. Verify `ultiwrite_account_get` after connecting, reconnecting or switching accounts. Read `ultiwrite_capabilities_get` for current capabilities, account limits, paid credits and complimentary availability. Evidence consent and server usage accounting still govern analysis.

The first eligible complimentary investigation remains available once per account, with no card required. Canonical account eligibility and the existing server ledger govern complimentary and purchased usage.

[Installation and host-specific configurations](hosts/README.md) · [Hosted SaaS clients](hosts/hosted-clients.md) · [Per-surface status](hosts/matrix.json) · [Canonical public tool catalog](hosts/catalog.json). Unknown host behavior and external approvals remain explicit; a model name alone is not an MCP host.

[Enterprise adoption and operations](hosts/enterprise/README.md) · [Directory submission packets](hosts/submissions/README.md) · [EmDash setup](hosts/emdash.md)

## Downloads

Before export, the table below intentionally records the currently published public-repository 0.10.0 family. The controlled exporter rewrites only this marked table in its separate candidate tree with newly built 0.11.0 archives. Treat the table as belonging to the tree in which it appears: its hashes must not be applied to website downloads or another archive family. The changed host catalog is prepared separately as `release/ultiwrite-host-adapters-0.13.0.zip`; historical 0.12.0 bytes remain frozen. The optional client tarball remains unpublished at `release/ultiwrite-mcp-0.8.0.tgz`.

<!-- CURRENT_DOWNLOADS_START -->
| Archive | SHA-256 |
| --- | --- |
| [`ultiwrite-chatgpt-plugin-0.11.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.11.0.zip) | `e2d3855ed90df86f0cec176b5bb06c7911dd5316193b3a3228bd543b9a062357` |
| [`ultiwrite-cursor-plugin-0.11.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.11.0.zip) | `848f5442eee125d15a0b38af24c3a9416531b061edd4e97e8d8d53db78f21941` |
| [`Ultiwrite_Claude_Plugin_v0.11.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.11.0.zip) | `b1c925933e896a3f783fd91b76f3c768c76d27cb16b13f4ddd546446b510ed66` |
<!-- CURRENT_DOWNLOADS_END -->

In an exported candidate, `release/INVENTORY.json`, `release/SHA256SUMS.txt` and `RELEASE_MANIFEST.json` record candidate source/archive hashes and historical preservation. New packages do not replace old archives. The authenticated website's 0.10.0 hashes remain in its own `ultiwrite-current-plugins.json`; those ZIP containers differ from this public-repository family and are not interchangeable despite matching source version labels.

## Preparation

```sh
node scripts/validate-public-plugins.mjs
node scripts/pack-public-connectors.mjs
node scripts/pack-public-connectors.mjs --check
```

These structural and archive checks are not authenticated host acceptance. The original discovery prompt suite remains in `evals/`. It does not establish that a model selected the plugin.

Canonical editable sources are maintained in the private application packaging directories. Keep them synchronized before export. The MIT license applies to original connector files; the hosted investigative service is not included. Public positioning is maintained in [POSITIONING.md](POSITIONING.md).
