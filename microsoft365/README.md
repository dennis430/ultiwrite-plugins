# Ultiwrite for Microsoft 365 Copilot

Source for a Microsoft 365 Copilot declarative agent that connects to the existing Ultiwrite MCP service. Publisher: **DWS Offshore Fund, Inc.** Product: **Ultiwrite**. Version: **0.1.0**.

The package adds six conversation starters and instructions for account connection, commercial evidence submission, case progress, saved report review, and browser exports. The agent discovers the service's tools at runtime. It contains no analytical engine or customer records.

## Status

The source and build tooling are complete enough for local schema validation and a reproducible source archive. A Microsoft tenant app and OAuth token-store record must still be provisioned with the publisher's account. The service must accept the exact Teams OAuth callback before that registration can work. No tenant installation, complete Microsoft sign-in journey, marketplace submission, certification, or publication is implied by this source package.

The source archive is **not an installable Microsoft app ZIP**. The tenant package command refuses empty or example configuration and emits an app ZIP only after actual IDs have been supplied. Local schema checks cannot prove that a supplied ID exists in Microsoft's service.

## Build the source package

Use Node.js 22.8.0 or later. From this directory:

```sh
npm ci
npm run check
npm run build
```

Output: `dist/ultiwrite-m365-source-0.1.0.zip`, its SHA-256 file, and a member-by-member inventory. This archive includes all source, lockfile, instructions, approved icon sources, documents, scripts, and tests needed to reproduce the build. It excludes dependencies, local tenant state, caches, and previously built packages.

Validation uses the official app 1.29, declarative agent 1.6, plugin 2.4, and Toolkit YAML 1.13 schemas shipped with the pinned Microsoft 365 Agents Toolkit CLI 1.1.18. No account is needed for these local checks. Synthetic IDs are substituted only in memory during source validation and are rejected by release packaging.

## Provision in a Microsoft 365 tenant

The operator needs a Microsoft 365 tenant with the agent experience and custom app development enabled, permission to create the app and its OAuth configuration, and an Ultiwrite account for testing. Confirm the applicable Microsoft entitlement and tenant policies with the administrator; this repository does not grant a license or bypass tenant policy.

Before registering the provider client, deploy service support for this exact callback:

```text
https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect
```

Once the callback is enabled, run these commands from this directory:

```sh
npm run setup -- --env dev
npm run preflight
npm run register-client -- --env dev
npm run atk -- auth login m365
npm run provision -- --env dev
npm run package -- --env dev
npm run atk -- validate --package-file dist/ultiwrite-m365-dev-0.1.0.zip --env dev
```

`setup` writes local configuration while preserving existing values. `preflight` makes only public discovery GET requests. `register-client` makes one explicit public OAuth client registration on Ultiwrite and saves only its client ID; rerunning it reuses an existing configured ID. It does not authenticate a user. If the registration fails with an invalid redirect, enable the exact callback on the service and retry after deployment. Do not broaden the callback to a wildcard.

`provision` invokes the pinned official Toolkit. It creates or reuses the Microsoft app, creates or reuses the Enterprise token-store OAuth configuration, compiles and validates the package, updates the tenant app, and extends it to Microsoft 365 with personal visibility. It records `TEAMS_APP_ID`, `ULTIWRITE_MCP_AUTH_ID`, `M365_TITLE_ID`, and `M365_APP_ID` locally. Provisioning changes external Microsoft resources and requires the operator's authorized account. It does not create a Partner Center offer or publish publicly.

The standalone package output is `dist/ultiwrite-m365-dev-0.1.0.zip`. The Toolkit also produces `appPackage/build/appPackage.dev.zip` during provisioning. Use the exact package that passed the target host's validation and the [reviewer scenarios](docs/reviewer-scenarios.md). For production, repeat the workflow with `--env prod`, which removes the development suffix; retain the provisioned app ID across updates.

## Authentication design

This project uses **static public-client OAuth with S256 PKCE**. It requests `ultiwrite:read` and `ultiwrite:evidence`. A public client needs no client secret. Microsoft stores the provider configuration in its Enterprise token store; the plugin contains only the resulting auth configuration reference. Microsoft's [OAuth guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-oauth) documents the public-client option and the shared Teams callback.

The one-time registration script obtains a client ID from Ultiwrite's registration endpoint and then supplies that ID to Microsoft's static `oauth/register` action. This does not select Microsoft's DCR configuration path. Microsoft's [DCR guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-dynamic-client-registration) currently requires a secret, while Ultiwrite's advertised token authentication is `none`. The separate [direct MCP certification route](certification/README.md) has its own requirements.

The lifecycle sets `isPKCEEnabled: true`, `PostRequestBody`, `applicableToApps: AnyApp`, and `targetAudience: AnyTenant`. The shared Microsoft app scope is necessary for Copilot to resolve the OAuth configuration. Each user still consents to Ultiwrite permissions and accesses only their authorized records. `appId` remains in the Toolkit action because its driver validates that field even with `AnyApp`.

## What is included

| Path | Purpose |
| --- | --- |
| `appPackage/manifest.json` | Microsoft app template and publisher/legal links |
| `appPackage/declarativeAgent.json` | Agent description, six starters, instructions include, action reference |
| `appPackage/ai-plugin.json` | RemoteMCPServer, dynamic tool discovery, OAuth vault reference |
| `appPackage/instructions.md` | Account, evidence, progress, reports, pagination, and error workflows |
| `m365agents.yml`, `m365agents.local.yml` | Official Toolkit static public PKCE provisioning lifecycle |
| `scripts/` | Setup, public discovery, client registration, provisioning, validation, and packaging |
| `assets/` | Approved existing logo source and deterministic export provenance |
| `docs/` | Listing copy, reviewer scenarios, privacy/data-flow explanation, support, and release steps |
| `certification/` | Optional direct MCP certification preparation and explicit remaining blockers |

## User experience

After installing the tenant app, open Ultiwrite in Microsoft 365 Copilot and ask **“Connect Ultiwrite and confirm which account is connected.”** Complete native sign-in and consent. Ask for recent cases and reports, then select one to review. The agent uses the saved decision and confidence and identifies partial reads when a report has more pages.

To investigate new evidence, ask to submit documents you are authorized to share. The agent opens a signed upload handoff returned by Ultiwrite. Upload the same documents in your browser and return to check the matching case. Copilot attachments are not automatically delivered to Ultiwrite. Document forensics is sent as `true` or `false` only when the user explicitly chooses; otherwise the field is omitted. Downloads also open in a browser signed in to the same account.

## Publication and maintenance

Use [the release guide](docs/release.md) and [listing copy](docs/marketplace-listing.md) after real tenant testing. Publisher verification, program enrollment, target offer eligibility, screenshots from the actual experience, reviewer access, and Microsoft review remain external gates. The repository does not claim to be listed or certified. See Microsoft's [public publishing guidance](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish-plugin-publicly).

The current eight tool names are documented in the reviewer guide. The manifest deliberately uses [dynamic tool discovery](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-dynamic-tool-discovery); it does not bundle invented or stale input schemas. Review service tool changes and rerun the user journeys before releasing a package update.

Support: <https://dwsoffshorepartners.com/contact> · Setup: <https://dwsoffshorepartners.com/docs/mcp> · Privacy: <https://dwsoffshorepartners.com/privacy> · Terms: <https://dwsoffshorepartners.com/terms>

The MIT license covers the original thin connector packaging. Ultiwrite's analytical service remains proprietary. The existing Ultiwrite brand mark remains the publisher's mark; including it does not create a separate license to impersonate the publisher. See `LICENSE` and `NOTICE`.
