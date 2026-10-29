# Ultiwrite plugins

Thin connectors for Ultiwrite Commercial Diligence. Publisher: DWS Offshore Fund. Product: Ultiwrite.

This repository is plugin packaging only. It is not the Ultiwrite service, and it does not include the private analytical implementation or customer records. The MIT license covers the original thin connector code. The service itself remains proprietary. See LICENSE and NOTICE.

Remote MCP: https://mcp.dwsoffshorepartners.com/mcp (Claude 0.8.2) and https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp (ChatGPT, Cursor, Grok Bot 0.7.4). Both reach the same Ultiwrite server and account.
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Website: https://dwsoffshorepartners.com
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

| Directory | Version | What it is |
| --- | --- | --- |
| `claude/` | 0.8.2 | Claude plugin: the Ultiwrite remote MCP server (`https://mcp.dwsoffshorepartners.com/mcp`) plus four skills (`ultiwrite`, `submit-evidence`, `read-report`, `follow-up`). Source for the Claude directory submission and the Claude marketplace entry. |
| `chatgpt/` | 0.7.4 | ChatGPT/Codex plugin source for the existing unpublished listing identity. Not uploaded by this repository. |
| `cursor/` | 0.7.4 | Cursor plugin. Manifest `.cursor-plugin/plugin.json`, remote Streamable HTTP `mcp.json`. |
| `grokbot/` | 0.7.4 | Grok Bot submission dossier. Not consumer Grok, and not a completed host test. |
| `client/` | 0.7.1 | Local `ultiwrite-mcp` wrapper. Not published to npm. |

## Downloads

| File | Package | SHA-256 |
| --- | --- | --- |
| [`release/Ultiwrite_Claude_Plugin_v0.8.2.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.2.zip) | Claude plugin 0.8.2 (current) | `86e182ba483572b158559b40b171b55572c4aac51a774b85a799c8a05dc86481` |
| [`release/ultiwrite-chatgpt-plugin-0.7.4.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.7.4.zip) | ChatGPT plugin 0.7.4 (current) | `97a09cdc28a53c04769fea8586c11ca870edaec93a167e87b828eb8cfff7bfa2` |
| [`release/ultiwrite-cursor-plugin-0.7.4.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.7.4.zip) | Cursor plugin 0.7.4 (current) | `189becaa4fe4d26340437cf4a6e51c632561c4b7635975b86d71cb4442e5d42c` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.1.zip) | Claude plugin 0.8.1 (superseded, kept for existing links) | `11520ccd818dddd576a7b230e08b74142f3012fb0ea2d10f4b6f37c105e6e8b0` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.0.zip) | Claude plugin 0.8.0 (superseded, kept for existing links) | `619656fae4e9b9db2d7a7e0c813713d859cde291062c21912bb38fc7297ca28e` |
| [`release/ultiwrite-chatgpt-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.7.1.zip) | ChatGPT plugin 0.7.1 (superseded) | `457004b3d46b7aeaddabc1a5d065c181aac2b5a280369be7f9539de39d1339a4` |
| [`release/ultiwrite-cursor-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.7.1.zip) | Cursor plugin 0.7.1 (superseded) | `e34aa2e43d7062871de121c479ef5e8a7fe214f20b400464624605fc419e15f1` |
| [`release/ultiwrite-claude-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-claude-plugin-0.7.1.zip) | Claude plugin 0.7.1 (superseded, kept for existing links) | `7b53857bcd7450b68a869b90d29c1112e89fcb3f707fd87ccadcacc73f906bfe` |

`release/SHA256SUMS.txt` and `release/INVENTORY.json` list the same hashes and every archive member. `node scripts/pack-public-connectors.mjs` rebuilds the ChatGPT and Cursor archives and checks every member of the current Claude ZIP against `claude/`.

## Install the Claude plugin

- claude.ai, Claude Desktop, Cowork: Customize > Plugins > Add > Upload plugin, and choose `Ultiwrite_Claude_Plugin_v0.8.2.zip`.
- Claude Code: `/plugin install ultiwrite --marketplace dennis430/ultiwrite-plugins`, or for one session `claude --plugin-dir ./Ultiwrite_Claude_Plugin_v0.8.2.zip`.
- The first tool call opens Ultiwrite sign-in (OAuth). No API key goes in any config.

Cursor multi-plugin entry: `.cursor-plugin/marketplace.json` points at `cursor`.
Claude marketplace entry: `.claude-plugin/marketplace.json` points at `./claude`.

Direct remote MCP, which does not require this repository:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Cursor settings can use either Remote MCP URL above. Do not put an API key in either config. The host completes Ultiwrite OAuth.

`server.draft.json` is unpublished MCP Registry metadata. Do not treat it as a listing.

Claude is at 0.8.2; ChatGPT, Cursor and Grok Bot are at 0.7.4. The unchanged local npm client remains at 0.7.1. npm is not published. Directory submission and host installation are tracked outside this repository; nothing here claims a directory listing or approval.

## Canonical icon release (prepared 2026-10-29)

ChatGPT 0.7.4, Cursor 0.7.4, Grok Bot 0.7.4 and Claude 0.8.2 use the exact supplied black-background gold Uw image at their existing `assets/logo.png` path: 512 × 512, opaque RGB PNG, 21,052 bytes, SHA-256 `cc0a3c229347e47a154a00c9e6dfa774c0e1f07ee9fc063935af5bc4897f4b18`. The validator checks all four package assets against this digest. ChatGPT light/dark logo, composer icon and per-skill `agents/openai.yaml` image fields resolve to that same asset. Cursor `logo` and Claude `icon` retain their existing supported fields and relative paths.

The new versions and new archive URLs distinguish the release from cached older packages. Historical ZIPs remain byte-for-byte unchanged for existing links; they still contain their historical icon. A raw GitHub `main` image URL may retain a cached response; a marketplace/client update must resolve the new commit and package version. For immutable verification use `raw.githubusercontent.com/dennis430/ultiwrite-plugins/<approved-commit>/<client>/assets/logo.png` after approval and merge.

After the source PR is approved and merged, refresh the Cursor marketplace and start a new session (an existing local plugin may need its packaged asset replaced or the new ZIP reimported). For Claude, upload `release/Ultiwrite_Claude_Plugin_v0.8.2.zip`, or update the installed marketplace plugin and reload plugins. For ChatGPT, upload the new full ZIP to the same existing plugin identity and separately update an app-owned logo in the existing custom MCP app's Manage settings when applicable; package metadata cannot change that stored app image. Directory publication and shared app updates require owner authorization. This source change is not evidence of a completed host UI update or publication.
