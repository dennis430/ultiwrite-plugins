# Install and connect

1. Install Ultiwrite from the EmDash registry when the release is available, or use its built registry archive for a supported local installation. Review the declared network permission.
2. Ensure the EmDash host has `EMDASH_ENCRYPTION_KEY` configured before saving any secret.
3. Open the Ultiwrite admin page and choose Connection settings.
4. In Ultiwrite, request API access at https://dwsoffshorepartners.com/settings/api. After explicit approval, create a dashboard API key with the read scope and, for upload links, the evidence scope.
5. Save the key in the masked field. Then choose Check account and usage. Do not use a Bluesky credential here.
6. Browse cases, enter a case/report ID to read a saved Decision Brief, or explicitly create a secure upload link.

Only trusted users with EmDash's `plugins:manage` permission may use the connection. It is shared among those administrators. The plugin does not read CMS content or upload evidence automatically.

Open a new upload link promptly and keep it private. Uploads happen on Ultiwrite, not through the CMS. A missing or unreleased report is not a negative finding. Full report downloads require a signed-in Ultiwrite browser session.

Disconnect removes the locally stored key. Revoke it in Ultiwrite to invalidate other copies. API approval, service availability, request allowance and analysis credits are enforced by Ultiwrite.
