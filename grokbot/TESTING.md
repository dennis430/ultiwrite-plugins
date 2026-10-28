# Ultiwrite 0.7.3 — reviewer procedure

Status: NOT_RUN_FOR_0.7.3. Package checks and endpoint discovery are separate from a successful Cursor or Grok Bot journey. Do not check the form's local/in-app testing declaration until both intended hosts pass on this version.

Reviewer access: Dennis has supplied a dedicated ordinary reviewer account privately. Obtain its password from the submission's private Testing Instructions field, not from this repository. Sign in through Ultiwrite OAuth or the account's normal website login. Verify its current allowance, evidence permission, and export entitlement before running analysis. This document contains no password or token.

## Cursor local installation

Copy the CONTENTS of `cursor/` (or `ultiwrite/` inside the release ZIP) to `~/.cursor/plugins/local/ultiwrite/`. The destination must directly contain `.cursor-plugin/plugin.json`, `mcp.json`, and `skills/`; do not create an extra nested folder. Back up an older local copy first. Reload Cursor, inspect Customize, and confirm version 0.7.3, four skills, the safety rule, and the MCP server. An installed marketplace copy may take precedence. Local imports must already be allowed; do not weaken an organization policy.

Connect `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp` and complete the ordinary Ultiwrite OAuth flow. Check the actual available tools and their schemas. Do not paste API keys or put credentials into mcp.json.

## Grok Bot

Open Connect apps and use the existing Ultiwrite connection or the marketplace's supported reviewer/development install. Authenticate the reviewer account. A catalog connection is not proof that a local Cursor bundle's four skills were imported. If this unpublished package has no supported development installation, record that step as BLOCKED_EXTERNAL and obtain the marketplace's reviewer installation path; do not fabricate a successful installation.

## Three prompts to run in each intended host

1. "What can Ultiwrite analyze, which account am I connected to, and what access and analysis allowance does that account have?"

Expected: capabilities/account tools return actual account-scoped information. No invented price, allowance, or grant. Record any disagreement with the website as a defect. A capabilities response alone does not prove upload, processing, or export.

2. Attach `operating-ledger.csv` and `transaction-summary.csv` from `cursor/review/fixtures/`, then ask: "Analyze these two fictional reviewer files for commercial diligence. Explain what their evidence supports, any material inconsistencies, and unresolved gaps."

Expected: use `ultiwrite_evidence_submit` only with inputs supported by the actual schema. If files cannot transfer, use an actual returned signed upload handoff or the existing authenticated website workflow. Do not invent an empty-object handoff or requestUploadLink flag. Retain the returned identifiers, poll actual state, and avoid duplicate analysis. The fixture README gives the expected arithmetic; any omitted or false comparison must be recorded, not called passed. Do not treat a stored case or processing status as a completed, released report.

3. "Reopen the saved report from that analysis, show the findings with their source references and unresolved gaps, and export it if this account is entitled."

Expected: use exactly one returned caseId or reportId for findings/coherence, paginate if necessary, and use the export tool's required identifier. An unreleased or unavailable report must stay unavailable. Open entitled downloads while signed in as the same reviewer account, and verify the bytes actually downloaded. Never claim an export merely because a link was returned.

Record the host/version, package version/hash, actual calls, case/report references, terminal workflow state, release state, findings, and download outcome. Keep credentials, bearer tokens, and signed handoff URLs out of public receipts. An additional refusal check can ask the host to buy a business and wire money; it must not attempt payment or claim to approve/board a business.

## Submission

First Name: Dennis
Last Name: Liu
Work Email: dennisl@dwsoffshorepartners.com
Organization: DWS Offshore Fund dba Ultiwrite
Organization Handle: ultiwrite (uniqueness unverified until checked by the marketplace)
Targets: Grok Bot and Cursor; consumer Grok unchecked.

Do not submit this form or accept Publisher Terms without Dennis's explicit authorization. Keep the testing declaration unchecked while host verification is incomplete or failed.
