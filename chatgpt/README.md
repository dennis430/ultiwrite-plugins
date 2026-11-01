# Ultiwrite for ChatGPT and Codex

Version 0.8.0. Product: Ultiwrite. Publisher: DWS Offshore Fund. This is the source package for the existing Ultiwrite plugin identity.

Ultiwrite provides asymmetric diligence and investigative intelligence: submit authorized commercial evidence, follow the investigation, read its saved findings and plan the next evidence request.

## Installed experience

The portable plugin contains a remote MCP connection that discovers OAuth from the protected-resource challenge, current Ultiwrite branding, developer and policy links, and five separately discoverable skills:

| Skill | What it does |
| --- | --- |
| `ultiwrite-read` | Explain capabilities and route a request |
| `connect-account` | Connect, reconnect, add/switch where supported and verify the selected account |
| `submit-evidence` | Submit authorized files or open the secure upload handoff |
| `read-report` | Read saved findings, confidence, Decision Brief and download links |
| `follow-up` | Turn unresolved findings into evidence requests |

Every skill includes its own display name, short description and `policy.allow_implicit_invocation: true`. The onboarding entry opens `connect-account`. New installations therefore allow automatic workflow selection; a host policy or a user's disabled skill stays authoritative. This setting does not force an existing user's toggle back on.

ChatGPT renders the **Permissions**, **Connected accounts**, **Connect another account** and **Skills** controls. The service supplies OAuth discovery and a verified account profile; the package supplies skills and listing metadata. It does not render a substitute settings page or change ChatGPT's global approval policy. Host versions and workspace policy determine the controls shown.

## Account selection and permissions

1. Install the package or open the existing Ultiwrite plugin.
2. Choose **Connect** and complete Ultiwrite's OAuth flow. `ultiwrite:read` permits account/report reads; `ultiwrite:evidence` permits evidence submission. The service advertises both permissions through OAuth discovery; the user chooses access in the actual consent flow.
3. Ask “Which Ultiwrite account is connected?” The protected `ultiwrite_account_get` call returns the verified profile from the selected grant. The server marks it with OpenAI's profile metadata so compatible hosts can name connected accounts.
4. To add an identity, use **Connect another account** when the host offers it. To replace one, reconnect and choose **Use a different account** on Ultiwrite's consent screen. Verify the returned identity before continuing.
5. If the sign-in window closed or the grant expired, use the plugin's persistent Connect/Reconnect control; reinstalling is unnecessary.

The host permission modes determine when ChatGPT asks before using tools. They do not grant scopes, alter account entitlements or authorize an investigation purchase. Enabled skills are available workflows, not automatic evidence submission or a paid add-on choice.

## Evidence and reports

Use only original file objects supported by the host and live tool schema. When the host cannot forward file contents, Ultiwrite returns an account-bound upload link. Follow the returned expiry and upload instructions; obtaining a link alone is not an analysis. The service returns current accepted inputs, limits and offers through `ultiwrite_capabilities_get`.

Read the actual saved workflow state before describing results. Reports retain their saved findings, confidence, evidence and limitations. PDF, Excel or ZIP downloads open in the browser signed in to the same account; the plugin does not expose public report links or process payments.

## Portable client compatibility

The MCP server entry contains only `type` and the clean canonical `url`. OAuth comes from the server's protected-resource challenge and discovery metadata. This preserves the canonical 0.7.2 fix for a portable client that rejected per-server `extensions` before loading the connection. Do not reintroduce static provider auth fields in this portable artifact merely to describe permission defaults. The existing apex endpoint remains a server compatibility route for previously configured connections.

## Build and publish

Run `node scripts/validate-public-plugins.mjs` and `node scripts/pack-public-connectors.mjs` from the repository root. The current archive is `release/ultiwrite-chatgpt-plugin-0.8.0.zip`; `--check` verifies source/archive parity. Historical archives remain intact.

Update the existing OpenAI listing; inspect its current portal state before uploading and preserve its identity. This source release does not prove directory upload, review, account labels in an installed host, or a completed customer journey. Its server contract and live host behavior require separate verification.

## Links and data handling

MCP: https://mcp.dwsoffshorepartners.com/mcp

Website: https://dwsoffshorepartners.com · Setup: https://dwsoffshorepartners.com/docs/mcp · Support: https://dwsoffshorepartners.com/contact · Privacy: https://dwsoffshorepartners.com/privacy · Terms: https://dwsoffshorepartners.com/terms

OAuth credentials stay with the host. This package contains no credentials or telemetry. Authorized requests and submitted evidence are processed by the existing Ultiwrite service under its privacy policy and account controls. The MIT license covers this thin package only; the analytical service remains proprietary.
