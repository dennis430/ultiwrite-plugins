# Microsoft connector dossier — unpublished

Use the canonical HTTPS MCP URL in Copilot Studio's **Add tool → Model Context Protocol** onboarding wizard. Select Streamable HTTP and OAuth. Customers use Ultiwrite’s existing sign-in flow and approve scoped OAuth access; Microsoft tenant identity does not replace the authorized Ultiwrite account.

Authorization-server discovery: `https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server`. Protected resource metadata: `https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp`. The server supports public-client authorization code with PKCE S256, DCR for supported exact redirects, refresh and revocation. Use the live metadata for endpoints.

Microsoft 365's existing exact callback is `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect`. Do not assume this is the callback for every Copilot Studio tenant. Obtain the exact callback from that tenant's wizard and compare it with the canonical approved registration. A wizard that requires a confidential client secret or Entra on-behalf-of exchange is blocked by the authentication-mode difference; preserve the existing customer sign-in flow and callback validation.

Prepare the agent overview from catalog.json and preserve read/evidence scopes, write approval, durable case continuation and same-account delivery. Agent Store submission, tenant approval and actual customer OAuth/tool execution are outstanding. Microsoft 365, Copilot Studio, GitHub Copilot and consumer Copilot have separate status rows.

Sources: https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent and https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-oauth.
