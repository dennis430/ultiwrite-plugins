# Ultiwrite plugins

Thin connectors for Ultiwrite Commercial Diligence. Publisher: DWS Offshore Fund. Product: Ultiwrite.

This repository is plugin packaging only. It is not the Ultiwrite service, and it does not include the private analytical implementation or customer records. The MIT license covers the original thin connector code. The service itself remains proprietary. See LICENSE and NOTICE.

Remote MCP: https://mcp.dwsoffshorepartners.com/mcp (Claude 0.8.3) and https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp (ChatGPT, Cursor, Grok Bot 0.7.1). Both reach the same Ultiwrite server and account.
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Website: https://dwsoffshorepartners.com
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

| Directory | Version | What it is |
| --- | --- | --- |
| `claude/` | 0.8.3 | Claude plugin: the Ultiwrite remote MCP server (`https://mcp.dwsoffshorepartners.com/mcp`) plus five skills (`ultiwrite`, `connect-account`, `submit-evidence`, `read-report`, `follow-up`). Source for the Claude directory submission and the Claude marketplace entry. |
| `chatgpt/` | 0.7.1 | ChatGPT/Codex plugin source for the existing unpublished listing identity. Not uploaded by this repository. |
| `cursor/` | 0.7.1 | Cursor plugin. Manifest `.cursor-plugin/plugin.json`, remote Streamable HTTP `mcp.json`. |
| `grokbot/` | 0.7.1 | Grok Bot submission dossier. Not consumer Grok, and not a completed host test. |
| `client/` | 0.7.1 | Local `ultiwrite-mcp` wrapper. Not published to npm. |

## Downloads

| File | Package | SHA-256 |
| --- | --- | --- |
| [`release/Ultiwrite_Claude_Plugin_v0.8.3.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.3.zip) | Claude plugin 0.8.3 (current) | `97e3cfd855c3b1344a9bbfbe6cc1b9d317403d7c869ac416d3bec23989803f00` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.1.zip) | Claude plugin 0.8.1 (superseded, kept for existing links) | `11520ccd818dddd576a7b230e08b74142f3012fb0ea2d10f4b6f37c105e6e8b0` |
| [`release/Ultiwrite_Claude_Plugin_v0.8.0.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.8.0.zip) | Claude plugin 0.8.0 (superseded, kept for existing links) | `619656fae4e9b9db2d7a7e0c813713d859cde291062c21912bb38fc7297ca28e` |
| [`release/ultiwrite-chatgpt-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.7.1.zip) | ChatGPT plugin 0.7.1 | `457004b3d46b7aeaddabc1a5d065c181aac2b5a280369be7f9539de39d1339a4` |
| [`release/ultiwrite-cursor-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.7.1.zip) | Cursor plugin 0.7.1 | `e34aa2e43d7062871de121c479ef5e8a7fe214f20b400464624605fc419e15f1` |
| [`release/ultiwrite-claude-plugin-0.7.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-claude-plugin-0.7.1.zip) | Claude plugin 0.7.1 (superseded, kept for existing links) | `7b53857bcd7450b68a869b90d29c1112e89fcb3f707fd87ccadcacc73f906bfe` |

`release/SHA256SUMS.txt` and `release/INVENTORY.json` list the same hashes and every archive member. `node scripts/pack-public-connectors.mjs` reproducibly rebuilds the current archives from source. Add `--check` to verify source/archive parity without rewriting them. Historical ZIPs stay unchanged.

## Install the Claude plugin

- claude.ai, Claude Desktop, Cowork: Plugins > Add > Upload plugin (Customize > Plugins on the older interface), and choose `Ultiwrite_Claude_Plugin_v0.8.3.zip`.
- Claude Code: `/plugin marketplace add dennis430/ultiwrite-plugins`, then `/plugin install ultiwrite@ultiwrite`. For one session, clone the repository and run `claude --plugin-dir ./claude`, or pass the extracted ZIP directory containing `.claude-plugin/plugin.json`.
- Ask "Connect Ultiwrite and confirm which account is connected." The protected account check starts native OAuth when needed. No API key goes in any config.

If the sign-in window closes, open **Plugins > Ultiwrite > Connectors** and select **Connect**, or use **Customize > Connectors > Ultiwrite** on the older interface. Claude Code offers **`/mcp` > Ultiwrite > Authenticate**. Ask "Reconnect Ultiwrite" to use the bundled recovery workflow. For another account, start a fresh authorization and choose **Use a different account** on Ultiwrite's consent screen. See [Claude connection recovery](claude/README.md#connect-again-or-use-a-different-account).

Cursor multi-plugin entry: `.cursor-plugin/marketplace.json` points at `cursor`.
Claude marketplace entry: `.claude-plugin/marketplace.json` points at `./claude`.

Direct remote MCP, which does not require this repository:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Cursor settings can use either Remote MCP URL above. Do not put an API key in either config. The host completes Ultiwrite OAuth.

`server.draft.json` is unpublished MCP Registry metadata. Do not treat it as a listing.

Claude source and its ZIP are at 0.8.3; ChatGPT, Cursor, Grok Bot and the client remain at 0.7.1. npm is not published. The Claude directory tracks `claude/` on the configured GitHub branch. A new commit and version make the update available for Anthropic's scan; the portal's review and publication policy determines when it reaches users. GitHub availability does not establish directory approval or an installed client's version.
