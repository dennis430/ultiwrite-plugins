# Installed integration acceptance

Run these checks on a controlled account in the intended host and environment. Package validation runs offline and does not establish these outcomes. During a deployment outage, retain unrun rows as **NOT_RUN** and finish source checks; elapsed time does not turn a row into a pass.

Record source revision, archive/hash, host/version, environment, UTC time, test account's opaque id, scope selection and a sanitized result. Put credentials and test-account access details in the provider's private review channel or approved secret store, never this public repository.

| Check | Expected result | Evidence |
| --- | --- | --- |
| Install/update | Existing `ultiwrite` identity and canonical HTTPS endpoint are retained; unrelated servers remain | Host settings/config diff and artifact hash |
| Anonymous metadata | Discovery works only as designed; private tools/data require customer authorization | Sanitized status and discovery fields |
| Connect | Intended customer completes native sign-in and scoped OAuth | `ultiwrite_account_get` returns that customer |
| Declined consent | No private record or evidence submission follows a declined grant | Sanitized refusal and no case created |
| Read-only scope | Account/capability/report reads permitted where entitled; evidence write refused | Actual read and insufficient-scope result |
| Account switching | Account B is confirmed before private work; A's case is not disclosed to B | Separate account checks and controlled isolation result |
| Evidence authorization | Plain setup questions do not submit files; named investigation requires user authorization | Sanitized host transcript with actual approval boundary |
| Upload handoff | User can complete actual returned handoff; flow retains handoff/case id | Handoff state and controlled case id, without signed URL |
| Ambiguous retry | Lost submission response is reconciled with existing saved state | Same recovered case/account; no duplicate analysis consumption |
| Pending/continue | Returned saved next action is followed; status alone performs no write | Status and continuation transition |
| Findings | Pagination/snapshots and incomplete/unassessed scope remain explicit | Completeness metadata and scoped report excerpt |
| Export | Same customer opens the actual full deliverable via returned route | Delivery result, type and controlled report id |
| Allowance | Account limits, request usage and analysis credits retain their separate meaning | Before/after safe usage metadata |
| Expiry and revocation | Old credential and credential-bound handoff are denied after revocation/expiry | Sanitized error code; new account check if reconnecting |
| Host disconnect | Disconnect behavior is documented separately from upstream revocation | Host state plus upstream grant state |
| Failure handling | 401/403 stop blind retries; 429 honors retry guidance; outages retain pending state | Bounded retry/log proof with secrets removed |
| Enterprise policy | Workspace approvals and restricted scopes remain effective | Actual workspace-policy behavior |
| Accessibility and support | Settings, connection recovery and report handoff are usable by keyboard and have clear errors | Recorded walkthrough and issue ids for gaps |

A terminal **PASS** means the row's expected result was observed on that exact host/environment. **FAIL**, **BLOCKED** and **NOT_RUN** must identify the issue or dependency. Source schemas, unit fixtures, an anonymous health check or another host's success cannot satisfy an authenticated row.

## Suggested controlled scenario

Use invented company and financial data in a small supported document, with a visible statement that it is a synthetic integration fixture. Verify account and capabilities first. Obtain task authorization, submit once, recover any saved processing, read all released findings and deliver the actual report. Confirm that the fixture label and evidence limitations survive. Then revoke the credential and verify refusal. Do not use a real customer package or represent a synthetic result as commercial proof.

For read-only deployment verification, stop after identity, capability and existing controlled-report access. A new investigation is not necessary to prove basic connectivity.
