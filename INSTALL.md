# Ultiwrite connectors — install and upload

Remote MCP URL: https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp
Setup guide: https://dwsoffshorepartners.com/docs/mcp

Add the remote server in the client's MCP settings, authenticate with Ultiwrite and approve account access. Canonical sign-in happens on the existing engine host; the resource and issuer remain the public connector URL. An existing account and available analysis allowance are required. Connecting does not grant extra credits. Report review/publication, upload limits and export entitlement follow the website's canonical policy.

Claude Code remote setup:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Cursor configuration:

    {"mcpServers":{"ultiwrite":{"url":"https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp"}}}

ChatGPT: use the custom MCP app path where the plan/workspace supports it, or upload the ChatGPT plugin ZIP to the EXISTING unpublished OpenAI identity. Do not create a duplicate listing. Plugin id: plugin_asdk_app_6ad72494738c8191af2df24a75ab4afc. Prior uploaded version: 0.4.1. The public connector source and generated archives are 0.7.1 and were not uploaded to OpenAI. Production website downloads remain 0.7.0 until the merchant-risk-app download change is deployed. The owner must inspect current portal state before replacing a draft. Public directory publication is not claimed. Rebuild with `node scripts/pack-public-connectors.mjs`.

Claude: use `release/Ultiwrite_Claude_Plugin_v0.8.3.zip` for personal or organization upload through Plugins > Add > Upload plugin (Customize > Plugins on the older interface). For Claude Code, add `/plugin marketplace add dennis430/ultiwrite-plugins`, then `/plugin install ultiwrite@ultiwrite`. `claude --plugin-dir` requires the extracted directory containing `.claude-plugin/plugin.json`, not the ZIP. The thin package remains MIT licensed; the analytical service remains proprietary. Source: https://github.com/dennis430/ultiwrite-plugins/tree/main/claude.

If sign-in was dismissed, ask "Reconnect Ultiwrite" or open Plugins > Ultiwrite > Connectors and choose Connect. The older interface uses Customize > Connectors > Ultiwrite; Claude Code uses `/mcp` > Ultiwrite > Authenticate. The account check triggers native authorization and verifies the resulting identity. For a different identity, reconnect and select Use a different account in Ultiwrite's consent flow. Website sign-in alone does not finish the Claude connection. See `claude/README.md` for the complete recovery workflow. Directory ingestion and actual host verification remain separate from this source release.

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

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. Directory review, publication and host installation are verified in the corresponding portals; this source package alone does not establish them. The production MCP endpoint is independent of marketplace review.
