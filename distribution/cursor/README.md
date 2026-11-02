# Cursor Marketplace

The repository contains the prepared **Ultiwrite 0.9.2** Cursor plugin: `.cursor-plugin/marketplace.json` points to `cursor/`, which contains the manifest, current logo, remote MCP configuration and five workflows. The 0.9.2 candidate incorporates the canonical exact browser-upload recovery through `handoffId` and explicit report/sign-in response links. The previously published release remains 0.9.1 until the prepared source is approved for release.

## Submit

1. Sign in to Cursor at **https://cursor.com/marketplace/publish**. Use the existing account if one is already registered.
2. After the prepared 0.9.2 source is released to the repository's main branch, submit **https://github.com/dennis430/ultiwrite-plugins** as the public repository URL. The root marketplace manifest resolves the plugin from `cursor/`; do not submit an inaccessible private application repository.
3. Use `listing-fields.json` and `../shared/LISTING_COPY.md` for the title, description, contact, logo and supporting links.
4. Test the plugin locally using Cursor's documented local-import directory or Import from Disk. Confirm all five workflows appear, OAuth connects to the intended account, and one authorized sample case reaches a usable report. Use `../shared/REVIEWER_TEST_PLAN.md`.
5. Submit for Cursor's manual review. Record the submission/review receipt; a source commit or one-click remote install does not establish Marketplace approval.

The prepared archive is `release/ultiwrite-cursor-plugin-0.9.2.zip` at repository root. The handoff ZIP includes that archive and the full `cursor/` source. An MCP install link alone installs the remote server; the full Cursor plugin adds its five workflow instructions. Local validation does not prove a successful Cursor account/upload/report journey.

## One-click remote install

`install-links.json` contains the documented Cursor URI. It has only the public endpoint and display name, never a bearer token. After installation, complete the host's OAuth control. The desktop app must be installed to handle the URI.

## Official references

- Packaging and submission: https://cursor.com/docs/reference/plugins
- Local installation and review: https://cursor.com/docs/plugins
- Submission form: https://cursor.com/marketplace/publish

## Commercial reviewer note

The connector is free to install. Customers use their existing Ultiwrite account and separately purchased investigation entitlements. The listing must disclose that relationship honestly. Cursor's current publisher terms section 3.1 addresses direct and indirect fees for Marketplace plugin access; request confirmation of this account-based service arrangement during review. Do not silently change Ultiwrite pricing or describe paid investigations as free. This is a reviewer clarification, not a finding that paid external-service integrations are categorically ineligible.

Terms: https://cursor.com/marketplace-publisher-terms
