# Ultiwrite

## Ordinary documents. A much wider investigation.

**Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation.**

Your documents tell a story. Ultiwrite investigates whether it’s true—and what else the evidence reveals.

Start with the materials you already have: statements, applications, financials, property documents, portfolio schedules or a mixed evidence package. Ultiwrite investigates businesses, people, assets and relationships, connecting the documents with company records, digital footprints and relevant external evidence. It follows financial, identity, integrity and operational signals to expose risk, reconstruct economics and identify opportunities. The assessment brings cross-domain contradictions, corroboration and unexpected implications together with supporting evidence, confidence, unresolved questions and next steps.

The submitted package establishes the starting point. The investigative scope follows the evidence.

## What the investigation connects

| Domain | Investigative questions |
| --- | --- |
| Financial and economic evidence | Do the figures agree across records? Do the reported economics and operating patterns hold together? |
| Identity and relationships | Do names, entities, ownership details and related records describe the same parties? Which relationships affect the reading? |
| Document integrity and provenance | What do the documents’ structure, history and integrity indicators imply about the evidence being relied on? |
| Operations and external context | Does relevant operating context or independently obtained evidence support or challenge the submitted account? |
| Cross-domain synthesis | What changes when these signals are considered together? What is supported, inferred, contradicted or still unresolved? |

Acquisitions, financing, property, counterparty reviews, merchants, residual or ISO books and portfolios are applications of the same engine. Ultiwrite determines which supported analyses apply to each package. Its reports make the evidence and remaining uncertainty visible; a signal is interpreted in context.

## Ask in your own words

- “I’m buying this business. Check what supports the seller’s claims, what conflicts, and what else the documents reveal.”
- “Do these bank statements and processing records support the revenue figures?”
- “Investigate this property package across the financials, parties and supporting evidence.”
- “Which relationships, inconsistencies and unresolved questions in this portfolio deserve a closer look?”
- “Show my latest Ultiwrite report and explain its evidence, confidence and next steps.”

Connect the account you intend to use and authorize evidence submission when you want an analysis. The plugin can submit supported host attachments or return a secure upload handoff, follow the saved workflow, and retrieve authorized reports. A processing case remains in progress until its report is available.

## Use Ultiwrite

Website: https://dwsoffshorepartners.com
Setup guide: https://dwsoffshorepartners.com/docs/mcp
Privacy: https://dwsoffshorepartners.com/privacy
Terms: https://dwsoffshorepartners.com/terms
Support: https://dwsoffshorepartners.com/contact

| Source | Version | Interface |
| --- | --- | --- |
| `claude/` | 0.9.0 | Claude remote MCP plus five skills for connection recovery, evidence submission, report reading and follow-up. |
| `chatgpt/` | 0.9.0 | ChatGPT/Codex portable package for the existing Ultiwrite identity. Includes the current portable MCP configuration. |
| `cursor/` | 0.9.0 | Cursor remote MCP package and evidence investigation skill. |
| `grokbot/` | 0.9.0 | Grok Bot submission dossier; host evaluation remains `NOT_RUN`. |
| `client/` | 0.9.0 | Local `ultiwrite-mcp` wrapper; npm publication is a separate release. |

ChatGPT and Claude use `https://mcp.dwsoffshorepartners.com/mcp`. Existing Cursor, Grok Bot and client configurations retain `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`. Both public endpoints reach the same Ultiwrite service and account.

### Current source archives

| Archive | SHA-256 |
| --- | --- |
| [ChatGPT/Codex 0.9.0](release/ultiwrite-chatgpt-plugin-0.9.0.zip) | `633906c6c8cc7d673518714fa9fde2fed7a54feace3aa5bf6607b8091cdec483` |
| [Claude 0.9.0](release/Ultiwrite_Claude_Plugin_v0.9.0.zip) | `03651e6ba207224b895c384b07bb81c6d4be3a2493db594ca29efd511a933472` |
| [Cursor 0.9.0](release/ultiwrite-cursor-plugin-0.9.0.zip) | `be750b8ec849b695fbd8752852720644e0036b25b1d95ba2debc8711a6081661` |

Historical archives remain unchanged under `release/`. [SHA256SUMS.txt](release/SHA256SUMS.txt) and [INVENTORY.json](release/INVENTORY.json) record every retained archive. Run `node scripts/pack-public-connectors.mjs` to rebuild the current packages or add `--check` to verify source/archive parity.

### Claude setup and connection recovery

For Claude Code, add `/plugin marketplace add dennis430/ultiwrite-plugins`, then `/plugin install ultiwrite@ultiwrite`. For supported Claude plugin upload surfaces, use `Ultiwrite_Claude_Plugin_v0.9.0.zip`. See [Claude setup](claude/README.md) for the current package workflow.

Ask “Connect Ultiwrite and confirm which account is connected.” If the sign-in window closes, ask “Reconnect Ultiwrite” or open **Plugins > Ultiwrite > Connectors** and select **Connect**. The older interface uses **Customize > Connectors > Ultiwrite**; Claude Code uses **`/mcp` > Ultiwrite > Authenticate**. A new authorization can use **Use a different account** on Ultiwrite’s consent screen. See [connection recovery](claude/README.md#connect-again-or-use-a-different-account).

Claude’s marketplace entry points to `./claude`; Cursor’s points to `cursor`. The Claude directory can scan its configured repository branch. Directory review, publication and installed-client versions are verified separately from repository availability. `server.draft.json` remains unpublished MCP Registry preparation. This source revision makes no claim of new marketplace submission, npm publication or completed host evaluation.

## Source and commercial consistency

[POSITIONING.md](POSITIONING.md) is the canonical reference for public descriptions, capability copy, investor materials, customer outreach, broker outreach and partner communications. [The discovery suite](evals/README.md) covers ordinary customer language and action boundaries; actual host selection evaluations for this revision are **NOT RUN**.

Product: **Ultiwrite**. Publisher: **DWS Offshore Fund**.

This repository contains thin connector packages and their public documentation. The analytical service remains proprietary; private implementation and customer records are excluded. The MIT license covers the original connector code. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
