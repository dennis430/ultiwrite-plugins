---
name: read-report
description: Read and explain a saved Ultiwrite Commercial Diligence report, its findings, Decision Brief and downloads. Use when the user asks about their Ultiwrite cases, a report's findings, contradictions, confidence, decision, or how to download the report.
---

# Read an Ultiwrite report

1. Find the report: call `ultiwrite_cases_list`. Read both `cases` and `reports`; website reports may have no case. Follow `nextCursor` until null if the one you need is not on the first page.
2. Call `ultiwrite_findings_get` with exactly one of `caseId` or `reportId`, never both.
3. Page honestly. Collections (findings, sections, evidence, actions, metrics) are paginated. To continue, pass the returned cursor together with the same `snapshot` and `pageToken`. A long field is omitted whole, not clipped; read it with `spanTarget`, `spanField` and `spanCursor`. Until `completeness.status` is `complete`, say how much you have read, for example "6 of 115 findings".
4. For the Decision Brief view, call `ultiwrite_coherence_get` with the same id. When the brief is omitted for size, recover it through `findings_get` with `spanTarget: "brief"` and `spanField: "decisionBrief"`, concatenating pages before parsing.
5. For downloads, call `ultiwrite_report_export` with the `reportId`. Give the user the returned report and sign-in links. PDF, Excel and ZIP open only in the browser signed in to the same Ultiwrite account; this connection cannot fetch them.

## Explaining results

- Lead with the saved decision and confidence exactly as returned (`savedDecision`, `confidence`), then the highest-severity findings with their evidence ids and recommended actions.
- Keep three things distinct: what the documents show, what the engine inferred, and what remains unresolved.
- Plain language is welcome; changing meaning is not. Do not raise or lower a grade, confidence or severity, merge findings, or add findings of your own.
- `documentIntegrity: intact` means the saved document matches its digest, not that the conclusion is true. `thisReadEndorsesDecision` is always false. A missing finding is not evidence that something is fine.
- `not_ready` means no report is linked yet. It is not a negative result.
