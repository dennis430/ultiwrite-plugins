# Already registered as a Microsoft publisher? Start here

Use the **Microsoft 365 Copilot declarative agent with an MCP action**. This is not a Word/Excel task-pane add-in, an Entra sign-in app, a standalone MCP certification, or an Azure hosting purchase. The existing Ultiwrite service remains the backend. Do not register another publisher account.

## 1. Create or reuse the Ultiwrite app

Open [Teams Developer Portal → Apps](https://dev.teams.microsoft.com/apps) using the intended work tenant. Create **Ultiwrite**, or reuse its existing app. Copy its **App ID** (a UUID) into `appId` in the local configuration below. An Entra application/client ID is not a substitute for this package identity. Keep the app identity stable across releases.

Confirm your test account has Copilot access and permission to upload custom apps. In Microsoft 365 Agents Toolkit 6.12.0 or later, the account pane should show **Copilot Access Enabled** and **Custom App Upload Enabled**. Publisher registration alone does not grant either permission.

## 2. Register the Ultiwrite public OAuth client once

From `distribution/microsoft`:

```sh
node scripts/register_public_client.mjs
node scripts/register_public_client.mjs --register
```

The first command previews; the second creates a public client at Ultiwrite. Reuse an existing `microsoft-oauth.local.json` instead of registering repeatedly. Copy `publicClientId` from that record into the local configuration. This is not a Microsoft auth-config ID. No client secret is needed for this public client. Do not paste passwords, tokens, secrets or reviewer credentials into configuration or Git.

## 3. Create Microsoft's OAuth configuration

Open [Developer Portal → Tools → OAuth client registration](https://dev.teams.microsoft.com/tools). Create a static OAuth registration for the public Ultiwrite client. Use the exact fields in [README.md](README.md#configure-oauth-once), or generate `portal-fields.json` with the helper below. Keep **PKCE enabled (S256)** and **Any Teams app**. For the public offer choose **Any Microsoft 365 organization**; an own-organization development configuration does not establish cross-tenant acceptance.

The callback registered at Ultiwrite is exactly `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect`. Do not add wildcards or substitute a localhost callback.

After saving, copy Microsoft's **OAuth client registration ID / auth-config ID** into `authConfigId`. This is the ID referenced by `OAuthPluginVault.reference_id`. If the portal only accepts confidential clients, stop and use the supported static public-client tooling path; never invent a client secret or change the backend's authentication model to get through a form.

## 4. Generate your portal sheet and configured ZIP

Use Python 3.10+; install `requirements.txt` in a virtual environment as described in [README.md](README.md#validate-and-build). Run from `distribution/microsoft` with that Python interpreter:

```sh
python scripts/prepare_submission.py --init publisher.local.json
```

Edit the new local file with your app ID, auth-config ID and public client ID. `audience` is `public` for Marketplace or `organization` for single-tenant testing. It describes your intended settings; the helper cannot verify them in Microsoft.

```sh
python scripts/prepare_submission.py --config publisher.local.json
python scripts/prepare_submission.py --config publisher.local.json --build
```

The first creates a portal field sheet and an honest readiness record even while IDs are pending. The second validates the actual configured package and creates `ultiwrite-m365.zip`, its checksum, the portal fields, review instructions and readiness record in a new `build/publisher-*` directory. Only the three manifests and two icons enter the upload ZIP. Keep local configuration and readiness files out of the store upload.

The helper does not create the Microsoft app or OAuth vault, sign in, upload, submit or publish. Two well-formed IDs establish package structure, not that the IDs exist in your tenant. Never submit a ZIP built with test IDs.

## 5. Sideload and capture the actual experience

Use Agents Toolkit/Developer Portal's supported package validation and custom-app upload flow for the exact ZIP. Open [Microsoft 365 Copilot](https://m365.cloud.microsoft/chat), select Ultiwrite, sign in to Ultiwrite and run [SUBMISSION.md](SUBMISSION.md)'s scenarios: correct connected account, authorized synthetic upload, exact returned handoff recovery, saved report/download, reconnect and declined evidence permission.

Use synthetic files and a dedicated entitled reviewer account. Capture real screenshots of the installed agent, browser handoff and saved result. Do not fabricate Copilot screenshots or put customer files in the submission kit. Keep reviewer credentials in Partner Center's private testing fields. Record the tested ZIP's version and SHA-256.

## 6. Submit using your existing publisher account

Open [Partner Center](https://partner.microsoft.com/dashboard) → **Marketplace offers** → **Microsoft 365 and Copilot** → **New offer**. Choose the supported **Apps and Agents for M365 and Copilot** offer for this declarative-agent package if available. Confirm that the selected offer accepts its MCP action before submission; do not select an unrelated Office add-in offer to bypass missing eligibility.

Upload the exact tested ZIP. Use the prepared listing copy, privacy/terms/support URLs and the real screenshots from [SUBMISSION.md](SUBMISSION.md). Complete availability, customer setup disclosures, support contacts and private reviewer instructions. Submit for certification, then track review and address findings. Registered, sideloaded, submitted, approved and publicly published are separate states. Registration alone does not publish anything.

## Other channels

The seven-channel kit is prepared source. Registry still needs namespace proof and publisher authentication; Cursor needs installed-host acceptance and submission; Google needs preview-issued tokens/callbacks; Meta needs its signed-in submission fields and host test; Salesforce needs an actual org, per-user OAuth proof and managed-package metadata. AWS additionally needs an offer choice and buyer/entitlement/billing integration in the private service. Those cannot be truthfully completed by generating generic public package files. See each channel's guide before activating a paid offer or changing service integration.

## Official references checked November 1, 2026 (Pacific)

- [Build MCP plugins and provision a development agent](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Static OAuth, callback, PKCE and auth-config ID](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-oauth)
- [Public Marketplace publication requirements](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish-plugin-publicly)
