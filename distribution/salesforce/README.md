# Ultiwrite for Salesforce AgentExchange

Prepared November 1, 2026. Channel package version 0.1.0. Published public plugin source is 0.9.3 at public source commit `63adef9ae6ae0bacf3cdc6a59c20a5513831a1ac`; this kit targets the prepared 0.9.2 evidence-handoff contract at canonical source pin `00682b0179824fcf182856713de5864b54b140c2`. This source pin does not establish runtime deployment or completed host validation.

**Route:** register the externally hosted MCP with Agentforce, package its connection metadata, then submit an AgentExchange listing. Salesforce confirms external MCP tool listings and the April 2026 marketplace unification. The merger does not automatically publish an existing Slack app as a Salesforce integration. [Summer '26 ISV guidance](https://www.salesforce.com/blog/isv-strategy-for-the-salesforce-summer-26-release/)

## Dennis's account steps

1. [Join the Salesforce Partner Community](https://partners.salesforce.com/pdx/s/signup?language=en_US), or open the existing partner account. Use the [ISV partner path](https://www.salesforce.com/partners/become-an-isv-partner/).
2. Obtain the partner development/Dev Hub access and namespace for a managed package. Complete required business onboarding and agreements before publication. Open the Partner Console through the Community's **Publishing** tab; grant the responsible user **Listings** permission.
3. Use the included Salesforce DX project and `setup-guide.md` to configure the MCP in an Agentforce-enabled test org. Verify delegated authentication before creating a managed package.
4. Retrieve the actual configured metadata using `scripts/retrieve-registration.mjs`. Run `scripts/validate-registration.mjs` before committing or packaging it. The validator fails while the required metadata is absent, unauthenticated, incomplete or contains embedded credentials.
5. Create the package version in the authorized Dev Hub; link that actual package/version in Partner Console. Use `listing-copy.md` and `connection-profile.json`. Add the MCP server and its tools to the listing, then complete applicable security/business review before publishing.

The [official ISV onboarding guide](https://partners.salesforce.com/pdx/s/learn/article/appexchange-isv-partner-onboarding-guide-MCFQGJA5WXDNEOVETHGD7ZOVM43E?language=en_US) covers partner approval, listing creation and distribution agreements. Confirm applicable program fees/terms in that process; this preparation does not accept them.

## Included build artifacts

This is a Salesforce DX preparation project with actual configuration, retrieval and validation scripts. It is **not yet an installable managed package**: Salesforce issues that package ID after Dev Hub creation and validation. No package ID, namespace ownership, credential or completed security review has been invented.

| Artifact | Purpose |
|---|---|
| `sfdx-project.json` | Local project at API 66.0, ready for a verified namespace |
| `config/project-scratch-def.json` | Partner Developer scratch-org settings for Agentforce MCP work |
| `manifest/package.xml` | Explicit retrieval selection for the five connection components |
| `scripts/set-namespace.mjs` | Applies a namespace already owned by the publisher |
| `scripts/retrieve-registration.mjs` | Retrieves only named Ultiwrite connection metadata from an authenticated org |
| `scripts/validate-registration.mjs` | Checks for a real OAuth/per-user MCP registration and rejects embedded credentials |
| `setup-guide.md` | Exact endpoint, authorization and packaging steps |
| `listing-copy.md` | AgentExchange description, tools, use cases and buyer requirements |

Salesforce packages the server registration through `ExternalCredential`, `ExternalServiceRegistration`, `NamedCredential` and `PermissionSet`. Browser OAuth also uses an `ExternalAuthIdentityProvider`. Individual discovered MCP tool actions and Gateway policies have separate limitations; they are not fabricated as package components here. [MCP packaging](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/dev2gp-package-mcp-agentforce.html) · [Named-credential packaging](https://developer.salesforce.com/docs/platform/named-credentials/guide/nc-package-credentials.html)

## Host compatibility to resolve in the test org

The existing Ultiwrite service advertises authorization code/refresh grants, PKCE S256 and public-client token authentication (`none`). Salesforce supports browser OAuth with PKCE, but its configuration documentation also describes confidential-client credential fields. Verify the actual public-client exchange in your Salesforce org. If that UI cannot configure a public PKCE client, a supported server/client-auth extension is required before this listing is installable; no fake secret or shared user credential is a substitute. [External identity provider configuration](https://help.salesforce.com/s/articleView?id=sf.nc_create_edit_external_auth_identity_provider.htm&language=en_US&type=5)

The intended first release uses **per-user external credentials with authenticated Agentforce Employee agents**. This keeps each caller in the correct Ultiwrite account. It does not expose a single founder account to every Salesforce user. The Registry documentation describes this per-user route and its agent constraint. [Register a third-party MCP server](https://help.salesforce.com/s/articleView?id=ai.agent_mcp_connect_register.htm&language=en_US&type=5)

## Remaining completion evidence

- Partner account, verified namespace and Dev Hub access.
- A working Salesforce callback/client registration and PKCE authorization exchange.
- Retrieved configured metadata and a successful test-org install.
- A real evidence → saved findings → report export run in Agentforce.
- Actual managed package version, business/security approvals and final listing submission.

These are outstanding platform/account steps, not completed work claimed by this source package.
