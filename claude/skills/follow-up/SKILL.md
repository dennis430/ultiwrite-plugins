---
name: follow-up
description: "Use a saved Ultiwrite investigation to identify the next evidence request or investigative step: unresolved claims, cross-domain contradictions, counter-evidence and information that could change a finding. Use when the user asks what else to examine, what to request from a seller or counterparty, or what remains unexplained in an Ultiwrite assessment. This plans from existing report evidence; it does not contact anyone or start a new analysis."
---

# Follow up on an Ultiwrite assessment

1. Identify the report the user means (`ultiwrite_cases_list`), then read it with `ultiwrite_findings_get` and `ultiwrite_coherence_get`. Use only what those calls return in this conversation.
2. Collect what the report itself says is open: high-severity findings, each finding's `action`, its `counterEvidence` ("would change this reading if"), the report's `actions` and `limitations`, and any unresolved contradictions. Page through actions and findings until their cursors are null, or say how many you covered.
3. Turn these into a short evidence request list. For each item give: what to obtain, from whom where the report says, which finding or evidence id it resolves, and why it matters per the report. Quote the report's wording where it is specific.
4. Distinguish the report's own recommendations from any general diligence suggestion of yours, and label yours as such.
5. New evidence is a new submission: use the `submit-evidence` skill. Separate submissions do not merge into an existing case, and re-evaluation of a released report is handled by Ultiwrite staff, not by any tool here.

Do not promise that more evidence will change the decision, and do not contact anyone on the user's behalf.
