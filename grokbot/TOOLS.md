# Tools and permissions

These names are the connector contract already used by the thin skill. Sequence 1 did not obtain an authenticated Grok Bot `tools/list`. Do not treat this page as a fresh host inventory.

| Tool | Permission | What the connector is allowed to say |
| --- | --- | --- |
| `ultiwrite_account_get` | `ultiwrite:read` | The account on the current grant. Do not accept an organization id or user id from the caller. |
| `ultiwrite_capabilities_get` | `ultiwrite:read` | Product fit, input limits, account links and current commercial terms returned by the service. Do not hardcode a price or entitlement. |
| `ultiwrite_evidence_submit` | `ultiwrite:read` and `ultiwrite:evidence` | Submit real files the host can attach, or return an `uploadLink` when it cannot. Repeat of the same submission must not start a second analysis. |
| `ultiwrite_cases_list` | `ultiwrite:read` | List cases and saved reports the signed-in account can already see. |
| `ultiwrite_case_status` | `ultiwrite:read` | Processing, action required, complete, or failed. Processing is not a finished report. |
| `ultiwrite_findings_get` | `ultiwrite:read` | Saved findings for exactly one non-null `caseId` or `reportId`. |
| `ultiwrite_coherence_get` | `ultiwrite:read` | Saved coherence record for exactly one non-null `caseId` or `reportId`. |
| `ultiwrite_report_export` | `ultiwrite:read` | Account report and sign-in links. Browser downloads use the same account. The MCP bearer does not fetch PDF, Excel, or ZIP bytes. |

The connector must refuse payment, wiring instructions, invented bank records, and edits to official source documents. It must not invent a tool.

## Account identity and host controls

`ultiwrite_account_get` returns the actual identity on the selected OAuth grant. Its OpenAI profile annotation can be used by compatible hosts; other MCP clients can still call the tool normally. A slot label such as `default` is not the verified account name. After switching accounts, verify the returned identity before accessing private reports or evidence.

Grok Bot controls its native account selector, tool switches and approval settings. This dossier does not invent fields to force those controls on. Use the host's native connection/reconnection flow and Ultiwrite's **Use a different account** consent action where needed. Default workflow availability never grants scopes, purchases an analysis or overrides a user's disabled feature.

Use every field required by the live schema. Submission handoff: `{files: [], caseId: null, documentForensics: null}`. Continuation: `{files: [], caseId: returnedCaseId, documentForensics: null}`. For reads, send one non-null selector, null for the other, and null for any unused required nullable paging field.
