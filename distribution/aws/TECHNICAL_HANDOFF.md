# AWS Marketplace application handoff

The public plugin is a thin remote connector. Marketplace fulfillment belongs in Ultiwrite’s private application, using its existing account and entitlement systems. These are explicit remaining integration tasks; a Marketplace account alone does not finish them.

## 1. Seller resources

Record the AWS-assigned product code, product ID and chosen offer. Configure a role in the seller account for the necessary Marketplace API calls. Upload the existing logo to a seller-controlled S3 object and record its URL. Choose the Marketplace categories, EULA and refund policy in the real listing. No account identifiers, credentials or invented product codes are supplied here.

## 2. Buyer fulfillment

Implement a dedicated HTTPS registration route that accepts AWS’s form POST containing `x-amzn-marketplace-token`. Resolve the opaque token server-side immediately. Keep token values out of logs and URLs. Bind the verified result to a short-lived signed onboarding session, then require the user to sign in to their intended Ultiwrite account before confirming the link. Reject a mismatched product and conflicting account binding.

Use the returned `CustomerAWSAccountId` and `LicenseArn`, together with `ProductCode`, as the authoritative marketplace identity. New integrations must not depend on a populated `CustomerIdentifier`. The registration token is proof to resolve the buyer, not an authorization to grant paid access. [AWS onboarding](https://docs.aws.amazon.com/marketplace/latest/userguide/saas-product-customer-setup.html), [ResolveCustomer API](https://docs.aws.amazon.com/marketplace/latest/APIReference/API_marketplace-metering_ResolveCustomer.html).

Persist the marketplace association inside the existing customer system. Do not introduce an independent public entitlement ledger. Show the buyer their subscription state and the support route in the application. Keep the existing OAuth identity and grants tied to that account.

## 3. Granting and revoking access

AWS currently documents an EventBridge transition for new SaaS listings; existing SNS integrations remain supported. Follow the event mechanism assigned to the product. For the EventBridge route, deliver authenticated AWS events through an IAM-controlled queue or function, handle duplicates and ordering, and reconcile against current AWS entitlement state. Do not trust a public JSON body because it claims an AWS event source.

Do not activate from a registration POST alone. AWS’s current onboarding instructions require the relevant **License Updated** event before activation. Handle **License Deprovisioned** and agreement end events to remove the Marketplace-granted entitlement and invalidate its credentials as applicable. Preserve separately held, legitimately purchased entitlements. [EventBridge integration](https://docs.aws.amazon.com/marketplace/latest/userguide/saas-eventbridge-integration.html), [API tool integration](https://docs.aws.amazon.com/marketplace/latest/userguide/integrating-api-ai-agents-tools.html).

## 4. Offer-specific billing

Select the intended offer first. For a contract offer, integrate the relevant entitlement lookup. Usage pricing requires Marketplace usage reporting; a contract with consumption requires both. Map approved per-investigation units into the existing service accounting and record idempotent usage identifiers. Current AWS SaaS guidance disallows billing the listed product through an external credit-card flow. [SaaS guidelines](https://docs.aws.amazon.com/marketplace/latest/userguide/saas-guidelines.html).

A free listing must have a clearly defined, genuinely free product scope. Do not silently choose free merely to avoid billing work: AWS documents that a free product cannot be changed to paid. The worksheet intentionally leaves the commercial decision open.

## 5. Optional integrations left out of the first listing

**Quick Launch** uses AWS’s deployment API to deliver buyer credentials into the buyer’s AWS environment. The proposed first fulfillment route is **Redirect to your website**. AWS documents that fulfillment method cannot be changed after publication, so confirm that choice before submitting.

**AgentCore Gateway** has a separate two-legged OAuth requirement for a direct MCP target. Current Ultiwrite user OAuth + PKCE is not evidence of client-credentials support. Leave the optional checkbox off until a separately authorized integration is implemented and verified. [Listing wizard](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html), [Gateway requirements](https://docs.aws.amazon.com/marketplace/latest/userguide/bedrock-agentcore-gateway.html).

## 6. Required buyer proof before public review

Use an allowed test buyer in the limited listing and record the actual results:

1. Subscribe to the intended offer and follow its account-setup action.
2. Resolve the registration token and link the intended Ultiwrite account without exposing credentials.
3. Receive the activation event, reconcile the purchased entitlement and display subscription state.
4. Connect an OAuth-capable MCP client and verify `ultiwrite_account_get` returns the intended account.
5. Complete one authorized evidence-to-report workflow and open an entitled report export.
6. Verify offer-specific usage accounting and cancellation/revocation; repeat a duplicate notification without double granting or charging.

Also finish AWS’s data-handling, support and technical review requirements. Supply any requested architecture evidence privately from the actual deployment; do not assert a hosting provider or certification that has not been verified. A local package validation is not a marketplace buyer test.
