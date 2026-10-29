---
name: follow-up
description: Plan the next diligence step from a saved Ultiwrite report - unresolved questions, contradictions and the specific additional evidence that would change the reading. Use when the user asks what is still open, what to request from a seller or counterparty, or how to strengthen an Ultiwrite assessment.
---

# Follow up on an Ultiwrite assessment

1. Identify the report the user means (`ultiwrite_cases_list`), then read it with `ultiwrite_findings_get` and `ultiwrite_coherence_get`. Use only what those calls return in this conversation.
2. Collect what the report itself says is open: high-severity findings, each finding's `action`, its `counterEvidence` ("would change this reading if"), the report's `actions` and `limitations`, and any unresolved contradictions. Page through actions and findings until their cursors are null, or say how many you covered.
3. Turn these into a short evidence request list. For each item give: what to obtain, from whom where the report says, which finding or evidence id it resolves, and why it matters per the report. Quote the report's wording where it is specific.
4. Distinguish the report's own recommendations from any general diligence suggestion of yours, and label yours as such.
5. New evidence is a new submission: use the `submit-evidence` skill. Separate submissions do not merge into an existing case, and re-evaluation of a released report is handled by Ultiwrite staff, not by any tool here.

Do not promise that more evidence will change the decision, and do not contact anyone on the user's behalf.
