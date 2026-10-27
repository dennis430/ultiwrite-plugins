# Tools and permissions

These names are the connector contract already used by the thin skill. Sequence 1 did not obtain an authenticated Grok Bot `tools/list`. Do not treat this page as a fresh host inventory.

| Tool | Permission | What the connector is allowed to say |
| --- | --- | --- |
| `ultiwrite_capabilities_get` | `ultiwrite:read` | Product fit, account access, and the published commercial terms. First completed analysis is $0.00. Further pricing is contact-only. No card and no automatic charge. |
| `ultiwrite_evidence_submit` | `ultiwrite:evidence` | Submit real files the host can attach, or return an `uploadLink` when it cannot. Repeat of the same submission must not start a second analysis. |
| `ultiwrite_cases_list` | `ultiwrite:read` | List cases and saved reports the signed-in account can already see. |
| `ultiwrite_case_status` | `ultiwrite:read` | Processing, action required, complete, or failed. Processing is not a finished report. |
| `ultiwrite_findings_get` | `ultiwrite:read` | Saved findings for exactly one `caseId` or `reportId`. |
| `ultiwrite_coherence_get` | `ultiwrite:read` | Saved coherence record for exactly one `caseId` or `reportId`. |
| `ultiwrite_report_export` | `ultiwrite:read` | Account report and sign-in links. Browser downloads use the same account. The MCP bearer does not fetch PDF, Excel, or ZIP bytes. |

The connector must refuse payment, wiring instructions, invented bank records, and edits to official source documents. It must not invent a tool.
