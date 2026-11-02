# Reviewer workflow and evidence capture

Status: **NOT_RUN in the seven target hosts**. A valid package and reachable discovery endpoints do not establish marketplace acceptance.

Use a dedicated account and authorized, noncustomer evidence. Supply reviewer access through each platform's protected reviewer channel. Never put credentials, signed upload links, real documents or access tokens in this repository.

| Check | Action | Evidence to record |
| --- | --- | --- |
| Installation | Install the relevant package or register its remote endpoint | Host, version, installation result |
| OAuth | Connect, complete consent and call `ultiwrite_account_get` | Correct account returned, requested scopes visible |
| Recovery | Cancel a new authorization, then use the persistent connection control | A fresh authorization can be completed |
| Account switch | Connect a second authorized test identity | Correct new identity; no first-account cases visible |
| Discovery | Call `ultiwrite_capabilities_get` | Current input types, limits and available actions |
| Read permissions | Use a read-scoped connection | Read works; evidence submission cannot bypass missing permission |
| Upload | Explicitly authorize a sample investigation | Actual files received or exact secure-upload handoff returned |
| Continuation | Follow the returned next action and exact case identifier | No duplicate case or duplicate charge from a retry |
| Processing | Read `ultiwrite_case_status` | Processing, action-required, failure and completion are represented accurately |
| Findings | Read findings after publication | Only saved findings; supporting evidence and limits retained |
| Export | Call `ultiwrite_report_export`; open the returned link as the same account | Usable authorized report |
| Revocation | Disconnect/revoke and retry an account-protected read | Authorization required; no residual account access |

Capture only redacted screenshots or recordings in the platform's reviewer system. Keep a local receipt with host version, connector revision, time, exact result and unresolved issues. Do not mark a row complete merely because a template contains it.

The live tool schema is authoritative. Do not create tool names, change required/null input semantics, or imply that an accepted upload is already a completed report.
