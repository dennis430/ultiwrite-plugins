# Release and submission guide

## Complete the deployed-service prerequisite

Ultiwrite must accept `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect` as an exact OAuth callback while retaining S256 PKCE, public client authentication, scope enforcement, and the canonical MCP resource audience. A local compatibility patch is not a deployed capability. Verify the deployed callback using the explicit public registration command after the service owner deploys it.

The package is configured against `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`. Do not switch aliases in one OAuth field without reviewing the issuer, resource audience, and token-store base URL together.

## Local verification and artifacts

```sh
npm ci
npm run check
npm run build
```

`check` validates source against the pinned official schemas, verifies the static public PKCE configuration and icon provenance, and runs packaging/auth-contract tests. `build` emits a deterministic source kit with SHA-256 and file inventory. Neither command calls Microsoft or changes service state.

The approved source mark is retained as `assets/logo-source.png`. `npm run icons` recompiles the 192px opaque color and 32px white transparent outline exports. A reviewed source change requires rebuilding icons and checking the updated provenance. The build does not generate new artwork.

## Provision and validate the real package

After the service callback is deployed:

```sh
npm run setup -- --env prod
npm run preflight
npm run register-client -- --env prod
npm run atk -- auth login m365
npm run provision -- --env prod
npm run package -- --env prod
npm run atk -- validate --package-file dist/ultiwrite-m365-prod-0.1.0.zip --env prod
```

The exact command that creates the real Microsoft app and OAuth token-store reference is `npm run provision -- --env prod`. It requires the preceding public client ID and an authorized Microsoft sign-in. `register-client` must not be repeatedly run with erased configuration: it creates a new provider registration when no ID is stored. Keep the local environment file for update continuity and store it with the publisher's normal operational configuration controls.

Toolkit provisioning uses personal visibility for the Microsoft 365 extension. Confirm the supported installation/sharing path and the target experience in the actual tenant. If tenant policies block custom apps, the administrator must resolve them through Microsoft's controls. Do not manufacture a tenant or publisher ID to force a build.

If a preexisting public client and token-store record are supplied by the publisher instead, verify the exact callback, endpoints, scope set, PKCE setting, app/org restrictions, and ownership before populating local values. The package script checks shape and required fields; only an authenticated Microsoft validation and functional test can establish that those resources exist and work.

## Submission gate

Complete the [reviewer scenarios](reviewer-scenarios.md) against the exact resolved package. Record both passes and unavailable scenarios. Capture screenshots from that real experience using synthetic test records. Confirm public support, privacy, terms, and setup links work and describe the tested behavior.

In Partner Center, use the publisher's actual Microsoft 365 and Copilot program enrollment and the offer type documented for the declarative agent and its included capability. Confirm package eligibility before submitting; acceptance of a JSON schema does not establish store eligibility or support in every Copilot host. The [Microsoft public publishing guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish-plugin-publicly) describes the current path and external review requirements.

The public submission material in this folder supplies the product description, customer setup, data flow, support guidance, icon assets, and reviewer scenarios. Remaining publisher-specific material includes verified identity and offer metadata, real testing access supplied privately, supported regions/experiences, actual screenshots, and designated operational owners. Approval and publication happen in Microsoft's process.

After submission, record the offer ID, submitted version, package SHA-256, submission date, review status, and responsible owner in the publisher's release record. Do not mark the integration published until the approved offer is available. No script in this source automatically submits, certifies, or publishes.

## Updates

Preserve the Microsoft app identity when updating the same offer. Bump the package and app version together, rebuild, validate, and retest changes that affect instructions, authentication, tool behavior, or user data. Because tools are dynamically discovered, service-side tool changes can alter runtime behavior without changing this ZIP; the publisher must review those changes as part of service releases.

Keep the tested ZIP and its inventory for review. Local environment and credential material must remain separate from the public source archive. Follow the selected offer's update and retirement requirements, and keep customer setup/support documentation aligned with the deployed service.
