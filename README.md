# Ultiwrite plugins

Thin connectors for Ultiwrite Commercial Diligence. Publisher: DWS Offshore Fund. Product: Ultiwrite.

This repository is plugin packaging only. It is not the Ultiwrite service, and it does not include the private analytical implementation or customer records. The MIT license covers the original thin connector code. The service itself remains proprietary. See LICENSE and NOTICE.

Remote MCP: https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Website: https://dwsoffshorepartners.com
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

| Directory | What it is |
| --- | --- |
| `cursor/` | Cursor plugin. Manifest `.cursor-plugin/plugin.json`, remote Streamable HTTP `mcp.json`. |
| `claude/` | Claude connector source for personal import and a Claude marketplace entry. |
| `chatgpt/` | ChatGPT/Codex plugin source for the existing unpublished listing identity. Not uploaded by this repository. |
| `grokbot/` | Grok Bot submission dossier. Not consumer Grok, and not a completed host test. |
| `client/` | Local `ultiwrite-mcp` wrapper. Not published to npm. |

Cursor multi-plugin entry: `.cursor-plugin/marketplace.json` points at `cursor`.
Claude marketplace entry: `.claude-plugin/marketplace.json` points at `./claude`.

Direct remote MCP, which does not require this repository:

    claude mcp add --transport http ultiwrite https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp

Cursor settings can use the same URL. Do not put an API key in either config. The host completes Ultiwrite OAuth.

Claude Code source install, once this public repository is the marketplace you add:

    /plugin install ultiwrite --marketplace dennis430/ultiwrite-plugins

`server.draft.json` is unpublished MCP Registry metadata. Do not treat it as a listing.

Version 0.7.1 is this public source, including the ChatGPT manifest. `node scripts/pack-public-connectors.mjs` writes the three `release/ultiwrite-*-plugin-0.7.1.zip` archives. Production still serves the older 0.7.0 website zips until that download change is merged and deployed. npm is not published. No marketplace form was submitted. No Cursor, Claude, ChatGPT, or Grok Bot host journey is claimed here.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. It was not submitted to a plugin marketplace or directory. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.
