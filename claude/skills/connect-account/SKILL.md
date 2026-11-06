---
name: connect-account
description: Connect or reconnect Ultiwrite, recover a dismissed sign-in window, identify the connected account, add or switch an account, or restore a requested permission. Use for account selection, authorization errors and connection setup; do not submit evidence to test access.
---

# Connect and select an Ultiwrite account

1. Call the protected `ultiwrite_account_get` tool with `{}`. Let the host start its native OAuth flow if the grant is missing or expired. Report the actual returned name or email; never label a host connection slot as a verified identity.
2. If connection succeeded and the user only wanted to connect or identify the account, finish. A website session alone is not a host connection. Do not disconnect a working grant.
3. If the user asked to add an account, use the host's **Connect another account** control when available. For a switch, use its account selector. Otherwise use this connector's reconnect flow. In the Ultiwrite consent screen choose **Use a different account** and sign in as the intended identity.
4. Preserve the host's OAuth request, state, callback and PKCE. Do not manufacture authorization URLs or request passwords, API keys, access tokens or authorization codes in chat. Sign-in and permission approval belong in the browser authorization flow.
5. After authorization, call `ultiwrite_account_get` again. Confirm the intended identity before reading reports, submitting files, or continuing an earlier task. If the old identity remains, report the mismatch and stop; do not access its records as if the switch succeeded.

## Recover a closed prompt

- **ChatGPT/Codex:** open Ultiwrite in the host's plugin settings. Use the connector's **Connect**, **Reconnect**, or **Connect another account** action that the host actually offers. Return after authorization and verify the account.
- **Claude web, Desktop or Cowork:** open **Plugins > Ultiwrite > Connectors**, then **Connect** or the available reconnect action. Older versions use **Customize > Connectors > Ultiwrite**. Claude Code uses **`/mcp` > Ultiwrite > Authenticate**.
- **Cursor or another MCP host:** use the existing Ultiwrite server's connection/authentication controls. Keep the configured server URL. If simultaneous accounts are not supported, explain that reconnecting replaces this connection only and proceed only when the user requested the switch.
- Do not repeatedly call the tool while waiting for sign-in. Retry the account check after the host or user confirms completion. Do not revoke unrelated sessions.

## Permissions and features

Reading needs `ultiwrite:read`; evidence submission also needs `ultiwrite:evidence`. Explain the requested actions and let the user select access on Ultiwrite's consent screen. A host permission setting governs when the host asks before tool use; it does not grant OAuth scopes or extra analysis allowance.

When a tool returns a missing-scope challenge, use the host's native reauthorization prompt for the user's requested operation. Verify the account afterward and retry that operation once. Account connection never authorizes evidence submission by itself.

Skills are available automatically by default. Respect any host-disabled skill or account feature preference; do not silently re-enable one, bypass it through a different skill, or change a global permission setting. Report only controls the current host exposes.

## Account usage and complimentary activation

Customer signup and sign-in use Google; the host account is separate. For a requested new investigation, use `ultiwrite_capabilities_get` to check its returned `accountStatus`, scopes and usage limits. Connection never grants credits. If the server returns `payment_method_setup_required`, present its exact authenticated `setupUrl` and preserve the task for continuation after card verification and promotion eligibility. This requirement does not block existing paid entitlements, reconnecting or reading saved reports. Do not subscribe, charge or choose paid add-ons automatically.
