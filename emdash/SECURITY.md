# Security

Report suspected vulnerabilities through https://dwsoffshorepartners.com/contact. Do not include credentials, customer evidence or signed upload URLs in public issues.

The connector exposes one private POST admin route requiring `plugins:manage`. It declares only network access to `dwsoffshorepartners.com`, with a fixed set of Partner API paths. It has no content, media, storage or visitor-data capability, no public route, no MCP tool and no publish hook.

The API credential is declared as a secret in `admin.settingsSchema` and saved via `ctx.settings`. The host must configure EmDash encryption. The saved value is never supplied as an input default or returned in UI blocks. HTTP error bodies and host exception strings are not rendered. Redirects are refused. Returned signed uploader links must use the canonical HTTPS host and exact uploader path, be single-use and have a future expiry.

Authorized EmDash administrators share the configured connection. They can access the Ultiwrite organization authorized by its key. Deploy only in a trusted admin workspace. API responses and brief contents are visible to those administrators; this is not a per-editor OAuth integration.

Signed upload links are sensitive bearer capabilities. They are displayed only after an explicit action and are not stored by this connector. Disconnect deletes the local setting but does not revoke the key server-side; use the Ultiwrite dashboard for revocation.

This package contains no production credentials, evidence, proprietary engine source or tracking code. No live customer credentials are used in automated tests.
