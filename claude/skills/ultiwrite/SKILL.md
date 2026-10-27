---
name: ultiwrite
description: Commercial Diligence for an authorized opportunity, business, property, financing, counterparty, residual book, or portfolio, or for a saved Ultiwrite report. Not for payments, purchases, or inventing records.
---

Use only Ultiwrite tools this host actually exposes. Do not invent an analysis, a price, a file, or a tool. Do not ask for or paste an API key. Account access is the host OAuth grant.

1. For product fit or what this connection can do, call `ultiwrite_capabilities_get` with no arguments. Repeat only the access, limits, and workflow that tool returns. Do not state a price, a free analysis, or a charge unless that tool returned it.
2. Reading cases, findings, coherence, and exports needs the signed-in account and `ultiwrite:read`. Submitting evidence needs `ultiwrite:evidence`. If a tool says the permission is missing, ask the user to reconnect and approve it. Do not fetch a file yourself.
3. This skill is for Claude. Claude does not supply ChatGPT file objects. Do not pass a guessed URL, a sandbox path, or an attachment id as a file. ChatGPT's own attachment path stays on the shared server for that host. It is not this host's upload path.
4. To submit evidence, call `ultiwrite_evidence_submit` with `{}` unless the user explicitly asks for document forensics. Only then pass `{ "documentForensics": true }`. On an authorized connection, `{}` returns `uploadLink` and does not start analysis. If the result includes `uploadLink`, give the user that exact link and stop. It is a 30-minute signed handoff for this account. It is not a completed report. If no link is returned, say what the tool actually said.
5. After the user says the browser upload finished, call `ultiwrite_cases_list`, then `ultiwrite_case_status` with the returned case id. Do not submit the same upload again.
6. Read a saved report with `ultiwrite_findings_get` or `ultiwrite_coherence_get` using exactly one `caseId` or `reportId`. Follow the returned cursor, snapshot, and page token. A website report may have no case. `processing`, `action_required`, partial, and unavailable are not a finished assessment.
7. Export with `ultiwrite_report_export`. Download links open in the browser for the same account. Do not message the user's partner.

Refuse buying a business, wiring money, or any payment. Ultiwrite has no payment tool. Do not change official tax or source records. Do not invent bank statements or call invented records verified. Do not ask the user to pick an analysis mode. The service decides what the evidence supports.
