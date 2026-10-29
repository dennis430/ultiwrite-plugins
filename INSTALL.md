# Ultiwrite — install and upload

Preferred remote MCP URL: https://mcp.dwsoffshorepartners.com/mcp
Existing connections may keep https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp.
Setup guide: https://dwsoffshorepartners.com/docs/mcp

Add the remote server in the client's MCP settings, authenticate with Ultiwrite and approve account access. Canonical sign-in happens on the existing engine host; the resource and issuer remain the public connector URL. Sign in with Google to access an existing account or create a new Ultiwrite account. The first completed account analysis is free under the standard policy; subsequent analysis uses the account’s available allowance. Connecting does not grant extra credits. Report review/publication, upload limits and export entitlement follow the website's canonical policy.

Claude Code remote setup:

    claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp

Cursor configuration:

    {"mcpServers":{"ultiwrite":{"url":"https://mcp.dwsoffshorepartners.com/mcp"}}}

ChatGPT: use the custom MCP app path where the plan/workspace supports it, or upload the ChatGPT plugin ZIP to the EXISTING unpublished OpenAI identity. Do not create a duplicate listing. Plugin id: plugin_asdk_app_6ad72494738c8191af2df24a75ab4afc. Prior uploaded version: 0.4.1. The public connector source and generated archives are 0.7.1 and were not uploaded to OpenAI. The website was observed serving the 0.7.1 ZIPs on 29 October 2026; versioned downloads and source revisions are separate release surfaces. The owner must inspect current portal state before replacing a draft. Public directory publication is not claimed. Rebuild with `node scripts/pack-public-connectors.mjs`.

Claude: `release/Ultiwrite_Claude_Plugin_v0.8.2.zip` is for personal or organization upload (Customize > Plugins > Add > Upload plugin) For Claude Code, extract the ZIP and pass the extracted folder to `claude --plugin-dir ./ultiwrite-plugin`. The plugin directory uses a thin public source repository; the distribution-source archive contains only that prepared tree. The existing proprietary license is retained. The thin source is https://github.com/dennis430/ultiwrite-plugins. Actual host verification and directory review remain pending.

Cursor: start from https://cursor.directory/plugins/ultiwrite and choose Add to Cursor, then complete Ultiwrite Google sign-in and authorization. That action installs a remote MCP configuration, not this repository ZIP. The prepared Cursor 0.7.2 package uses the preferred URL; the current directory payload uses the supported application URL and requires a separate publisher edit. Cursor Directory is separate from the first-party Marketplace. For local files, use the exact signed browser upload link when Cursor cannot forward original downloadable bytes. Return to the same conversation and follow the saved case and workflow continuation; never send a local path as evidence. Grok Bot's ZIP is a submission dossier for the MCP/repository form, not a plugin importer or a consumer Grok release.

Local npm client (packaged, NOT published):

    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp doctor
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp login
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp stdio
    npm exec --package ./ultiwrite-mcp-0.7.1.tgz -- ultiwrite-mcp upload "/path/to/authorized evidence.pdf"

`upload` reads only the specified local files, streams to scoped storage, and commits through canonical intake. A remote MCP server cannot read a local filesystem path. Large files use multipart storage transfer. The CLI keeps diagnostics off protocol stdout and refreshes credentials when permitted.

Do not advertise `npx ultiwrite-mcp` until an authorized npm publisher publishes the exact tarball and a clean registry install succeeds. Publisher command after rights/ownership confirmation:

    npm publish ./ultiwrite-mcp-0.7.1.tgz --access public

iPhone source and App Store materials are source preparation only. No Xcode build, archive, signing or TestFlight receipt exists. The website does not promote an iPhone app. See HUMAN_ACTIONS.md and the independent readiness table.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. The Cursor Directory entry is publicly reachable. The Claude directory owner-portal status and first-party marketplace statuses require separate confirmation. No completed host journey is claimed from packaging alone. The production MCP endpoint is independent of marketplace review.
