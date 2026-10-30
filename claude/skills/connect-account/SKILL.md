---
name: connect-account
description: Connect or reconnect Ultiwrite, sign in or sign up, resume authentication after its popup closed, check the connected account, or switch to another Ultiwrite account. Use when Ultiwrite needs authorization, its connection expired, permission is missing, or the user asks to authenticate again.
---

# Connect an Ultiwrite account

Use this workflow for connection setup and recovery. It reads account identity only; it does not submit evidence or create an analysis.

## Check and start authorization

1. If the host exposes `ultiwrite_account_get`, call it with `{}`. This protected call lets Claude start its native OAuth flow when authorization is missing or invalid. `ultiwrite_capabilities_get` describes the service; use the account tool to verify the connected identity.
2. If the account call succeeds, report the actual identity returned. If the user only asked to connect or check the account, the task is complete. Do not disconnect a working account. If the user explicitly asked to use another account, follow **Switch accounts** below.
3. If Claude presents a Connect or authorization prompt, ask the user to complete that prompt. Sign-in and sign-up happen in Ultiwrite's browser window. Preserve the host's flow; never build an OAuth URL, client ID, state, PKCE challenge, or callback yourself. Do not ask for passwords, API keys, access tokens, or authorization codes in chat.
4. If the popup was dismissed, or no prompt is visible, give the persistent connection path below. Do not keep repeating the tool call while waiting for sign-in.
5. Once the host confirms authorization or the user says they completed it, call `ultiwrite_account_get` with `{}` again. Confirm only the identity that succeeds now. If it still fails, report the returned connection error and keep the connection marked unverified. Never treat ordinary website login as proof that Claude has an OAuth grant.

## Open the connection again

- **Claude web, Desktop, or Cowork:** open **Plugins > Ultiwrite > Connectors**, select the Ultiwrite connector, then **Connect** or the available reconnect action. On the older interface, use **Customize > Connectors > Ultiwrite > Connect**. If the connector is not yet added, add the bundled Ultiwrite connector from the plugin's Connectors tab first.
- **Claude Code:** run `/mcp`, select Ultiwrite, and choose **Authenticate**. Keep the server URL configured by the plugin.
- If this host does not expose the account tool, use those connection controls and ask the user to return after connecting. Do not claim the connection worked without a successful account check.
- Signing in directly at the Ultiwrite website can prepare an account, but cannot finish Claude's connection by itself. Return to Claude and start **Connect** so the authorization returns to the host.

## Switch accounts

Only start this when the user asks to switch, reconnect with a different identity, or replace the current connection. Use the host's account-switching control if one exists. Otherwise, have the user disconnect this Ultiwrite connector in Claude and choose **Connect** again. In the actual Ultiwrite consent flow, choose **Use a different account** and sign in as the intended account, then approve the requested access. This keeps the host's authorization request and PKCE intact.

Afterward, call `ultiwrite_account_get` with `{}` and confirm the returned identity before reading private reports or continuing any earlier request. If it still returns the former account, say so and stop; do not read that account's records as if the switch succeeded. Do not revoke other sessions or connections.

Claude controls whether its interface offers simultaneous connected accounts. Do not promise a native **Connect another account** button or concurrent accounts when the host does not offer them. Account switching through a fresh authorization is a separate operation.

## Restore a missing permission

Reading needs `ultiwrite:read`; evidence submission needs `ultiwrite:evidence`. If an authorized operation receives a missing-scope challenge, use Claude's native reauthorization prompt and approve the permission for that requested operation. If the prompt is unavailable, use the persistent connection controls above. After authorization succeeds, verify the account and retry the original authorized operation once. A request only to connect or recover authentication never authorizes `ultiwrite_evidence_submit`.
