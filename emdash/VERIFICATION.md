# Verification — 2026-11-01 UTC

- Node.js v22.16.0: **24/24 handler and security tests passed**, zero failures.
- TypeScript: `tsc --noEmit` **passed** with the included strict configuration.
- Asset bootstrap: syntax checked; the download is not exercised in this network-restricted container. It pins and verifies the existing logo Git blob `65b8c13d167ae05190f0957f5880449f7133f06d`.
- Official EmDash CLI validation, build and bundle: **not verified here**. Local npm registry access failed; the GitHub Actions job failed before exposing any steps; temporary Vercel sandbox creation was denied. No billing or deployment settings were changed.
- `PUBLISH.cmd` runs official validation and bundling locally, stops on failures, and then asks before invoking publication. The launcher itself has not been executed on Windows here.
- Live EmDash installation, authenticated Ultiwrite API round trip, registry publication and directory approval: **not performed**.

Source is in `dennis430/ultiwrite-plugins`, branch `feat/emdash-ultiwrite-connector`, PR #12. It is unmerged. The production engine is untouched.

The ZIP intentionally omits `node_modules`, publisher sessions, credentials and a prebuilt `dist/`. It contains the complete original connector source and automates dependency/asset preparation. The existing logo is already in the GitHub branch; the compact ZIP retrieves those exact bytes automatically during verification.
