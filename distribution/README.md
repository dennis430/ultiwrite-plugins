# Ultiwrite: seven remaining MCP channels

Prepared November 1, 2026 (America/Los_Angeles). New distribution kit version **1.0.1**, prepared workflow contract **0.9.2**, current public repository baseline **0.9.3**, Cursor package candidate **0.9.4** and Microsoft package candidate **0.9.5**. Brand: **Ultiwrite — asymmetric diligence and investigative intelligence**. Legal publisher: **DWS Offshore Fund**.

This kit covers the seven requested channels. Each directory contains its actual supported preparation materials, account steps and remaining dependencies. A JSON worksheet is labeled as such when a platform does not document an importer. No account, tenant-specific identity, review receipt or host success is invented.

## Start here

| Channel | Prepared deliverable | Open this | What remains |
| --- | --- | --- | --- |
| Official MCP Registry | Current-schema remote manifests; domain proof/login helpers; GitHub alternative | [Publisher CLI](https://github.com/modelcontextprotocol/registry/releases) | Prove the chosen namespace, validate and publish the selected identity |
| Google Connected Apps | Console fields; exact callback request generator; domain verification file generator and route adapter; review plan | [Apply for preview](https://connected.google.com/console/help/?apply=), [console](https://connected.google.com/) | Preview access; actual verification tokens and six exact callback URIs; deploy scoped route/allowlist changes; test Google OAuth |
| Meta Muse | Complete submission copy, connection profile, current logo and review scenarios | [Submit a connector](https://platform.muse.ai/submission) | Sign in; confirm the accepted format and callback; supply reviewer access and complete host testing |
| Cursor Marketplace | 0.9.4 plugin source and ZIP with current artwork and canonical upload recovery; submission fields; MCP install URI | [Publish](https://cursor.com/marketplace/publish) | Release the prepared source to main, test in Cursor and submit for review; disclose separate service entitlements |
| Microsoft 365 Copilot | Three manifests, OAuth helper, correctly sized icons, official-schema validation and deterministic ZIP builder | [Publisher enrollment](https://partner.microsoft.com/dashboard/account/v3/enrollment/introduction/office), [developer portal](https://dev.teams.microsoft.com/) | Existing publisher's Owner role and program enrollment; actual app/auth-config IDs; configured Copilot test and review assets |
| Salesforce AgentExchange | SFDX/API 66 project; namespace, metadata retrieval and validation helpers; per-user OAuth setup; listing copy | [Partner signup](https://partners.salesforce.com/pdx/s/signup?language=en_US), [ISV program](https://www.salesforce.com/partners/become-an-isv-partner/) | Partner/Dev Hub/namespace setup; actual per-user OAuth compatibility; retrieve real connection metadata, build managed package and complete review |
| AWS Marketplace | MCP listing worksheet, buyer instructions and precise fulfillment/billing integration handoff | [Seller registration](https://aws.amazon.com/partners/marketplace/), [Partner Central](https://us-east-1.console.aws.amazon.com/partnercentral/home) | Seller setup, offer decision, buyer fulfillment and Marketplace billing/event integration in the existing service, test and review |

Registry ownership and Google preview enrollment are useful first steps. Meta and Cursor can then proceed through their review routes. Microsoft can reuse the publisher setup already underway. Salesforce and AWS have additional integration work beyond enrollment.

## Files by channel

- [Registry](registry/README.md)
- [Google](google/README.md)
- [Meta](meta/README.md)
- [Cursor](cursor/README.md)
- [Microsoft](microsoft/README.md)
- [Salesforce](salesforce/README.md)
- [AWS](aws/README.md)
- [Shared listing copy and public links](shared/LISTING_COPY.md)
- [Shared reviewer workflow](shared/REVIEWER_TEST_PLAN.md)
- [Machine-readable product/authentication profile](shared/profile.json)
- [Preparation evidence and remaining limits](VALIDATION.md)

## Shared connection

Use **https://mcp.dwsoffshorepartners.com/mcp** for new connections. The original apex `/api/integrations/ultiwrite/mcp` endpoint remains a compatibility route. Use the same OAuth account service and two scopes: `ultiwrite:read` and `ultiwrite:evidence`. The live public discovery metadata advertises S256 PKCE and public-client token authentication.

Microsoft's static public-client OAuth path matches this server. Google's actual app-specific callbacks must be added exactly after console provisioning. Salesforce's real org must demonstrate a compatible per-user token exchange; a generic PKCE capability statement is not enough. AWS's optional two-legged AgentCore integration is not claimed.

## Scope and provenance

The package contains thin integration and submission source. The private analytical engine and customer records are not included. ChatGPT, Claude and Grok submissions are outside this task. Their existing package sources and historical archives remain unchanged.

The Cursor 0.9.4 candidate combines the current 0.9.3 artwork and UI metadata with the canonical 0.9.2 workflow changes. New host instructions preserve the exact returned upload handoff ID, then use the real case ID. The public baseline remains recorded separately from this prepared candidate. No authenticated host test was run during preparation.

## Build and validate

From the source repository root:

```sh
node scripts/validate-public-plugins.mjs
node scripts/validate-distribution.mjs
node --test scripts/test/release.test.mjs
python3 distribution/microsoft/scripts/build_package.py
node scripts/pack-public-connectors.mjs
node scripts/pack-public-connectors.mjs --check
python3 scripts/pack-distribution.py
```

Microsoft's Python requirements are in its channel directory. Each channel README gives its own commands and account-specific values. A final Microsoft upload ZIP is generated only after real IDs are supplied. Salesforce packaging requires retrieved organization metadata. Google verification output requires its actual console token array.

The handoff builder emits `dist/Ultiwrite_Remaining_MCP_Submission_Kit.zip` and a checksum. It never submits, publishes or deploys anything. Marketplace account details, legal attestations, actual host tests and final publication remain separate actions.
