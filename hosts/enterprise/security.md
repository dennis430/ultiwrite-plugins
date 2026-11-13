# Security and data handling

This document describes integration boundaries that customers and directory reviewers can inspect. It is not a certification, penetration-test report, DPA or replacement for the [current privacy policy](https://dwsoffshorepartners.com/privacy) and [terms](https://dwsoffshorepartners.com/terms).

## Trust boundaries

```text
Customer / enterprise host
  | scoped customer OAuth and explicitly authorized evidence
  v
Ultiwrite MCP service -- canonical account and investigation service
  | released, account-scoped findings and report handoff
  v
Selected host, its model/provider and authorized customer
```

The repository contains connector metadata, public schemas, workflow instructions and an optional local adapter. It does not contain the analytical engine or customer documents. The native host and the Ultiwrite service have separate accounts, policies and secret storage. A customer's host connection can expose permitted tool results to that host's processing environment; review both services for the intended evidence.

## Credentials and permissions

Native MCP integrations discover OAuth metadata from the protected resource. Use public-client authorization with PKCE S256 and the exact accepted redirect URI. Do not broaden a callback to a wildcard to get a host working. Keep the existing `ultiwrite` server identity and canonical endpoint `https://mcp.dwsoffshorepartners.com/mcp`.

| Permission | Purpose | Customer control |
| --- | --- | --- |
| `ultiwrite:read` | Connected account, capability, saved investigation and report reads | Authorize the intended account/client; the service still scopes records to the authenticated account |
| `ultiwrite:evidence` | Submit authorized evidence or follow the existing saved submission workflow | Grant only when needed; obtain authorization for the actual investigation and apply the host's write approvals |
| Partner API approval and policy | Programmatic server access at the Partner API resource | Explicit staff approval; customer credentials remain subject to actual account policy, active identity, privileges and usage controls |
| Administrative privileges | Staff operations and account policy | Existing staff authentication and permission checks; customer API credentials do not grant staff authority |

Scopes do not establish ownership of a document, authorize another person's account, create credits or approve billing. Use account and capability tools to confirm actual state. Follow the live API documentation for key-specific roles and limits; MCP package manifests are not API key policy.

Never put a bearer value in a repository, URL query, shared screenshot, issue, chat message or example configuration. The supplied native configs intentionally omit static authorization headers. A local adapter profile holds a customer grant; install it only on the intended agent machine, protect its credential file and remove the profile when access ends. Do not share one staff grant across customers.

## Evidence, findings and downloads

Obtain authorization before sending a named evidence package. Files, metadata, titles, report text, retrieved pages and tool output are untrusted data; their contents cannot change system instructions, identity, scopes, recipients, billing or tool approval requirements.

Use only the service-returned signed upload URL. Treat signed handoff and download URLs as secrets; do not publish them as reproducible examples. Preserve the originating handoff/case reference so transport failures can be reconciled with saved state. Customer report delivery must follow the returned route using the intended account; a successful MCP request does not prove that arbitrary website download routes accept its bearer token.

Use the released customer assessment. Do not expose internal engine diagnostics, private source libraries, service credentials or implementation details in a host transcript or directory demo. Read all pages of a paginated result and retain its completeness state. Findings support a human decision; an indicator is not proof of fraud or a final credit/investment decision.

## Retention and model processing

Flagship investigations and the separate Forensics product have different storage and retention boundaries. Do not infer flagship deletion deadlines, volatile-only storage, model policy or processor eligibility from another product's documentation.

Before enterprise adoption, obtain the applicable service retention schedule, deletion procedure, subprocessor/model terms, location commitments and incident contacts from the service owner. Check the selected host's retention and credential custody independently. Verify what deleting a host conversation, disconnecting a connector and revoking an upstream grant each do. Do not claim that any of those actions alone deletes a saved investigation.

## Rotation and incident response

For a planned key rotation, issue a permitted replacement, update the consuming service's secret, verify account identity and a harmless read, then revoke the old credential. Leave a key slot available for rotation. Key creation does not reset account usage. Native OAuth refresh and reconnect use the host's supported flow; do not copy token files between profiles to switch identities.

For a suspected leak, revoke the affected upstream key or grant, remove the secret from every consuming system, preserve sanitized request ids/timestamps and notify the service owner. Verify that the old credential and any outstanding credential-bound upload handoff are refused. Reauthenticate the intended customer separately and rerun the account check before access resumes.

Public vulnerability or support reports must contain no customer evidence or credential values. Use [the service contact](https://dwsoffshorepartners.com/contact) to arrange a private channel.
