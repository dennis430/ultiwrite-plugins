# Enterprise operations and support

Use this runbook for the flagship Ultiwrite service and thin connector packages. Operators use the existing canonical administrator bookmark supplied through their private operational documentation. Existing aliases redirect there; do not create a separate administrative console for a host or plugin.

## Ownership and routine review

| Responsibility | Operational action |
| --- | --- |
| Platform operator | Review account status, explicit Partner API approval, users, privileges and account limits through the existing administration controls |
| Customer integration owner | Inventory keys/grants, rotate before expiry, monitor actual request and investigation allowance, manage host approvals |
| Security owner | Review host/provider handling, staff departures, least privilege, incidents and production evidence |
| Support owner | Reconcile saved case state from request ids and timestamps, distinguish pending processing from transport failure and completed reports |
| Directory maintainer | Preserve existing listing identities, check upstream schema changes and track publication/installed evidence independently |

Use the actual settings returned by the deployed account. Reduce limits or remove API approval using the canonical controls; do not edit a balance in a plugin configuration. Keep analysis credits, API request allowance and host/provider billing separate. A lower privilege or request ceiling never raises account limits. No API credential grants a new investigation credit.

## Failure triage

| Observation | Check and recovery |
| --- | --- |
| Connector opens a sign-in window but no account is verified | Complete the intended host's native OAuth flow, check popup/callback errors, then call `ultiwrite_account_get`; metadata discovery alone proves no login |
| Wrong connected customer | Reconnect or choose another account in the real consent flow, then verify account identity before private reads |
| Scope refused | Reauthorize only the needed scope under the actual policy; never add a static staff token or widen redirect validation |
| API access denied | Inspect explicit approval, active account/user and credential policy in the existing admin/customer controls; signing in or purchasing does not approve flagship API access |
| Rate or request allowance exhausted | Honor `Retry-After`, reduce concurrency/polling and inspect the dashboard; key rotation does not reset shared account usage |
| Submission response lost | Search/recover its saved handoff/case before creating another evidence package; a client timeout does not establish server failure |
| Case pending or continuation required | Follow the exact saved next action; a status read does not resume work |
| Findings look incomplete | Read the returned snapshot/pagination/completeness flags; unassessed checks and partial output remain explicit |
| Report link refused | Use the service-returned delivery route and same customer; refresh a permitted export rather than constructing a URL |
| Local adapter works locally but remote agent fails | Install the reviewed command and dependencies on the agent machine; its localhost and paths refer to that machine |
| Package validates but provider rejects installation | Retain the provider's exact sanitized error and host version; package validation is independent of native host acceptance |

Collect UTC time, request id, operation name, HTTP/code, transport, host/version, account's opaque id, case/handoff id and retry history. Do not collect a bearer value, signed URL, submitted documents or full findings into general logs. Keep customer material in the approved private support channel when it is actually needed.

## Rollout and rollback

1. Record source revision and exact archive SHA-256. Validate using the commands in the root README. Inspect existing deployment suppression before pushing or opening a PR.
2. Install in the intended enterprise workspace with a controlled account. Complete [acceptance](acceptance.md), including denied scope, account switching, revocation, rate limits and an authorized report delivery.
3. During deployment outages, finish local validation and source review. Record deployment and live acceptance as pending. Never claim that a merged source change is already serving customers.
4. Roll out to named users, preserve account boundaries and monitor failures. Keep the last accepted connector archive and source revision available.
5. If a connector regression appears, restore that tested package/configuration, preserve the endpoint and listing identity, and reauthenticate only through native controls. Do not copy old token files or broaden scopes to conceal the regression.

Backend release/rollback, schema changes, provider activation and analysis execution follow the service's existing release process. Public packages contain no backend deploy command. Reverting a package does not undo an investigation already submitted or a schema migration.

## Offboarding and incident drill

Remove the user's host assignment or workspace access, revoke upstream credentials/grants that should end, remove local profiles/secret references and inspect outstanding upload handoffs. Prove refusal with the old credential without displaying it in a transcript. Preserve necessary audit metadata under the actual policy; account offboarding is separate from a documented request to delete evidence.

A useful drill covers an expired credential, leaked scoped key, wrong-account connection, lost submission response and host outage during report delivery. Record what the operator saw, which existing control restored service and the last verified customer state. Use controlled fixtures and never trigger an unnecessary paid investigation to test connectivity.
