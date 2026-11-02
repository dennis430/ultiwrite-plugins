# Microsoft submission copy and reviewer scenarios

## Store fields

**Name:** Ultiwrite

**Publisher:** DWS Offshore Fund, Inc.

**Short description:** Asymmetric diligence and investigative intelligence for commercial decisions.

**Full description:**

Use Ultiwrite in Microsoft 365 Copilot to investigate the commercial evidence behind a business, transaction, property, counterparty or portfolio. Documents open a wider investigation across financial, identity, document-integrity, operational and relevant external evidence. Ultiwrite reconciles applicable findings into a saved assessment with supporting evidence, confidence, unresolved questions and next steps.

Connect an Ultiwrite account, submit authorized evidence through the secure browser upload handoff, follow the investigation and retrieve saved findings and report links. Ask: What does the evidence support, and what needs a closer look?

An Ultiwrite account and the applicable service entitlement are required. Additional service charges may apply under the current terms shown by Ultiwrite. The analytical service runs separately from Microsoft 365. This package requests Ultiwrite account and evidence permissions; it does not request access to Microsoft mail, calendar, Teams messages or SharePoint files. Report downloads may require sign-in to the same Ultiwrite account.

**Support:** [Contact Ultiwrite](https://dwsoffshorepartners.com/contact) · nick@ultiwrite.co

**Privacy:** https://dwsoffshorepartners.com/privacy

**Terms:** https://dwsoffshorepartners.com/terms

**Service documentation:** https://dwsoffshorepartners.com/docs/mcp

**Suggested discoverability terms:** due diligence, investigative intelligence, commercial evidence, business acquisition, counterparty review, portfolio investigation, document integrity.

Select the closest category actually offered by Partner Center. No accuracy, regulatory certification, guaranteed-result or turnaround-time claims are made.

## Review notes to complete after tenant setup

The package contains an MCP-backed declarative agent. The service is hosted at `https://mcp.dwsoffshorepartners.com/mcp`. Reviewers sign in with a dedicated authorized Ultiwrite test account and use synthetic evidence, not customer documents. Review credentials belong in Partner Center's private reviewer fields. The account must have the necessary current entitlement before review begins; these files do not create accounts or credits.

| Scenario | Prompt and action | Evidence to retain | Current state |
| --- | --- | --- | --- |
| Connect | Open Ultiwrite and ask which account is connected. Complete the native OAuth sign-in. | Successful return and correct account; no exposed credential. | Not run in Microsoft tenant. |
| Capability discovery | Ask what Ultiwrite can investigate from the documents available. | Current capabilities and limits returned by the service. | Not run in Microsoft tenant. |
| Authorized upload | Ask to investigate a synthetic commercial package and open the exact returned upload link. After receipt, recover the saved case through the retained returned handoffId. | Original files accepted, exact handoff-to-case association and actual workflow state; no newest-case guess. | Not run in Microsoft tenant. |
| Saved report | Ask to read the completed synthetic investigation and download its report. | Saved findings, evidence references, confidence and working same-account reportUrl, signInUrl and entitled download links. | Not run in Microsoft tenant. |
| Connection recovery | Sign out through Copilot's agent settings, reconnect and request the saved case. | Correct reconnected account and restored access. | Not run in Microsoft tenant. |
| Permission choice | Connect with reading allowed and evidence submission declined, then request an upload. | Permission recovery request; no unauthorized submission. | Not run in Microsoft tenant. |

At least one screenshot must show real Microsoft 365 Copilot functionality. Capture the connected agent, upload handoff and returned saved report with synthetic data. Screenshots, test account details and account-specific availability cannot be truthfully supplied from an offline package build. Refer to Microsoft's [Agent Store validation guidelines](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/appsource/prepare/review-copilot-validation-guidelines).

## Publication record

Keep the actual package checksum, tenant test date, app ID, offer ID, submitted version and Microsoft's review result together. The package builder prints the checksum. Submission instructions are in the [Microsoft Marketplace guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish-plugin-publicly).

Submission state: **not submitted**. Approval state: **not reviewed**. Installed Copilot journey: **not run**.
