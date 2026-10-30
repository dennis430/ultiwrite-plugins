# Ultiwrite for ChatGPT and Codex

Version 0.9.0. Publisher: DWS Offshore Fund. Portable package for the existing Ultiwrite plugin identity.

Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation.

The evidence you provide starts the inquiry. Ultiwrite connects financial, identity, document-integrity, operational and relevant external-context signals, follows contradictions and unexpected implications across them, and brings the results into a cohesive assessment with supporting evidence, confidence and open questions.

Use Ultiwrite to investigate business acquisitions, financing, property, counterparties, merchants, residual or ISO books and portfolios. The service determines which supported analyses apply. The plugin connects the user’s task to that shared engine and returns its saved findings.

## Connect and investigate

The portable `mcp.json` uses `https://mcp.dwsoffshorepartners.com/mcp` with Streamable HTTP. It retains the 0.7.2 parser-compatible configuration: only transport type and URL in the server entry, with OAuth handled through the service’s authentication challenge and discovery metadata. No credential or static OAuth client configuration is packaged.

Connect the intended Ultiwrite account and approve the permissions needed for the task. Account checks verify the connected identity; capability questions do not submit evidence. Authorized submissions use actual supported attachment objects or the returned secure upload handoff when the host cannot transfer them. Follow the saved case and its returned continuation. A stored submission, `processing`, `action_required`, partial coverage or a failed capability must remain explicit.

Saved cases and reports can be discovered together, including website reports without a case. Read a report with exactly one case or report identifier. Preserve the engine’s findings, supporting evidence, confidence, hypotheses and unresolved questions. Report and download links require the same account in a browser. This connection does not approve a transaction, create public report access or fetch PDF, Excel or ZIP binaries.

Account allowance, pricing, supported inputs and current limits come from the canonical service. This metadata revision changes no commercial entitlement or processing behavior.

## Package and verification

From the repository root, run `node scripts/pack-public-connectors.mjs` to build `release/ultiwrite-chatgpt-plugin-0.9.0.zip`. The archive contains one portable plugin with its manifest, MCP configuration, skill, icon, README and license. Add `--check` for source/archive parity.

Use the existing publisher identity when preparing an update. Source packaging does not establish portal upload, review, publication or an installed host version. Host selection evaluations for this metadata revision are **NOT RUN**; the repository’s discovery suite defines the prompts and expected action boundaries.

Website: https://dwsoffshorepartners.com
Docs: https://dwsoffshorepartners.com/docs/mcp
Privacy: https://dwsoffshorepartners.com/privacy
Support: https://dwsoffshorepartners.com/contact
