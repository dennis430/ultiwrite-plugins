# Install and account connection

1. Confirm the MCP URL is `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`.
2. In Grok Bot's supported app connection, add that remote MCP server. Do not enter an API key.
3. When the host opens Ultiwrite, sign in to the existing account and approve access.
4. Scopes requested by the connector are `ultiwrite:read` and `ultiwrite:evidence`.
5. Ask the bot to read capabilities before submitting files.
6. If the host cannot attach the original files, use the signed upload link the submit tool returns, then check case status. Do not submit a second time for the same package.
7. Open website exports in a browser signed into the same account.

Account allowance, upload limits, and report release rules stay on the website. This connection does not add usage.

The Cursor plugin in `cursor/` is a separate install path. It uses the same MCP URL. This dossier does not install it.
