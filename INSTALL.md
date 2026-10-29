# Ultiwrite 0.7.1 — install and upload

Remote MCP URL: https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp
Setup guide: https://dwsoffshorepartners.com/docs/mcp

Add the remote server in the client's MCP settings, authenticate with Ultiwrite and approve account access. Canonical sign-in happens on the existing engine host; the resource and issuer remain the public connector URL. An existing account and available analysis allowance are required. Connecting does not grant extra credits. Report review/publication, upload limits and export entitlement follow the website's canonical policy.

Claude Code remote setup:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Cursor configuration:

    {"mcpServers":{"ultiwrite":{"url":"https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp"}}}

ChatGPT: use the custom MCP app path where the plan/workspace supports it, or upload the ChatGPT plugin ZIP to the EXISTING unpublished OpenAI identity. Do not create a duplicate listing. Plugin id: plugin_asdk_app_6ad72494738c8191af2df24a75ab4afc. Prior uploaded version: 0.4.1. The public connector source and generated archives are 0.7.1 and were not uploaded to OpenAI. Production website downloads remain 0.7.0 until the merchant-risk-app download change is deployed. The owner must inspect current portal state before replacing a draft. Public directory publication is not claimed. Rebuild with `node scripts/pack-public-connectors.mjs`.

Claude: `release/Ultiwrite_Claude_Plugin_v0.8.1.zip` is for personal or organization upload (Customize > Plugins > Add > Upload plugin) and `claude --plugin-dir`. The plugin directory uses a thin public source repository; the distribution-source archive contains only that prepared tree. The existing proprietary license is retained. The thin source is https://github.com/dennis430/ultiwrite-plugins. Actual host verification and directory review remain pending.

Cursor: plugin ZIP plus the matching thin distribution-source archive. Public Marketplace submission requires its actual source URL and host verification. Grok Bot's ZIP is a submission dossier for the MCP/repository form, not a plugin importer or a consumer Grok release.

Local npm client (packaged, NOT published):

    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp doctor
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp login
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp stdio
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp upload "/path/to/authorized evidence.pdf"

`upload` reads only the specified local files, streams to scoped storage, and commits through canonical intake. A remote MCP server cannot read a local filesystem path. Large files use multipart storage transfer. The CLI keeps diagnostics off protocol stdout and refreshes credentials when permitted.

Do not advertise `npx ultiwrite-mcp` until an authorized npm publisher publishes the exact tarball and a clean registry install succeeds. Publisher command after rights/ownership confirmation:

    npm publish ./ultiwrite-mcp-0.7.1.tgz --access public

iPhone source and App Store materials are source preparation only. No Xcode build, archive, signing or TestFlight receipt exists. The website does not promote an iPhone app. See HUMAN_ACTIONS.md and the independent readiness table.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. It was not submitted to a plugin marketplace or directory. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.
