# Ultiwrite for Microsoft 365 Copilot

Prepared on November 1, 2026. This is the **declarative agent route to the Copilot Agent Store**. It wraps the existing hosted Ultiwrite MCP service; it adds no second analytical engine.

## What is prepared

- A Microsoft 365 app manifest, declarative agent manifest and remote MCP plugin manifest.
- Current hosted endpoint: `https://mcp.dwsoffshorepartners.com/mcp`.
- Static public-client OAuth with S256 PKCE and Microsoft Enterprise token-store authentication.
- Dynamic tool discovery, so the wrapper uses the server's current authorized tools.
- Four conversation starters, evidence-upload handoff and saved-report instructions.
- Exact upload recovery through the returned `handoffId`, without guessing a recent case.
- Required 192-pixel color and 32-pixel transparent white icons derived from the existing Ultiwrite logo.
- A public OAuth registration helper, official schema snapshots and an offline package validator/builder.
- Store copy and a reviewer scenario sheet in [SUBMISSION.md](SUBMISSION.md).

**Status:** source prepared. Microsoft app ID, Microsoft auth-config ID, tenant sign-in proof, actual Copilot screenshots and store review remain outstanding. The templates intentionally retain two configuration variables. The builder refuses to create a distribution ZIP without actual IDs. Template validation is separate from testing in Copilot.

## Account links and the order to use them

| Step | Link | Action |
| --- | --- | --- |
| 1 | [Microsoft 365 and Copilot publisher enrollment](https://partner.microsoft.com/dashboard/account/v3/enrollment/introduction/office) | Reuse the company Partner Center account and complete Microsoft 365 and Copilot enrollment and business verification. |
| 2 | [Partner Center](https://partner.microsoft.com/dashboard) | In Account settings → Programs, confirm Microsoft 365 and Copilot is registered. An existing publisher account needs its **Owner** role to add that program; being an Entra Global Administrator does not itself establish publisher ownership. |
| 3 | [Teams developer portal](https://dev.teams.microsoft.com/) | Create or reuse the intended Ultiwrite app identity and its static OAuth auth configuration. |
| 4 | [Microsoft 365 Agents Toolkit](https://aka.ms/teams-toolkit) | Install the current toolkit in VS Code. Microsoft's MCP walkthrough specifies version 6.12.0 or later. |
| 5 | [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat) | Sideload into the intended development tenant, connect Ultiwrite and capture the actual reviewer scenarios. |
| 6 | [Partner Center offers](https://partner.microsoft.com/dashboard) | Marketplace offers → Microsoft 365 and Copilot → New offer → Apps and Agents for M365 and Copilot. Add the package, copy and real screenshots, then submit when authorized. |

Enrollment authority, legal business verification and required tenant licenses are account steps. A paid Azure hosting deployment is not created by this wrapper. Microsoft controls which programs and experiences are enabled for the account. See the [enrollment requirements](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/open-a-developer-account) and [MCP agent walkthrough](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins).

## Configure OAuth once

The current Ultiwrite server uses public clients and PKCE. Select **OAuth with static registration** for Microsoft. Microsoft's dynamic-registration option presently requires a confidential secret, so it is not the matching option for this server. Microsoft's [static OAuth documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-oauth) supports public clients; its [DCR documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-dynamic-client-registration) describes the different requirement.

First preview the registration request, which performs no network mutation:

```bash
node scripts/register_public_client.mjs
```

When ready, run the helper once and retain the resulting local record. It registers a public client with Ultiwrite; it does not connect a user or provision Microsoft:

```bash
node scripts/register_public_client.mjs --register
```

In Teams developer portal → Tools → OAuth client registration, enter the returned public client ID and the following fields. Retain the PKCE setting and leave confidential credentials absent for this public-client registration. If the account's current portal form does not allow public-client configuration, use the current Agents Toolkit static OAuth path; do not fabricate a credential.

| Field | Value |
| --- | --- |
| Registration name | Ultiwrite Microsoft 365 Copilot |
| Base URL | `https://mcp.dwsoffshorepartners.com/mcp` |
| Callback registered with Ultiwrite | `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect` |
| Authorization endpoint | `https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize` |
| Token and refresh endpoint | `https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token` |
| Scope | `ultiwrite:read ultiwrite:evidence` |
| PKCE | Enabled; S256 |
| Restrict usage by app | Any Teams app |
| Restrict usage by organization | Own organization for development; Any Microsoft 365 organization for the public listing |

Save the resulting **auth-config ID** as `ULTIWRITE_MCP_AUTH_ID`. This ID is distinct from the Ultiwrite public OAuth client ID. The app's actual Microsoft UUID is `M365_APP_ID`. Keep the same app identity for later releases. Public-distribution auth settings must match the final tested package.

The endpoint fields above were checked against live public metadata. The helper rechecks that metadata before registration. It fails if the service identity or authentication mode changes.

## Validate and build

From this folder, use Python 3.10+ and Node 18+. On Windows PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/build_package.py
```

On macOS or Linux:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/build_package.py
```

That command validates the templates with clearly labeled local fixture IDs and creates no upload ZIP. To build with the real provisioned IDs, set `M365_APP_ID` and `ULTIWRITE_MCP_AUTH_ID` in your local environment, then run:

```powershell
.\.venv\Scripts\python.exe scripts/build_package.py --package
```

On macOS or Linux, the equivalent command is `.venv/bin/python scripts/build_package.py --package`.

The output is `build/ultiwrite-m365-0.9.2.zip`, with its checksum printed. It contains the three resolved manifests and two icons at the ZIP root. Existing archives are preserved; select `--output` for a different filename if needed. No credential, registration record, schema cache or source documentation is included in that upload ZIP.

Run the current toolkit's manifest validation and sideload the exact configured package. Complete the scenarios in [SUBMISSION.md](SUBMISSION.md). Store approval and installed-host success have not been established by the offline schema checks.

## Scope of this package

This package is for the declarative Agent Store route. Microsoft's separate [standalone MCP certification program](https://learn.microsoft.com/en-us/microsoft-agent-365/mcp-certification) has its own current requirements; this package is not labeled as a standalone MCP certification submission.

The agent requests no Microsoft Graph, email, calendar or SharePoint permission. Users authorize access to their Ultiwrite account and evidence submission. Copilot attachments are not presumed to be transferable original bytes; the supported browser upload handoff is the default path. Authentication, account isolation, entitlements and analysis continue to be enforced by the existing service.

## Exact upload and report contract

For an authorized new handoff, `ultiwrite_evidence_submit` receives:

```json
{"files": [], "caseId": null, "handoffId": null, "documentForensics": null}
```

Preserve an explicit forensic choice as true or false. Retain the returned `handoffId` and present the exact returned `uploadLink`. After browser receipt, recover the corresponding saved case with empty files, `caseId: null`, that exact returned `handoffId`, and `documentForensics: null`. Use the returned case identifier for status. Only a server-requested continuation uses empty files, that `caseId`, `handoffId: null` and `documentForensics: null`. Case-list order does not establish which upload belongs to the handoff.

For report delivery, use only the `reportUrl`, `signInUrl` and entitled download links actually returned by `ultiwrite_report_export`. The same-account browser sign-in requirement remains in force.
