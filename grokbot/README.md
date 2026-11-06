# Grok Bot submission dossier

Version 0.9.0. This folder prepares a Grok Bot connector submission. It is not a receipt. The form was not submitted in Sequence 1, and Grok Bot was not used to call Ultiwrite.

| Field | Value |
| --- | --- |
| Publisher | DWS Offshore Fund |
| Product | Ultiwrite |
| Category | Commercial Diligence |
| MCP URL | https://mcp.dwsoffshorepartners.com/mcp |
| Logo | `assets/logo.png` (512×512, opaque square plate) |
| Website | https://dwsoffshorepartners.com |
| Privacy | https://dwsoffshorepartners.com/privacy |
| Terms | https://dwsoffshorepartners.com/terms |
| Support | https://dwsoffshorepartners.com/contact |
| Docs | https://dwsoffshorepartners.com/docs/mcp |
| Repository | https://github.com/dennis430/ultiwrite-plugins |

Companion notes:

- `OAUTH.md` — discovery, scopes, and what not to paste
- `TOOLS.md` — tool and permission descriptions taken from the connector contract
- `INSTALL.md` — account connection guidance
- `TESTING.md` — draft host test. Status is NOT_RUN
- `mcp.json` — Streamable HTTP remote server, no API key

Consumer Grok is a different product surface and was marked coming soon on the earlier form. Grok Build is the app-building environment, not this connector host. Do not describe either as a completed Ultiwrite plugin test.

Repository status: the public thin source is https://github.com/dennis430/ultiwrite-plugins. It was not submitted to a plugin marketplace or directory. Cursor, Claude, ChatGPT, and Grok Bot host installation is not claimed from this package alone. The production MCP endpoint is independent of marketplace review.

## Accounts, permissions and feature controls

The shared MCP service exposes a protected account check and action-specific permission metadata. Verify the actual account with `ultiwrite_account_get`. Use Grok Bot's native Connect/Reconnect and account selector where offered; otherwise reconnect this connection with **Use a different account** on Ultiwrite's consent screen.

Native toggles, simultaneous accounts and approval modes depend on Grok Bot's supported interface. This dossier contains no unsupported switch or permission-mode fields, and does not claim those controls were observed in a host test. Shared OAuth scopes and account feature choices remain enforced by the server.

## Universal MCP preparation

Sign in through Ultiwrite’s existing account flow and approve the connected host’s scoped OAuth access. Connection does not grant usage. Discover current account limits, paid credits and complimentary availability with `ultiwrite_capabilities_get`; its `accountStatus` is informational and server admission rechecks eligibility. The first eligible completed investigation remains $0 once per account, with no card required. Existing paid entitlements and saved reports remain available under the same account controls.

Host configurations, the canonical public tool catalog and per-surface limitations are prepared in the root `hosts/` directory. Live host acceptance was skipped at the owner’s request; package preparation is not publication or deployment.
