# VS Code verification

## Automated proof

Run `npm test`. These isolated synthetic tests are integration proof of the client implementation. They are not a production account journey.

Run `npm run test:host` on a desktop or Xvfb to verify real VS Code activation and commands. Run `npm run package` and install the VSIX in an isolated VS Code profile to verify package installation.

## Live acceptance — NOT_RUN until an authorized account completes it

1. Install the exact VSIX in a clean profile with no existing Ultiwrite connection.
2. Connect. Decline/cancel once; verify Connect/Reconnect starts another attempt. Authorize the requested read/evidence scopes and inspect Account and Permissions.
3. Choose a small synthetic CSV, PDF or ZIP that you are authorized to submit. Inspect the displayed account and filenames. Select an explicit Document Forensics choice.
4. Verify actual file delivery, returned case ID, any same-case continuation, report publication and browser access. Record the selected byte count, case ID privately, server state and observed result. Do not call a saved submission a published report.
5. Confirm the extension handles an expired connection, unavailable account allowance, failed upload and interrupted status monitoring without resubmitting the same evidence automatically.
6. Ask Copilot to call `ultiwrite_account_get` and `ultiwrite_cases_list`; inspect the real tool calls and results. Tool registration alone is not proof of host execution.
7. Switch to a second ordinary test account using the consent-page account switch. Confirm the old selected case clears and the new account cannot retrieve the prior account's case.
8. Verify report/PDF links in a browser signed in to that same account, then disconnect and verify subsequent tool access requires reconnecting.
9. Run a long Copilot evidence continuation across access-token renewal. The extension shares one SecretStorage session with native MCP and updates headers when the token rotates; VS Code can restart a running MCP connection on that update. Record any interrupted call, then recover the existing case and confirm no evidence is uploaded twice. This check remains **NOT_RUN** until observed in the real authenticated host.

Cancellation ends active client requests and transfers. Work already accepted by the backend can continue; a cancelled or interrupted request must be recovered through the existing case before any new submission is considered.

Never put tokens, signed upload handoffs, confidential evidence or customer report contents in public test logs or this repository.
