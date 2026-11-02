# AWS Marketplace — Ultiwrite

Prepared November 1, 2026. **Preparation complete for listing copy and client setup; AWS account, pricing selection, and Marketplace fulfillment integration remain outstanding.** Nothing in this folder creates an AWS listing or claims AWS approval.

The prepared workflow contract includes the canonical **0.9.2** exact upload-handoff recovery guidance. The reconciled public connector baseline is **0.9.3**, including the subsequent logo/UI release. These workflow instructions do not establish an authenticated AWS buyer test or Marketplace publication.

## Sign up and open the listing

1. Start at [AWS Marketplace seller registration](https://aws.amazon.com/partners/marketplace/) and choose **Register Now**. Use the company AWS account intended to own Ultiwrite’s listings. Complete the business and identity checks, then the public seller profile for **DWS Offshore Fund**.
2. Open [AWS Partner Central](https://us-east-1.console.aws.amazon.com/partnercentral/home). Choose **Build → AI agents and tools → Create → API-based AI agents & tools**. Select **MCP Server** for the tool type.
3. Use `listing.draft.json` as the field worksheet and `BUYER_SETUP.md` for usage instructions. The JSON is a local worksheet, **not an AWS import format**.
4. Choose the Marketplace commercial offer before finishing the listing. Ultiwrite’s current authority is per investigation, not recurring billing. No prices or new entitlements have been selected here.
5. Finish the requirements in `TECHNICAL_HANDOFF.md`, exercise the buyer lifecycle in the limited listing, then request public review.

The registration entry point and sequence are documented in [AWS seller profile setup](https://docs.aws.amazon.com/marketplace/latest/userguide/create-public-profile.html). An AWS account on a paid account plan is required for Partner Central registration; this describes the AWS account, not an authorization to buy a paid partnership tier. See [Partner Central registration requirements](https://docs.aws.amazon.com/partner-central/latest/getting-started/registering.html).

## The commercial choice that matters

AWS allows free software listings. Free-only sellers can finish registration after their public profile without setting up payout banking. The free product must still be supported, production-ready software. Paid or BYOL offers have additional tax and banking requirements. [Seller eligibility](https://docs.aws.amazon.com/marketplace/latest/userguide/seller-eligibility.html), [free seller requirements](https://docs.aws.amazon.com/marketplace/latest/userguide/user-guide-for-sellers.html).

**A product set to free cannot later be converted into a paid product.** The listing worksheet leaves this choice unset. A free connector listing must describe exactly what that free product provides; it cannot promise unlimited free Ultiwrite investigations. For a paid Marketplace offer, complete the relevant Marketplace billing integration. [AI tools listing guide](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html).

AWS’s SaaS rules require Marketplace billing for the listed product and prohibit collecting customers’ payment details for that product. Do not reuse a Stripe purchase screen as the AWS buyer fulfillment path. AWS permits SaaS hosted outside AWS; the separate “deployed on AWS” designation requires qualifying architecture. No hosting migration or AWS hosting claim is included here. [SaaS guidelines](https://docs.aws.amazon.com/marketplace/latest/userguide/saas-guidelines.html).

## Files

| File | Purpose |
| --- | --- |
| `listing.draft.json` | Prepared title, description, highlights, links and technical selections; unset seller-specific fields are explicit |
| `BUYER_SETUP.md` | Buyer instructions for OAuth, tool discovery, evidence handoff and reports |
| `mcp-client.json` | Minimal remote client configuration for clients using the `mcpServers` convention |
| `TECHNICAL_HANDOFF.md` | Concrete Marketplace onboarding and subscription requirements for the private application |
| `SOURCES.md` | Source URLs and the public plugin revision used for product facts |

The MCP endpoint and existing Ultiwrite identity are preserved. Optional AgentCore Gateway integration is left disabled because the documented two-legged OAuth requirement is different from Ultiwrite’s user authorization flow. See [AWS AgentCore Gateway requirements](https://docs.aws.amazon.com/marketplace/latest/userguide/bedrock-agentcore-gateway.html).
