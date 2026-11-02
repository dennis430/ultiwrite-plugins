# Muse review runbook

Run this after the signed-in platform specifies the connector format and accepts the endpoint/authentication configuration. These are Ultiwrite acceptance criteria, not an asserted Meta test specification.

The workflow targets prepared contract 0.9.2 at canonical source pin `00682b0179824fcf182856713de5864b54b140c2`; published public plugin source remains 0.9.3. Confirm the live tool schema before a host run. A source update alone does not prove runtime deployment or Muse compatibility.

| Journey | Expected evidence |
|---|---|
| Connect | OAuth finishes and `ultiwrite_account_get` identifies the intended test account |
| Discover | `ultiwrite_capabilities_get` returns current supported inputs and terms |
| Submit authorized evidence | Original supported file bytes or the exact secure upload link reach the intended case; no fake local path is treated as uploaded content |
| Track | `ultiwrite_case_status` returns the actual case state and any requested next action |
| Read | `ultiwrite_findings_get` and `ultiwrite_coherence_get` return saved findings/Decision Brief for the selected case or report |
| Export | `ultiwrite_report_export` returns a link that actually opens for the same connected account |
| Reconnect | A revoked grant fails; a new authorization recovers access to the intended identity |
| Scope isolation | Read-only access cannot submit evidence; another account cannot read this account's report |

For a browser upload handoff, the initial `ultiwrite_evidence_submit` payload is `{files: [], caseId: null, handoffId: null, documentForensics: null}`. Preserve the exact returned `handoffId`. After upload receipt, recover the exact case with `{files: [], caseId: null, handoffId: returnedHandoffId, documentForensics: null}`. Use `{files: [], caseId: returnedCaseId, handoffId: null, documentForensics: null}` only for a server-requested continuation. Do not infer the user's case from an unrelated newest-case listing. Forward original file objects only when the host and live schema support them, and preserve an explicit Document Forensics choice.

Use synthetic evidence and existing reviewer allowance. Ask before initiating optional Document Forensics if it changes the selected scope or consumes an additional entitlement. Keep case IDs, timestamps and the outcome in a private run record. Provide a short screen recording only after these steps actually work in Muse.
