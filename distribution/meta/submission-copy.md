# Muse submission copy

These are prepared answers for the signed-in submission form; field names and character limits must be matched to the actual form.

## Product

**Name:** Ultiwrite

**Publisher:** DWS Offshore Fund, Inc.

**Website:** https://dwsoffshorepartners.com

**Business/support contact:** nick@ultiwrite.co

**Headline:** Ordinary documents. A much wider investigation.

**Short description:** Investigate the evidence behind businesses, assets and counterparties, then read reconciled findings, supporting evidence and the questions that matter next.

## What users can do

Ultiwrite is an asymmetric diligence and investigative intelligence engine. The documents a user already has open a wider investigation across businesses, people, assets and relationships. Ultiwrite connects financial, identity, document-integrity, operational and relevant external evidence into a cohesive assessment.

In Muse, users can connect their Ultiwrite account, check supported evidence and allowance, submit authorized material through the available upload flow, track an investigation, and read saved reports. They can examine corroboration, contradictions, confidence and unresolved questions before requesting the original report and its available exports.

Applications include business acquisitions, financing, merchant and portfolio review, commercial property and counterparty diligence. Supported analyses depend on the submitted evidence and the live service's capabilities. The connector does not decide whether to approve financing or complete a transaction.

## Three representative prompts

- Connect my Ultiwrite account and show the investigations I can access.
- I am evaluating an acquisition. Help me submit the evidence I authorize and track the investigation.
- What does my Ultiwrite report support, what conflicts, and what evidence should I request next?

## Authentication and actions

User-delegated OAuth with PKCE; read scope `ultiwrite:read`, evidence scope `ultiwrite:evidence`. Account identity comes from the authorized grant. No user or organization identifier supplied in conversation can override that grant.

Reading capabilities, account identity, cases, status and saved findings is distinct from submitting evidence. Evidence submission requires explicit user intent and appropriate permission. Obtaining an upload link is not a completed investigation. Account entitlements and current service terms remain authoritative.

## Links

- MCP: https://mcp.dwsoffshorepartners.com/mcp
- Setup: https://dwsoffshorepartners.com/docs/mcp
- Privacy: https://dwsoffshorepartners.com/privacy
- Terms: https://dwsoffshorepartners.com/terms
- Support: https://dwsoffshorepartners.com/contact
- Public connector source: https://github.com/dennis430/ultiwrite-plugins

## Proposed review access

Provide a dedicated account with a synthetic evidence package and at least one completed report. Supply credentials only through the platform's designated review channel. The reviewer should be able to connect, submit a synthetic package, follow actual processing state, read saved findings and open an entitled export. A live review account has not been created by this package.
