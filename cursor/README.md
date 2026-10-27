# Ultiwrite for Cursor

Version 0.7.1. Publisher: DWS Offshore Fund. License: MIT for this thin connector only. See LICENSE.

Remote MCP, production, no API key:

https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp

This directory is the Cursor plugin. The repository root `.cursor-plugin/marketplace.json` lists it with `source` set to `cursor`.

Not submitted to the Cursor Marketplace. No Cursor host session was run for 0.7.1. Direct connection is what the production setup guide already documents:

1. Open Cursor MCP settings.
2. Add the server URL above. Do not paste an API key.
3. Connect and approve Ultiwrite account access when the host starts OAuth.

Setup guide: https://dwsoffshorepartners.com/docs/mcp

The website still offers the older 0.7.0 zip. This directory is the repaired 0.7.1 source. Those bytes are not the same.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. It was not submitted to a plugin marketplace or directory. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.
