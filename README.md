# Ultiwrite plugins

Thin connectors for Ultiwrite Commercial Diligence. Publisher: DWS Offshore Fund. Product: Ultiwrite.

This repository is plugin packaging only. It is not the Ultiwrite service, and it does not include the private analytical implementation or customer records. The MIT license covers the original thin connector code. The service itself remains proprietary. See LICENSE and NOTICE.

Preferred remote MCP: https://mcp.dwsoffshorepartners.com/mcp (Claude 0.8.2 and Cursor 0.7.2). Existing packages and connections may keep https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp. Both URLs are OAuth-protected resources for the same Ultiwrite service and account; keep an existing grant paired with its installed URL until reconnecting.
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Website: https://dwsoffshorepartners.com
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

| Directory | Version | What it is |
| --- | --- | --- |
| `claude/` | 0.8.2 | Claude plugin: the Ultiwrite remote MCP server (`https://mcp.dwsoffshorepartners.com/mcp`) plus four skills (`ultiwrite`, `submit-evidence`, `read-report`, `follow-up`). Source for the Claude directory submission and the Claude marketplace entry. |
| `chatgpt/` | 0.7.1 | ChatGPT/Codex plugin source for the existing unpublished listing identity. Not uploaded by this repository. |
| `cursor/` | 0.7.2 | Cursor plugin. Manifest `.cursor-plugin/plugin.json`, remote Streamable HTTP `mcp.json`. |
| `grokbot/` | 0.7.1 | Grok Bot submission dossier. Not consumer Grok, and not a completed host test. |
| `client/` | 0.7.1 | Local `ultiwrite-mcp` wrapper. Not published to npm. |

## Downloads

| File | Package | SHA-256 |
| --- | --- | --- |
| [`release/Ultiwrite_Claude_Plugin_v0.8.2.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.2.zip) | Claude plugin 0.8.2 (candidate) | `dbcb3f3e8c0f3708c1286873fdebb231712991ca49fba09e2acd6313554fc5c0` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.1.zip) | Claude plugin 0.8.1 (superseded; existing links retained) | `11520ccd818dddd576a7b230e08b74142f3012fb0ea2d10f4b6f37c105e6e8b0` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.0.zip) | Claude plugin 0.8.0 (superseded, kept for existing links) | `619656fae4e9b9db2d7a7e0c813713d859cde291062c21912bb38fc7297ca28e` |
| [`release/ultiwrite-chatgpt-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.7.1.zip) | ChatGPT plugin 0.7.1 | `457004b3d46b7aeaddabc1a5d065c181aac2b5a280369be7f9539de39d1339a4` |
| [`release/ultiwrite-cursor-plugin-0.7.2.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.7.2.zip) | Cursor plugin 0.7.2 (candidate) | `a418db8b3e029590907aa99028ce0d14a8b5ffc6b59dcf3c9d5e7e509aa1b35f` |
| [`release/ultiwrite-cursor-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.7.1.zip) | Cursor plugin 0.7.1 (existing links retained) | `e34aa2e43d7062871de121c479ef5e8a7fe214f20b400464624605fc419e15f1` |
| [`release/ultiwrite-claude-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-claude-plugin-0.7.1.zip) | Claude plugin 0.7.1 (superseded, kept for existing links) | `7b53857bcd7450b68a869b90d29c1112e89fcb3f707fd87ccadcacc73f906bfe` |

`release/SHA256SUMS.txt` and `release/INVENTORY.json` list hashes and archive members. `node scripts/pack-cursor-plugin.mjs --check` checks Cursor source against its ZIP. `node scripts/pack-public-connectors.mjs` first verifies Claude source parity, rebuilds ChatGPT, and records Cursor and Claude artifacts. Older versioned archives are preserved.

## Install the Claude plugin

- claude.ai, Claude Desktop, Cowork: Customize > Plugins > Add > Upload plugin, and choose `Ultiwrite_Claude_Plugin_v0.8.2.zip`.
- Claude Code: `/plugin install ultiwrite --marketplace dennis430/ultiwrite-plugins`, or extract the ZIP into `./ultiwrite-plugin` and load that folder for one session with `claude --plugin-dir ./ultiwrite-plugin`.
- The first tool call opens Ultiwrite sign-in (OAuth). No API key goes in any config.

Cursor multi-plugin entry: `.cursor-plugin/marketplace.json` points at `cursor`.
Claude marketplace entry: `.claude-plugin/marketplace.json` points at `./claude`.

Direct remote MCP, which does not require this repository:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Start from [Cursor Directory](https://cursor.directory/plugins/ultiwrite) or use Cursor settings with the preferred Remote MCP URL above. Do not put an API key in either config. The host completes Ultiwrite OAuth.

`server.draft.json` is unpublished MCP Registry metadata. Do not treat it as a listing.

Claude 0.8.2 and Cursor 0.7.2 are the prepared source/artifacts in this revision. ChatGPT, Grok Bot and the local client remain at 0.7.1. npm is not published. The [Cursor Directory entry](https://cursor.directory/plugins/ultiwrite) is publicly reachable; it currently installs the supported application endpoint under the generic name `server`. The prepared correction uses `ultiwrite` and the preferred URL. Releasing this repository does not apply a directory edit. The [Claude entry](https://claude.ai/directory/ultiwrite) requires an owner-portal check for its actual publication/authentication state. Directory visibility and package validation do not prove a completed client connection or assessment.
