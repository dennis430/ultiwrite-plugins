# Ultiwrite for Claude

Ultiwrite Asymmetric Diligence, published by DWS Offshore Fund. Version 0.9.0.

Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation.

The evidence you provide starts the inquiry. Ultiwrite connects financial, identity, document-integrity, operational and relevant external-context signals, follows contradictions and unexpected implications across them, and brings the results into a cohesive assessment with supporting evidence, confidence and open questions. Acquisitions, financing, property, counterparties, merchants and portfolios are applications of the same engine. This plugin connects Claude to Ultiwrite’s saved analysis; findings come from the engine and retain their evidence and confidence.

## What is included

- `.mcp.json`: the Ultiwrite remote MCP server, `https://mcp.dwsoffshorepartners.com/mcp` (Streamable HTTP, OAuth).
- `skills/ultiwrite`: what Ultiwrite is, which tool to use, permissions and boundaries.
- `skills/connect-account`: connect, reconnect, recover a dismissed sign-in window and verify or switch the connected account.
- `skills/submit-evidence`: submit authorized files through the signed upload link and follow the case.
- `skills/read-report`: read, page and explain a saved report, its Decision Brief and downloads.
- `skills/follow-up`: turn unresolved findings into a specific evidence request list.

No commands, hooks, agents, executables or local servers are included. Nothing runs on your machine.

## Requirements

An Ultiwrite account, which you can create during sign-in or at https://dwsoffshorepartners.com. The first completed analysis on an account is free; `ultiwrite_capabilities_get` returns the current offer. Signing in to the website alone does not connect Claude; complete the OAuth flow from Claude's Connect control.

## Install

- claude.ai, Claude Desktop and Cowork: add Ultiwrite from the Claude directory once it is listed, or upload `Ultiwrite_Claude_Plugin_v0.9.0.zip` from Plugins > Add > Upload plugin (Customize > Plugins on the older interface).
- Claude Code: add the marketplace with `/plugin marketplace add dennis430/ultiwrite-plugins`, then run `/plugin install ultiwrite@ultiwrite`. For one session, clone this repository and run `claude --plugin-dir ./claude`, or extract the ZIP and pass the extracted directory containing `.claude-plugin/plugin.json`. `--plugin-dir` takes a directory, not a ZIP file.
- Connector only, without the skills: add a custom connector with URL `https://mcp.dwsoffshorepartners.com/mcp`, or run `claude mcp add --transport http ultiwrite https://mcp.dwsoffshorepartners.com/mcp`.

Ask "Connect Ultiwrite and confirm which account is connected." Claude calls the protected `ultiwrite_account_get` tool, which triggers its native Connect prompt when authorization is needed. Capability information describes the service; the account check verifies the connected identity. Approve `ultiwrite:read` to read cases and reports and `ultiwrite:evidence` when you want to submit evidence. No API key or password is ever entered in chat or stored in this plugin.

## Connect again or use a different account

Closing the first sign-in popup does not require reinstalling the plugin:

1. Ask "Reconnect Ultiwrite; I closed the sign-in window." Claude checks the account and uses the native authorization prompt when needed.
2. You can also open **Plugins > Ultiwrite > Connectors**, select the Ultiwrite connector and choose **Connect** or its available reconnect action. On the older interface, use **Customize > Connectors > Ultiwrite > Connect**. If the connector has not been added yet, add it from the plugin's Connectors tab first. In Claude Code, use **`/mcp` > Ultiwrite > Authenticate**.
3. Complete sign-in or sign-up in the browser window and approve the requested access. Return to Claude; it checks `ultiwrite_account_get` to confirm the account actually connected.

To switch identities, use Claude's account-switching control if available, or disconnect this Ultiwrite connector and connect it again. On the Ultiwrite consent screen, choose **Use a different account**, sign in to the intended account and approve access. Claude confirms the new identity before continuing. The plugin does not disconnect a valid account unless you ask to switch or replace it.

Claude owns its connection controls and decides whether it offers simultaneous accounts. This plugin supports a fresh authorization and account verification; it does not promise a Gmail-style **Connect another account** row on every host. A connection check never submits evidence or starts an analysis.

## Example prompts

- "Connect Ultiwrite and confirm which account is connected."
- "The sign-in window closed. Reconnect Ultiwrite."
- "Switch Ultiwrite to a different account, then confirm the identity."
- "I’m buying this business. What supports the seller’s claims, what conflicts, and what else does the evidence reveal?"
- "Investigate this property package across the financials, parties and supporting records."
- "Which relationships and inconsistencies in this portfolio deserve a closer look?"
- "What can Ultiwrite do with a seller's residual schedules?"
- "I have a merchant application and three processing statements. Run Ultiwrite diligence on them."
- "Show my Ultiwrite cases and summarize the highest-severity findings in the latest report."
- "What evidence should I request from the seller to resolve the open questions in that report?"
- "Give me the download links for that report."

## How evidence is submitted

Claude cannot hand chat attachments to the server as file objects. `ultiwrite_evidence_submit` therefore returns a signed upload link, valid for 30 minutes and bound to your account. You upload the files in your browser; the case then appears in `ultiwrite_cases_list` and analysis runs on Ultiwrite's servers. The link result can be marked `attachment_not_transferred`; that is the expected handoff, not a failure, and no analysis is used until files are uploaded.

## Privacy

The plugin itself collects nothing and contains no telemetry. When you use it, Claude sends tool requests to Ultiwrite at `mcp.dwsoffshorepartners.com` and `dwsoffshorepartners.com`: your OAuth access token, case and report ids, and paging cursors. Files you upload through the signed link go directly from your browser to Ultiwrite. Ultiwrite stores submitted evidence and saved reports in your organization's account and returns report content to Claude only for accounts you are authorized to read. No data is sent to any other destination by this plugin. Data collection, use, storage, sharing and retention are governed by the Ultiwrite privacy policy: https://dwsoffshorepartners.com/privacy. Questions: https://dwsoffshorepartners.com/contact.

## Troubleshooting

- Sign-in window closed: use the persistent connection path above or ask Claude to reconnect. Reinstalling is unnecessary.
- "Permission missing": complete Claude's reauthorization prompt for the requested operation. Reading needs `ultiwrite:read`; evidence submission needs `ultiwrite:evidence`. Use the connector's reconnect controls if no prompt is available.
- "Reconnect" or expired connection: ask Claude to check the account and complete the native Connect prompt. Verify the account afterward; website sign-in alone does not restore Claude's grant.
- Upload link expired: ask Claude to submit again; a new 30-minute link is issued.
- Case still processing: ask Claude to check the case status later. Status reads do not advance processing; Claude continues a case only with the `caseId` the server returned.
- PDF, Excel or ZIP will not download in chat: open the report link in a browser signed in to the same Ultiwrite account.

## Links

Website https://dwsoffshorepartners.com · Docs https://dwsoffshorepartners.com/docs/mcp · Privacy https://dwsoffshorepartners.com/privacy · Terms https://dwsoffshorepartners.com/terms · Support https://dwsoffshorepartners.com/contact

The MIT license in `LICENSE` covers this plugin's files. The Ultiwrite service is proprietary and governed by its terms.
