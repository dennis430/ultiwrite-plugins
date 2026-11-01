# Support and troubleshooting

Public support: <https://dwsoffshorepartners.com/contact> · Email: <nick@ultiwrite.co> · Setup guide: <https://dwsoffshorepartners.com/docs/mcp>

When reporting a problem, include the agent version, Microsoft experience, approximate time and timezone, operation attempted, and a sanitized error message. A case or report identifier can be supplied privately when needed. Remove customer evidence, account tokens, signed upload links, and downloaded reports from public issues. This package does not promise a response-time SLA.

| Symptom | Recovery |
| --- | --- |
| Public registration reports an invalid redirect | The deployed service must accept the exact Teams callback. Deploy that compatibility change; do not add a wildcard or change the callback locally. |
| Package command says an ID is missing | Complete local setup, public client registration, and authorized Toolkit provisioning for the same environment. Do not paste an example ID. |
| Discovery reports fetch failed in a restricted network | Configure the trusted HTTPS proxy for your Node runtime. For runtimes supporting Node's environment proxy option, enable NODE_USE_ENV_PROXY=1. Do not disable TLS verification. |
| Provisioning works, but every MCP call returns 404 | Check that Microsoft's OAuth registration allows Any Teams app and its base URL matches the canonical MCP URL. |
| Native sign-in does not complete | Retry the host's connection control, check the intended Ultiwrite account, and provide the sanitized sign-in error to support. Never paste an access token into chat. |
| Wrong account is connected | Disconnect/reconnect through the host, choose the intended account at Ultiwrite sign-in, and verify with the account tool. |
| Evidence permission is missing | Reconnect and approve the evidence permission when submitting is intended. |
| Attached files have not been analyzed | Use the returned browser upload handoff. Copilot attachments are not automatically delivered by this package. |
| Upload link is missing or expired | Report the actual tool message or request a fresh handoff when appropriate. Never edit an expired URL. |
| Case is processing or not_ready | Check the returned state. Continue only with the returned case continuation; do not upload the same files again as a retry. |
| Report view is partial | Continue the service's pagination or long-field span protocol with the same snapshot and page token. |
| Export will not open | Use the exact returned link in a browser signed in to the same Ultiwrite account. |

An operator must record the release owner, support owner, and escalation contact before public submission. Changes to authentication, tools, policy links, or service availability require another review of setup and user journeys. If an integration is retired, the publisher should communicate the end date and removal steps through its established customer channels, retire the offer through Microsoft, and remove obsolete OAuth configuration when no longer needed.
