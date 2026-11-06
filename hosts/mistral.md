# Mistral connector dossier — unpublished

Vibe Code CLI uses configs/mistral-vibe.toml. Its documented native loopback callback fits the canonical public-client registration policy. Authenticate with `/mcp login ultiwrite`; keep write approval enabled.

For Studio, register an MCP connector with server `https://mcp.dwsoffshorepartners.com/mcp`, private visibility initially, and a customer-scoped OAuth bearer through the provider's secure credential flow. The provider API key authenticates to Mistral; it is not an Ultiwrite credential. Studio's connector APIs are public preview; follow the current management, authentication and confirmation guides rather than assuming a permanent registration request format.

The documented Studio debugger callback is already present in the canonical server's exact callback registry. That does not establish the callback of Vibe Work or every Studio consumer. Vibe Work administrators can choose Add Connector → Custom MCP Connector and OAuth 2.1/DCR. Obtain its actual callback before registration; no wildcard or new customer sign-in provider is authorized.

Studio registration, Work installation, legacy Le Chat behavior and authenticated lifecycle execution remain unverified. The canonical eight-tool catalog and upload/job/report workflow apply unchanged.

Sources: https://docs.mistral.ai/studio/connectors, https://docs.mistral.ai/vibe/work/connectors/mcp-connectors and https://docs.mistral.ai/vibe/code/cli/mcp-servers.
