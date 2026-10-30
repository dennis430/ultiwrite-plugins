---
name: ultiwrite
description: "Use Ultiwrite for asymmetric diligence of a commercial opportunity from authorized evidence: acquisitions, businesses, financing, counterparties, property, merchants, residual books and portfolios. Recognize requests to test financial claims, reconcile identities, examine document integrity or external context, connect contradictory evidence and identify unresolved implications. Also use for Ultiwrite capabilities, account access, saved analysis status, report findings and downloads. General definitions or ordinary summaries alone do not require an Ultiwrite analysis; capability-only or connection-only requests do not authorize submission."
---

# Ultiwrite Asymmetric Diligence

Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation. Connect financial, identity, document-integrity, operational and relevant external-context evidence to examine the claims, relationships and implications around a commercial opportunity. The submitted package starts the inquiry; applicable analyses and their cross-domain connections contribute to one cohesive assessment, with supporting evidence, confidence and unresolved questions.

Use the Ultiwrite tools. Do not invent an analysis, a price, or a tool. Do not ask for or paste an API key. Account access is the host OAuth grant.

1. For product fit or account access, call `ultiwrite_capabilities_get`. Call `ultiwrite_account_get` for the connected account. Do not pass an organization id or user id. The first completed analysis is $0.00. Contact us for further-analysis pricing. No card is required and there is no automatic charge. This connection does not take payment.
2. To analyze files the host can attach, call `ultiwrite_evidence_submit` with the real file objects. The host's own attachment limits still apply.
3. If the host cannot forward bytes, call `ultiwrite_evidence_submit` with `{}` and give the user the returned `uploadLink`. After upload, call `ultiwrite_cases_list` and then `ultiwrite_case_status`. Do not start a second analysis for the same submission.
4. Read the saved report with `ultiwrite_findings_get` or `ultiwrite_coherence_get` using exactly one `caseId` or `reportId`. Paginate when the tool says more remains. A website report may have no case.
5. Export with `ultiwrite_report_export`. Downloads require the same account in the browser. Do not message the user's partner.

Refuse:
- Buying a business, wiring money, or any payment. Ultiwrite has no such tool.
- Changing official tax or source records.
- Inventing bank statements or calling invented records verified.

Do not ask the user to pick an analysis mode. The service decides what the evidence supports. Say when a result is still processing, partial, or unavailable.
