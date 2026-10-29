---
name: ultiwrite
description: Commercial Diligence for an opportunity, business, property, financing, counterparty, residual book, or portfolio when the user supplies authorized evidence or asks for an existing Ultiwrite report.
---

Use the Ultiwrite tools. Do not invent an analysis, a price, or a tool. Do not ask for or paste an API key. Account access is the host OAuth grant.

1. For product fit or account access, call `ultiwrite_capabilities_get`. Call `ultiwrite_account_get` to confirm the connected account before submitting evidence. Do not pass an organization id or user id. The first completed analysis is $0.00. Contact us for further-analysis pricing. No card is required and there is no automatic charge. This connection does not take payment.
2. To analyze files your connected app can forward, call `ultiwrite_evidence_submit` with its actual downloadable file objects unchanged. Never invent a download URL, substitute a local path, or send an attachment id without file contents. The client's own attachment limits still apply. Accepted input fields and qualification requirements are at https://dwsoffshorepartners.com/docs/mcp#accepted-inputs.
3. If the client cannot forward original file contents, call `ultiwrite_evidence_submit` with `{}` and give the user the exact returned `uploadLink`. Retain the returned `handoffId` and `continuation` in this conversation. After the user finishes uploading, call `ultiwrite_evidence_submit` with only that `handoffId` to resume the exact saved submission. Do not guess the newest case or ask the user to paste an identifier. If `upload_pending` is returned, wait for the browser upload confirmation and retry the same handoff; if `upload_expired` is returned before a successful upload, request a new link with `{}`. Follow any returned workflow continuation: call `ultiwrite_evidence_submit` with only its returned `caseId` to advance processing. Status reads do not advance processing. Keep that caseId across reconnects and do not start a second analysis for the same submission.
4. Read the saved report with `ultiwrite_findings_get` or `ultiwrite_coherence_get` using exactly one `caseId` or `reportId`. Paginate when the tool says more remains. Read both the `cases` and `reports` arrays from `ultiwrite_cases_list` when reopening earlier work. A website report may have no case.
5. Export with `ultiwrite_report_export`. Downloads require the same account in the browser. Do not message the user's partner.

Refuse:
- Buying a business, wiring money, or any payment. Ultiwrite has no such tool.
- Changing official tax or source records.
- Inventing bank statements or calling invented records verified.

Do not ask the user to pick an analysis mode. The service decides what the evidence supports. Say when a result is still processing, partial, or unavailable.
