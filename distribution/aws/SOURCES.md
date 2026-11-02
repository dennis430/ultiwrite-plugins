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

Ultiwrite public baseline: https://github.com/dennis430/ultiwrite-plugins at `63adef9ae6ae0bacf3cdc6a59c20a5513831a1ac`, version 0.9.3. The baseline includes the subsequent logo/UI release. Product names, scopes, tool semantics, public links and the clean MCP URL were reconciled with `AGENTS.md`, `POSITIONING.md`, `README.md` and the connector skills; prior release receipts remain historical evidence. The parent task also confirmed current public resource/issuer discovery with HTTP 200, including the authorization/token/registration endpoints, code/refresh grants, PKCE S256, public-client token authentication and both scopes. This metadata check is not an authenticated AWS subscription test. No seller account was created, no financial details were entered, no product was submitted, and no public listing status is claimed.

The prepared workflow guidance retains the canonical 0.9.2 contract’s exact `handoffId` recovery and returned `reportUrl`/`signInUrl` names. That workflow contract is distinct from the public 0.9.3 package baseline. The canonical four-file handoff was fetched at a pinned revision and verified against Git blob hashes; no proprietary engine code is part of this AWS package.
