# Ultiwrite for Claude

Ultiwrite Asymmetric Diligence, published by DWS Offshore Fund. Version 0.8.2.

Ultiwrite examines the documents behind a commercial opportunity: an operating business, a merchant application, a residual or ISO book, a portfolio, a property, a financing or a counterparty. It classifies every file, runs every applicable analysis (document integrity, independent verification, identity and entity coherence, processing economics, portfolio relationships, cross-document contradictions, provenance and confidence) and saves one reconciled report. This plugin connects Claude to that same engine and teaches Claude how to use it. Claude does not produce the findings; Ultiwrite does.

## What is included

- `.mcp.json`: the Ultiwrite remote MCP server, `https://mcp.dwsoffshorepartners.com/mcp` (Streamable HTTP, OAuth).
- `skills/ultiwrite`: what Ultiwrite is, which tool to use, permissions and boundaries.
- `skills/submit-evidence`: submit authorized files through the signed upload link and follow the case.
- `skills/read-report`: read, page and explain a saved report, its Decision Brief and downloads.
- `skills/follow-up`: turn unresolved findings into a specific evidence request list.

No commands, hooks, agents, executables or local servers are included. Nothing runs on your machine.

## Requirements

Sign in with Google to an existing Ultiwrite account or create a new account during connection. The first completed analysis on an account is free; `ultiwrite_capabilities_get` returns the current offer.

## Install

- claude.ai, Claude Desktop and Cowork: add Ultiwrite from the Claude directory once it is listed, or upload `Ultiwrite_Claude_Plugin_v0.8.2.zip` with Customize > Plugins > Add > Upload plugin.
- Claude Code: `/plugin install ultiwrite --marketplace dennis430/ultiwrite-plugins`, or extract the ZIP into `./ultiwrite-plugin` and load that folder for one session with `claude --plugin-dir ./ultiwrite-plugin`.
- Connector only, without the skills: add a custom connector with URL `https://mcp.dwsoffshorepartners.com/mcp`, or run `claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp`.

The first tool call opens Ultiwrite sign-in and a consent screen. Approve `ultiwrite:read` to read cases and reports and `ultiwrite:evidence` to submit evidence. No API key or password is ever entered in chat or stored in this plugin.

## Example prompts

- "What can Ultiwrite do with a seller's residual schedules?"
- "I have a merchant application and three processing statements. Run Ultiwrite diligence on them."
- "Show my Ultiwrite cases and summarize the highest-severity findings in the latest report."
- "What evidence should I request from the seller to resolve the open questions in that report?"
- "Give me the download links for that report."

## How evidence is submitted

Claude cannot hand chat attachments to the server as file objects. `ultiwrite_evidence_submit` therefore returns a signed upload link, valid for 30 minutes and bound to your account, plus an opaque `handoffId`. Upload the files in your browser and return to the same conversation. Claude retains the handoff and calls `ultiwrite_evidence_submit` with that `handoffId` to resume the exact saved case; it does not guess a case from your latest uploads. Analysis runs on Ultiwrite's servers. The link result can be marked `attachment_not_transferred`; that is the expected handoff, not a failure, and no analysis is used until files are uploaded.

## Privacy

The plugin itself collects nothing and contains no telemetry. When you use it, Claude sends tool requests to Ultiwrite at `mcp.dwsoffshorepartners.com` and `dwsoffshorepartners.com`: your OAuth access token, case and report ids, and paging cursors. Files you upload through the signed link go directly from your browser to Ultiwrite. Ultiwrite stores submitted evidence and saved reports in your organization's account and returns report content to Claude only for accounts you are authorized to read. No data is sent to any other destination by this plugin. Data collection, use, storage, sharing and retention are governed by the Ultiwrite privacy policy: https://dwsoffshorepartners.com/privacy. Questions: https://dwsoffshorepartners.com/contact.

## Troubleshooting

- "Permission missing" or "reconnect": disconnect and reconnect Ultiwrite in your connector settings and approve both permissions.
- Upload link expired: ask Claude to submit again; a new 30-minute link is issued.
- Case still processing: ask Claude to check the case status later. Status reads do not advance processing; Claude continues a case only with the `caseId` the server returned.
- PDF, Excel or ZIP will not download in chat: open the report link in a browser signed in to the same Ultiwrite account.

## Links

Website https://dwsoffshorepartners.com · Docs https://dwsoffshorepartners.com/docs/mcp · Privacy https://dwsoffshorepartners.com/privacy · Terms https://dwsoffshorepartners.com/terms · Support https://dwsoffshorepartners.com/contact

The MIT license in `LICENSE` covers this plugin's files. The Ultiwrite service is proprietary and governed by its terms.
