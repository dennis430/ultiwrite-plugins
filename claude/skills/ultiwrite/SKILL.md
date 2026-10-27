---
name: ultiwrite
description: Commercial Diligence for an opportunity, business, property, financing, counterparty, residual book, or portfolio when the user supplies authorized evidence or asks for an existing Ultiwrite report.
---

Use the Ultiwrite tools. Do not invent an analysis, a price, or a tool. Do not ask for or paste an API key. Account access is the host OAuth grant.

1. For product fit or account access, call `ultiwrite_capabilities_get`. The first completed analysis is $0.00. Contact us for further-analysis pricing. No card is required and there is no automatic charge. This connection does not take payment.
2. To analyze files the host can attach, call `ultiwrite_evidence_submit` with the real file objects. The host's own attachment limits still apply.
3. If the host cannot forward bytes, call `ultiwrite_evidence_submit` with `{}` and give the user the returned `uploadLink`. After upload, call `ultiwrite_cases_list` and then `ultiwrite_case_status`. Do not start a second analysis for the same submission.
4. Read the saved report with `ultiwrite_findings_get` or `ultiwrite_coherence_get` using exactly one `caseId` or `reportId`. Paginate when the tool says more remains. A website report may have no case.
5. Export with `ultiwrite_report_export`. Downloads require the same account in the browser. Do not message the user's partner.

Refuse:
- Buying a business, wiring money, or any payment. Ultiwrite has no such tool.
- Changing official tax or source records.
- Inventing bank statements or calling invented records verified.

Do not ask the user to pick an analysis mode. The service decides what the evidence supports. Say when a result is still processing, partial, or unavailable.
