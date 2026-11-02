# AWS sources and preparation evidence

Prepared November 1, 2026 using the official pages below. These URLs support the concrete requirements in this folder; console terminology and requirements should be checked again at submission.

| Subject | Official source |
| --- | --- |
| Registration entry | https://aws.amazon.com/partners/marketplace/ |
| Seller portal | https://us-east-1.console.aws.amazon.com/partnercentral/home |
| Public seller profile and free-only registration | https://docs.aws.amazon.com/marketplace/latest/userguide/create-public-profile.html |
| Partner Central account and permissions | https://docs.aws.amazon.com/partner-central/latest/getting-started/registering.html |
| Seller eligibility | https://docs.aws.amazon.com/marketplace/latest/userguide/seller-eligibility.html |
| Free software seller requirements | https://docs.aws.amazon.com/marketplace/latest/userguide/user-guide-for-sellers.html |
| MCP product wizard, fulfillment and free-product irreversibility | https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html |
| SaaS hosting and billing requirements | https://docs.aws.amazon.com/marketplace/latest/userguide/saas-guidelines.html |
| Buyer registration and activation ordering | https://docs.aws.amazon.com/marketplace/latest/userguide/saas-product-customer-setup.html |
| ResolveCustomer identity fields | https://docs.aws.amazon.com/marketplace/latest/APIReference/API_marketplace-metering_ResolveCustomer.html |
| Subscription lifecycle events | https://docs.aws.amazon.com/marketplace/latest/userguide/saas-eventbridge-integration.html |
| API tool integration and key revocation | https://docs.aws.amazon.com/marketplace/latest/userguide/integrating-api-ai-agents-tools.html |
| Optional Gateway OAuth requirements | https://docs.aws.amazon.com/marketplace/latest/userguide/bedrock-agentcore-gateway.html |

Ultiwrite product source: https://github.com/dennis430/ultiwrite-plugins at `4ba87f09c3a7607f8af54a9777af3e6df68b761a`. Read `AGENTS.md`, `POSITIONING.md`, `README.md`, `cursor/skills/` and the existing 0.9.1 release receipt. This established current names, scopes, tool semantics, public links and the preferred clean MCP URL. The parent task also confirmed current public resource/issuer discovery with HTTP 200, including the authorization/token/registration endpoints, code/refresh grants, PKCE S256, public-client token authentication and both scopes. This metadata check is not an authenticated AWS subscription test. No seller account was created, no financial details were entered, no product was submitted, and no public listing status is claimed.

The prepared workflow guidance incorporates the canonical 0.9.2 Cursor source’s exact `handoffId` recovery and returned `reportUrl`/`signInUrl` names. This newer source preparation is distinguished from the public 0.9.1 baseline. The canonical four-file handoff was fetched at a pinned revision and verified against Git blob hashes; no proprietary engine code is part of this AWS package.
