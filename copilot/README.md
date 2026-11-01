# Ultiwrite for GitHub Copilot

Bring asymmetric diligence into your Copilot workflow. Connect your Ultiwrite account to submit authorized evidence, follow investigations, and retrieve saved findings and reports.

This Agent Plugins 1.0 package contributes the existing remote Ultiwrite MCP service. The service performs the investigation. The package contains connection metadata, not an analytical engine or a separate account/usage system.

## Install the review candidate

After checking out this review branch, add that local checkout as a plugin marketplace:

```bash
copilot plugin marketplace add /absolute/path/to/ultiwrite-plugins
copilot plugin install ultiwrite@ultiwrite-copilot
```

For VS Code's agent-plugin interface, use **Agent Customizations → Plugins → Install from source** and select the `copilot` folder. Client plugin support and organization policy determine availability. The separate [`vscode/`](../vscode/) extension adds native editor commands and local-file transfer.

After an authorized merge to the public default branch, install through the repository's Copilot marketplace:

```bash
copilot plugin marketplace add dennis430/ultiwrite-plugins
copilot plugin install ultiwrite@ultiwrite-copilot
```

The repository marketplace is separate from inclusion in GitHub's curated MCP registry. Copilot CLI 1.0.105 accepted the local marketplace and installed this plugin during package validation. That establishes installation only; an authenticated tool invocation and marketplace approval have not been verified.

## Connect and use

Ask **“Connect Ultiwrite and show which account is connected.”** Approve Ultiwrite's native OAuth request when the host presents it. No API key goes in this package. If the browser sign-in is dismissed or expires, use the host's MCP authentication controls to reconnect, then repeat the account check. To switch accounts, use a fresh authorization and select the other account on Ultiwrite's sign-in/consent screen.

The service exposes these existing tools:

| Tool | Use |
| --- | --- |
| `ultiwrite_account_get` | Confirm the connected account. |
| `ultiwrite_capabilities_get` | Read current features, accepted inputs, account limits, and commercial terms. |
| `ultiwrite_evidence_submit` | Submit actual supported downloadable file objects, request a secure browser upload handoff with `{}`, or continue an existing case. |
| `ultiwrite_cases_list` | Find the account's cases and saved reports. |
| `ultiwrite_case_status` | Check one case's actual state. |
| `ultiwrite_coherence_get` | Retrieve a saved decision brief by case or report ID. |
| `ultiwrite_findings_get` | Retrieve saved report findings and follow pagination. |
| `ultiwrite_report_export` | Get authenticated report/export links. |

Try **“List my Ultiwrite investigations”**, **“Investigate the documents I select”**, or **“Open the saved report for this case.”**

Local paths and attachment IDs are not downloadable evidence. If the host cannot deliver the original bytes in the format the service accepts, use the exact `uploadLink` returned by `ultiwrite_evidence_submit({})`, upload in the browser, and continue the returned case. Do not manufacture a URL or start a duplicate investigation to poll for a result. Omit `documentForensics` unless the user explicitly chooses it; follow the service's actual entitlement and availability responses.

## Permissions and data

- `ultiwrite:read`: account information, current capabilities, cases, saved findings, and report links.
- `ultiwrite:evidence`: evidence submission and authorized investigation continuation.

The host holds the OAuth grant. Only evidence the user authorizes is submitted to Ultiwrite. No directory crawl, background upload, secret collection, or public report publication is bundled. The Ultiwrite service enforces account access, credits, and report permissions. A successful install does not establish that sign-in, evidence transfer, or an investigation completed.

## Help and legal

[Setup guide](https://dwsoffshorepartners.com/docs/mcp) · [Support](https://dwsoffshorepartners.com/contact) · [Privacy](https://dwsoffshorepartners.com/privacy) · [Terms](https://dwsoffshorepartners.com/terms)

Publisher: DWS Offshore Fund, Inc. Product: Ultiwrite. Original connector material is MIT licensed; the remote analytical service remains proprietary.

Authoring reference: [GitHub Copilot CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference).
