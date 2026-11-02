# Salesforce setup and package handoff

## Connection values

| Field | Value |
|---|---|
| Server name | Ultiwrite |
| Endpoint | `https://mcp.dwsoffshorepartners.com/mcp` |
| Authorization metadata | `https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server` |
| Protected resource metadata | `https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp` |
| Authorize URL | `https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize` |
| Token URL | `https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token` |
| Registration URL | `https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register` |
| Read scope | `ultiwrite:read` |
| Submission scope | `ultiwrite:evidence` |
| Flow | Authorization code with PKCE S256 |
| Identity | Per User Principal |

## Configure and prove authorization

Create an External Auth Identity Provider for Ultiwrite in Salesforce Named Credentials. Select authorization code/browser flow and enable PKCE. Use the exact callback URL Salesforce generates to register a dedicated Ultiwrite OAuth client. The service currently advertises public-client authentication; verify that the Salesforce request format supports this before proceeding. Do not enter an invented confidential secret or switch the service to a shared account flow.

Create an OAuth Browser Flow external credential named `UltiwriteOAuth`, linked to that identity provider, with a per-user principal. Grant access only to the intended Salesforce users through a permission set. Each user connects their own Ultiwrite account. [Browser flow and principals](https://help.salesforce.com/s/articleView?id=xcloud.nc_create_edit_oath_browser_ext_cred.htm&language=en_US&type=5)

In Agentforce Registry register `Ultiwrite` using the MCP URL and **Use External Credential**. Select the configured per-user credential and enable the intended tools. Use authenticated Employee agents for this per-user route. Confirm `ultiwrite_account_get` returns the test user's identity before reading or submitting any evidence. [Registry setup](https://help.salesforce.com/s/articleView?id=ai.agent_mcp_connect_register.htm&language=en_US&type=5)

## Prepare a development project

Run inside this directory, with the Salesforce CLI installed and your Dev Hub account signed in:

```bash
node scripts/set-namespace.mjs --namespace YOUR_OWNED_NAMESPACE
sf org create scratch --definition-file config/project-scratch-def.json --alias ultiwrite-mcp-dev --target-dev-hub YOUR_DEV_HUB_ALIAS
```

Replace the two uppercase command arguments with the actual owned namespace and authenticated Dev Hub alias. Do not run a managed package create until namespace ownership is established. API 66.0 is the minimum documented MCP packaging version; the project can be raised when your target org requires it.

After configuring and validating the actual connection in that org:

```bash
node scripts/retrieve-registration.mjs --org ultiwrite-mcp-dev
node scripts/validate-registration.mjs
```

If Salesforce generated different developer names, supply the retrieval options shown by `--help`. The retrieved org metadata is authoritative; edit the retrieval manifest if its names differ. Do not replace the missing metadata with a no-auth registration merely to make the validator pass.

The retrieval creates the `force-app/main/default` tree. Review it, then use Salesforce's current 2GP create/version workflow with your Dev Hub. Package creation, validation and promotion are deliberately separate from retrieval. Publication needs a real package version and authorized review steps. [MCP metadata packaging](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/dev2gp-package-mcp-agentforce.html)

## Demonstration before release

With synthetic documents and the review account's existing allowance, verify account identity, retrieve current capabilities, submit authorized evidence, follow its returned case state, read the saved findings and Decision Brief, and open an entitled export as that user. Complete all required fields of the live tool schema, including nullable selectors. A report selector must identify one authorized case or report, never a guessed customer identifier.

This demonstration targets prepared contract 0.9.2 at canonical source pin `00682b0179824fcf182856713de5864b54b140c2`; published public plugin source is 0.9.1. Verify runtime deployment and the actual schema separately. For a browser handoff, call `ultiwrite_evidence_submit` with `{files: [], caseId: null, handoffId: null, documentForensics: null}` and retain the returned `handoffId`. After upload confirms receipt, recover that exact saved case with `{files: [], caseId: null, handoffId: returnedHandoffId, documentForensics: null}`. Continue a returned case only when requested, using `{files: [], caseId: returnedCaseId, handoffId: null, documentForensics: null}`. Do not choose a case from a newest-case guess; preserve explicit Document Forensics consent and supported original file objects.

Verify another user cannot read that report, read-only scope cannot submit, and expired/revoked grants require reconnection. Record actual host/agent, case/report IDs and results privately. Only then claim customer-usable Agentforce integration.

## Publication notes

Use Partner Console to connect the actual managed package version and add the server/tools to the Agentforce listing. Salesforce's [MCP listing release note](https://help.salesforce.com/s/articleView?id=release-notes.rn_list_and_publish_mcp_servers_in_agentforce_extension_packages.htm&language=en_US&release=262&type=5) describes listing servers and at least one tool. Customer installation still requires their authorization and tool enablement.
