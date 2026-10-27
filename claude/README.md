# Ultiwrite for Claude

Version 0.7.1. Publisher: DWS Offshore Fund.

Remote MCP: `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`

Personal import can use a ZIP built from this folder. The public Claude marketplace file is `.claude-plugin/marketplace.json` at the repository root, with source `./claude`.

`.mcp.json` uses `type: http`, which is the remote form Claude documents for connectors. Cursor's package uses `streamable-http`. Do not install both against the same chat if that would duplicate the tool list.

No `bin/` directory is included. The npm client is a separate package and is not on the npm registry.

Website https://dwsoffshorepartners.com · Privacy https://dwsoffshorepartners.com/privacy · Terms https://dwsoffshorepartners.com/terms · Support https://dwsoffshorepartners.com/contact

Thin source: https://github.com/dennis430/ultiwrite-plugins

Claude Code: `/plugin install ultiwrite --marketplace dennis430/ultiwrite-plugins`

Claude does not receive ChatGPT file objects. Evidence submission uses the signed browser upload link returned by `ultiwrite_evidence_submit` with `{}`. That link does not by itself finish an analysis. This file does not claim a live directory listing, a Claude Chat install, Cowork, or a Claude Code session. Production registration of Claude Code's ephemeral `http://localhost:<port>/callback` was rejected on 2026-10-27; the hosted callback `https://claude.ai/api/mcp/auth_callback` is the one the server already allows. A source fix for the loopback is not production until it is deployed.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. It was not submitted to a plugin marketplace or directory. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.
