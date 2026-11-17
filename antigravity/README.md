# Ultiwrite for Antigravity

Thin connector for Ultiwrite asymmetric diligence. Publisher: DWS Offshore Fund. Product: Ultiwrite.

Remote MCP: https://mcp.dwsoffshorepartners.com/mcp
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Website: https://dwsoffshorepartners.com
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

This plugin registers the hosted Ultiwrite MCP server (`mcp_config.json`, remote Streamable HTTP via `serverUrl`) and the `ultiwrite` skill. Do not put an API key in the config. The host completes Ultiwrite OAuth.

Install locally:

    agy plugin validate --strict ./antigravity
    agy plugin install ./antigravity

Repository status: prepared for the Antigravity Marketplace partner intake form. Not yet submitted. Installing from GitHub or a local folder is not a curated Marketplace listing.
