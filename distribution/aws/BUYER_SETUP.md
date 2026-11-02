# Connect Ultiwrite from an MCP client

This is prepared buyer copy for an AWS Marketplace listing. Publish it with the approved listing after Marketplace account fulfillment is working. No AWS subscription or new Ultiwrite entitlement has been created by this package.

The workflow below follows the prepared canonical 0.9.2 contract. The reconciled public connector baseline for this kit is 0.9.3. Always obtain the actual advertised schemas from the connected service before making a tool call.

## Prerequisites

Use an MCP client that supports remote Streamable HTTP and OAuth authorization with PKCE. Have access to the Ultiwrite account you intend to use. Your Marketplace offer and Ultiwrite account must be linked through the listing’s **Set up account** flow once that integration is live.

## Add the connection

Add **Ultiwrite** with this server URL:

```text
https://mcp.dwsoffshorepartners.com/mcp
```

For clients that use a `mcpServers` configuration object, `mcp-client.json` contains the minimal entry. Use the host’s documented remote MCP configuration when it uses another format. A local process, container deployment or shared vendor API key is not required for this remote connection.

Choose **Connect** or **Authenticate** in the host. Sign in to the intended Ultiwrite account, review the requested access, and complete consent. Reading uses `ultiwrite:read`; submitting evidence also uses `ultiwrite:evidence`. If the sign-in window closes early, reopen the host’s connection control. To switch accounts, start a fresh authorization and select a different account on the consent screen.

OAuth clients should read the server’s metadata rather than hard-code an authorization response:

| Metadata | URL |
| --- | --- |
| Protected resource | https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp |
| Authorization server | https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server |
| Authorization endpoint | https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize |
| Token endpoint | https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token |
| Client registration | https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register |

The metadata was read successfully during preparation. It advertises authorization code and refresh token grants, PKCE S256, and public-client token authentication (`none`). Use the advertised issuer/resource values throughout the flow; do not switch endpoint audiences during token exchange. Re-read discovery at connection time to obtain the current contract. Access tokens belong in the client’s protected credential store and authenticated requests, not in a listing, prompt or repository. For an authenticated HTTP request, the header form is `Authorization: Bearer <access_token>`; the client supplies the actual token securely.

## Available workflow

Discover the authoritative input/output schemas using MCP `tools/list`. Use the current schemas, including required nullable fields.

| Tool | Purpose |
| --- | --- |
| `ultiwrite_capabilities_get` | Current capabilities, supported inputs, limits and account-facing offers |
| `ultiwrite_account_get` | Verify the identity of the connected account |
| `ultiwrite_evidence_submit` | Authorized file handoff, browser upload link or server-requested continuation |
| `ultiwrite_cases_list` | Authorized cases and saved reports |
| `ultiwrite_case_status` | Actual saved workflow state |
| `ultiwrite_findings_get` | Saved findings, report pages and supported spans |
| `ultiwrite_coherence_get` | Saved Decision Brief |
| `ultiwrite_report_export` | Authorized report and download links |

Start with “Connect Ultiwrite and confirm which account is connected.” Then ask “What can Ultiwrite investigate in this evidence package?” Submit only the evidence authorized for the investigation. If the host cannot forward actual supported file contents, use the browser upload handoff returned by the tool. Do not substitute filenames or local paths for uploaded bytes.

For a new browser handoff, call `ultiwrite_evidence_submit` using all required fields from the advertised schema. The prepared 0.9.2 shape is:

```json
{"files": [], "caseId": null, "handoffId": null, "documentForensics": null}
```

Give the user the exact returned `uploadLink` and retain the returned `handoffId`. After the browser confirms receipt, recover that exact upload by calling the same tool with `files: []`, `caseId: null`, the exact returned value in `handoffId`, and `documentForensics: null`. A pending handoff is not a completed analysis. Do not choose an unrelated newest case or ask the user to copy identifiers that the service has already returned.

If the service requests case continuation, send its exact returned `caseId` with `files: []`, `handoffId: null`, and `documentForensics: null`. Preserve an explicit Document Forensics choice when starting the investigation; null on continuation preserves the saved choice. Do not re-upload the same files to recover a handoff.

Track the returned case identifier until the service reports the actual state. Read findings and their remaining pages before representing the assessment as complete. Use only the report and download links returned by the export tool; browser downloads may require signing in to the same Ultiwrite account.

## Limits and recovery

The account’s current allowance and the service’s advertised limits apply. Obtain numerical limits from `ultiwrite_capabilities_get`; this package does not invent a fixed request rate. Respect an HTTP `429` response and any `Retry-After` value. Do not automatically resubmit evidence to retry a failed request.

A missing or expired grant normally triggers an HTTP `401` challenge and the host’s OAuth flow. A missing scope requires reauthorization for the requested operation. Confirm account identity again after reconnecting. An unavailable or empty case list does not prove that no saved reports exist: inspect the report collection and returned pagination as well.

Support: [Ultiwrite contact](https://dwsoffshorepartners.com/contact). Documentation: [MCP setup](https://dwsoffshorepartners.com/docs/mcp). Privacy: [privacy policy](https://dwsoffshorepartners.com/privacy). Terms: [terms of service](https://dwsoffshorepartners.com/terms).

Product baseline: public `ultiwrite-plugins` revision `63adef9ae6ae0bacf3cdc6a59c20a5513831a1ac`, version 0.9.3. Exact upload recovery and response-field guidance use the prepared canonical 0.9.2 workflow contract. This preparation does not claim an authenticated AWS buyer test or Marketplace publication.
