# Ultiwrite for Cursor

Version 0.9.0. Publisher: DWS Offshore Fund. License: MIT for this thin connector only. See LICENSE.

Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation.

The evidence you provide starts the inquiry. Ultiwrite connects financial, identity, document-integrity, operational and relevant external-context signals, follows contradictions and unexpected implications across them, and brings the results into a cohesive assessment with supporting evidence, confidence and open questions.

Remote MCP, production, no API key:

https://mcp.dwsoffshorepartners.com/mcp

This directory is the Cursor plugin. The repository root `.cursor-plugin/marketplace.json` lists it with `source` set to `cursor`. The manifest points at `assets/logo.png`. Installing an approved marketplace plugin is separate from connecting the raw MCP URL. This package was not submitted to the Cursor Marketplace.

Add the remote server in Cursor settings, connect, and approve Ultiwrite account access. Do not paste an API key. Use the signed upload handoff when the host cannot forward the original selected files. The account's allowance, limits, canonical analysis, and saved report are unchanged.

The account selector label `default` in Grok Bot is host-managed connection-slot UI, not an Ultiwrite organization or identity. Do not fake or rewrite token subjects, organization IDs, or OAuth scopes to try to change it. OAuth consent shows the signed-in Ultiwrite account email and offers the actual account-switch sign-out link.

No Cursor host session was run for 0.9.0. Grok Bot has a separate submission dossier and is not consumer Grok. Grok Build is not this connector.

Setup guide: https://dwsoffshorepartners.com/docs/mcp

This directory is the 0.9.0 source. Website downloads, marketplace ingestion and installed-host versions are separate release surfaces and must be checked before claiming an update has reached users.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. This metadata revision does not establish a marketplace submission. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.
