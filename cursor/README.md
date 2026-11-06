# Ultiwrite for Cursor

Version 0.10.0. Product: Ultiwrite. Publisher: DWS Offshore Fund. License: MIT for this thin connector; the analytical service remains proprietary.

Connect Cursor to Ultiwrite for asymmetric diligence across acquisitions, financing, counterparties, property and portfolios. Ordinary documents start a wider investigation across financial, identity, document-integrity, operational and external-context evidence. The remote server is https://mcp.dwsoffshorepartners.com/mcp. The plugin uses OAuth and contains no API key or local server.

## Workflows and defaults

The plugin exposes five independent workflows under `skills/`: `ultiwrite`, `connect-account`, `submit-evidence`, `read-report` and `follow-up`. The manifest deliberately omits a `skills` override so Cursor discovers every skill directory. Each workflow contains display metadata and permits automatic invocation for compatible hosts. User-disabled workflows and host policy remain authoritative.

Use the current Ultiwrite icon, service capabilities, verified account identity and native MCP approval controls. Cursor owns its tool switches, approval policy and connection UI; the package does not fabricate ChatGPT controls or force tool approval.

## Connect or select an account

Add/install Ultiwrite and use the existing server's Connect/authentication control. Ask “Connect Ultiwrite and confirm which account is connected.” The protected `ultiwrite_account_get` tool verifies the selected grant. If the prompt closes, reopen the same server's connection controls and complete OAuth.

Use native account selection when Cursor offers it. Otherwise, when you request a switch, reconnect this Ultiwrite connection and select **Use a different account** on the consent screen. Confirm the returned identity before accessing reports or uploading evidence. A generic connection-slot label such as `default` is not proof of an account identity.

Reading requires `ultiwrite:read`; submission also requires `ultiwrite:evidence`. Consent, account allowance and investigation-specific choices remain enforced by the service. Enabling a workflow never grants more credits or authorizes a charge.

## Files and reports

Pass original file objects only when the host and server schema support them. Otherwise use the exact secure upload link returned by `ultiwrite_evidence_submit`; never pass a local path as though it were uploaded bytes. Follow actual workflow status, then read the saved report. Downloads require the same account in the browser.

Current archive: `release/ultiwrite-cursor-plugin-0.10.0.zip`. The root `.cursor-plugin/marketplace.json` points to this directory. Source packaging is separate from marketplace review and an installed Cursor test; neither is claimed by this release.

Website: https://dwsoffshorepartners.com · Setup: https://dwsoffshorepartners.com/docs/mcp · Privacy: https://dwsoffshorepartners.com/privacy · Terms: https://dwsoffshorepartners.com/terms · Support: https://dwsoffshorepartners.com/contact

## Universal MCP preparation

Sign in through Ultiwrite’s existing account flow and approve the connected host’s scoped OAuth access. Connection does not grant usage. Discover current account limits, paid credits and complimentary availability with `ultiwrite_capabilities_get`; its `accountStatus` is informational and server admission rechecks eligibility. The first eligible completed investigation remains $0 once per account, with no card required. Existing paid entitlements and saved reports remain available under the same account controls.

Host configurations, the canonical public tool catalog and per-surface limitations are prepared in the root `hosts/` directory. Live host acceptance was skipped at the owner’s request; package preparation is not publication or deployment.
