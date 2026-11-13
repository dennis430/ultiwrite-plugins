---
name: follow-up
description: Turn a saved Ultiwrite report's unresolved questions, contradictions and evidence gaps into a practical next-step request list. Use when the user asks what to investigate next, what evidence to obtain, or what could change a report's conclusions.
---

# Follow up on an Ultiwrite investigation

1. Identify the intended account and report. Read the saved report with `ultiwrite_findings_get` and `ultiwrite_coherence_get`; use the `read-report` workflow when enabled. Do not bypass a disabled workflow or account feature.
2. Collect the report's actual open items: material findings, their `action` and `counterEvidence`, requested evidence, actions, limitations and unresolved contradictions. Follow available pages or disclose the covered portion.
3. Produce a focused evidence request list. For each item state what to obtain, from whom if the report identifies a source, the finding/evidence id it addresses, and why it matters according to the report.
4. Label any general suggestion of your own separately from the saved findings. Preserve the report's qualifications; do not promise that more evidence will change its decision or confidence.
5. Additional evidence follows only the continuation the server actually offers. If none is offered, explain the returned next step or use a separately authorized submission through `submit-evidence` when enabled. Do not silently merge evidence into a completed case or claim a re-evaluation tool exists.
6. If the user explicitly chooses a supported disposition after considering the saved report or returned evidence, route to `case-disposition`. Do not equate receiving evidence, accepting an explanation, closing a task or reaching a deadline with resolution; the user chooses the disposition and its basis.

Do not contact counterparties or send evidence requests unless the user separately authorizes that communication. A follow-up plan does not start, buy or rerun an analysis.
