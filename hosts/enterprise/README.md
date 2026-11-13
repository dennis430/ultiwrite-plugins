# Enterprise adoption guide

Ultiwrite turns authorized commercial evidence into a wider investigation across financial, identity, integrity, operational and external-context evidence. The hosted service owns investigation execution, account isolation and usage accounting. These open connector files configure clients and guide their users.

This guide covers the flagship service at **dwsoffshorepartners.com**. Ultiwrite Forensics at **ultiwrite.co** has a separate account, OAuth resource, usage ledger and public repository. A connection to one product grants no access to the other.

## Select an integration

| Need | Recommended starting point | Credential and control boundary |
| --- | --- | --- |
| A customer asks an assistant to investigate supplied evidence | Native remote MCP connector from [the host guide](../README.md) | Each customer signs in and authorizes scoped OAuth; the host controls tool approvals |
| An organization embeds investigations in its own service | [Partner API documentation](https://dwsoffshorepartners.com/docs/api) and [API access](https://dwsoffshorepartners.com/settings/api) | Administrator approval is required; create server credentials under that account's permitted scopes and limits |
| An existing coding agent cannot complete remote OAuth | Reviewed [local stdio adapter](../../client/README.md) | Per-account local credential profile; the command runs on the actual agent machine |
| Procurement, security or operational review | [Security and data handling](security.md), [operations](operations.md), [acceptance](acceptance.md) | Verify current service configuration and your selected host's handling before transferring business evidence |
| A directory listing or enterprise connector catalog | [Submission guide](../submissions/README.md) | Package validation, owner submission, provider approval and installed customer acceptance are separate evidence |

MCP access and Partner API access are different authorization surfaces. A working MCP OAuth grant does not prove Partner API approval. Never reuse a token with another resource or substitute a server credential for customer sign-in.

## Customer journey

1. **Confirm the account.** Connect through the selected host's OAuth controls. Call `ultiwrite_account_get`; show the returned account before private evidence or report access. For a wrong account, reconnect or choose **Use a different account** on the actual consent screen, then repeat the check.
2. **Discover current eligibility.** Call `ultiwrite_capabilities_get`. Read supported inputs, available capabilities, scopes, account state and usage from the response. Connection does not add credits, approve API access or override a suspended account.
3. **Authorize the task.** Identify the evidence and requested investigation. Read-only setup questions do not authorize an upload. Access to a file in the host does not establish permission to send it to Ultiwrite.
4. **Transfer the evidence.** Use the real host file objects when supported. Otherwise use the service's signed upload handoff. Keep the `handoffId` and returned case id in the originating workflow. Do not invent downloadable URLs or assume the agent can read local attachment bytes.
5. **Follow saved state.** Use the returned next action and continuation arguments. A status read is read-only; processing and continuation states determine whether a write is needed. After an ambiguous submission, recover its saved case before retrying new evidence.
6. **Read a complete assessment.** Respect pagination, snapshots, completeness and released findings. Separate observations, inferences, contradictions, confidence and unresolved questions. A missing or unexecuted check is not a completed quiet result.
7. **Deliver the report.** Use `ultiwrite_report_export` and its returned authenticated or scoped delivery route. Preserve the same account. A saved case or available partial finding alone does not establish a completed downloadable report.
8. **Review access over time.** Remove credentials and OAuth grants when staff leave, projects end or evidence access changes. Signing out of a host alone does not establish upstream revocation.

## Organization rollout

Assign a service owner, security reviewer, integration engineer and support owner. One person may hold several roles; each responsibility still needs a named owner.

Start with a dedicated test account and controlled documents. Complete [the acceptance matrix](acceptance.md) in the actual host and intended account. Roll out read-only access first where practical. Add evidence scopes only for teams that need submission and document who can approve investigations. Enforce approval policies in the host and actual account controls; repository configuration is not an enforcement layer.

Maintain an inventory of installations, accounts, credential owners, expiration, granted scopes, limits, application environments, and the date of the last account check. Store secret values in an approved secret store, outside the inventory and shared documents. Use separate account or credential boundaries for environments; do not point a production agent at a developer's local profile.

Record the release archive name, SHA-256 from `release/INVENTORY.json`, source revision, target host/version, accepted OAuth account and acceptance result. Rebuilds and directory approval do not replace this installed evidence.

## Procurement evidence and ownership

| Review question | Evidence to request or inspect |
| --- | --- |
| Who processes submitted material? | Current service privacy/terms and the host/provider's own terms; a connector may send results through an additional provider |
| Which account can see a report? | Controlled isolation checks in the intended integration, with report ids generated by each account |
| What is retained and for how long? | Current product-specific service policy and contractual commitments; do not transfer Forensics memory-only claims to flagship investigations |
| What does revocation stop? | A recorded key/grant revocation check plus signed handoff refusal; verify both upstream grant and local secret removal |
| What is certified? | Actual named certificate/report and scope supplied by the service owner; this repository does not establish SOC 2, ISO 27001 or regulatory certification |
| What is the support commitment? | The executed service agreement or actual support policy; no fixed SLA, data residency or recovery objective is established by these package files |
| What is ready now? | Release artifacts and local validation record, then separate deployment, directory review and native host acceptance records |

Public support: [contact](https://dwsoffshorepartners.com/contact). Include request ids, UTC timestamps, host/version and sanitized error codes. Never include access tokens, keys, signed links or business evidence in public issues.
