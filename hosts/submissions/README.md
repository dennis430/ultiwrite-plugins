# Directory and enterprise catalog submission packet

This packet prepares the source, listing answers and review procedure for existing Ultiwrite connector identities. It does not submit a listing, accept provider terms or establish provider approval. [profiles.json](profiles.json) is a repository review inventory, not an upstream manifest or registration request.

Use **Ultiwrite** as the product name and **DWS Offshore Fund** as publisher. Preserve the existing `ultiwrite` server/plugin identity and existing approved listing when updating. The separate Ultiwrite Forensics connector belongs to its own repository and endpoint; never replace one listing with the other.

## Shared listing fields

| Field | Prepared value / source |
| --- | --- |
| Product | Ultiwrite |
| Publisher | DWS Offshore Fund |
| Category | Asymmetric Diligence Engine; choose the nearest actual directory category while preserving this breadth |
| Short description | Ordinary commercial documents open a wider investigation across financial, identity, integrity, operational and external-context evidence. |
| Website | https://dwsoffshorepartners.com |
| Documentation | https://dwsoffshorepartners.com/docs |
| Privacy | https://dwsoffshorepartners.com/privacy |
| Terms | https://dwsoffshorepartners.com/terms |
| Support | https://dwsoffshorepartners.com/contact |
| Remote MCP | https://mcp.dwsoffshorepartners.com/mcp |
| Transport | Streamable HTTP; follow each host's actual config schema |
| Authentication | Customer sign-in, scoped OAuth, PKCE S256; follow live resource discovery |
| Scopes | `ultiwrite:read`; add `ultiwrite:evidence` for authorized submissions |
| Logo | Existing canonical opaque Uw PNG in the plugin's `assets/logo.png` |
| Public tool schemas | [catalog.json](../catalog.json), generated from canonical runtime public definitions |
| License | MIT for original connector files; hosted service and analytical implementation are separate |
| Package hashes | `release/INVENTORY.json`, `release/SHA256SUMS.txt` and `RELEASE_MANIFEST.json` |

Detailed positioning and descriptions are in root `POSITIONING.md`. Do not add an accuracy statistic, guaranteed finding, certificate, SLA, data region, processor or completion-time claim without actual evidence.

## Platform tailoring

| Platform | Submit/install source | Review emphasis and remaining external dependency |
| --- | --- | --- |
| OpenAI ChatGPT / Codex | Existing `chatgpt/` portable package; Codex [config](../configs/codex.toml) | Update the established listing. Keep onboarding at account connection, actual review cases and privacy links. Publisher console ownership and native approval remain external. |
| Anthropic Claude | Existing `claude/`, root Claude marketplace manifest | Retain connection-recovery workflow. Use an extracted plugin directory for CLI tests. Directory listing, enterprise enablement and customer OAuth are separate. |
| Cursor | Existing `cursor/`, root Cursor marketplace manifest | Preserve automatic skill discovery and MCP identity; test workspace trust, scope denial and reconnect. Provider catalog approval is separate. |
| Antigravity | [Native config](../configs/antigravity.json), [host guide](../README.md) | Use actual MCP manager and customer OAuth, not Google ADC. Source configuration is prepared; no universal marketplace ZIP or acceptance is claimed. |
| Grok web | [Host guide](../README.md) | Custom connector uses the remote service. Verify the customer in the actual host. A Grok model selected in another harness is a separate installation. |
| Grok Build | [Grok Build config](../configs/grok-build.toml) | Native CLI configuration and OAuth. Keep it distinct from the Bot dossier and X post dispatch. |
| Grok Bot | Existing `grokbot/` fields, OAuth, tools and testing dossier | Confirm the actual Bot onboarding contract, publisher access and account connection. Do not label a Build CLI check a Bot pass. |
| Meta Muse / Muse Code | [Verified official dossier and native setup](../muse.md) | Meta’s reviewed portal requires business verification, actual data-processing answers, secure credentials, a dedicated reviewer account/demo and per-tool approval. Muse Code independently supports native remote MCP/OAuth with `schema_version: 1` and `transport: streamable_http`. Exact callback and native acceptance remain unverified. |
| EmDash | [EmDash guide](../emdash.md) | Configure custom HTTP, sync only intended agents/machines, authenticate each native agent. Catalog contribution route and acceptance require confirmation. |
| MCP registry | Root `server.draft.json` | Proposed namespace remains unpublished. Verify current schema, publisher namespace ownership and remote endpoint before publishing. |
| Microsoft enterprise | [Copilot Studio dossier](../copilot-studio.md) | Tenant/client-specific registration, enterprise approval, reviewer credentials and current Microsoft requirements remain external. |
| Other compatible hosts | [Matrix](../matrix.json) and supplied configs | Match the actual transport/auth/account model; a model brand alone establishes no MCP host. |

Official sources and dated limitations remain in the host matrix. Prior releases' `SKIPPED_BY_USER` rows are historical. Current native-host acceptance is **NOT_RUN** until a real acceptance record exists. A deployment outage can leave live checks pending while local package checks and source review finish.

## Reviewer handoff

Provide the package or source revision, archive/hash, existing listing id, description, canonical logo, HTTPS endpoint, privacy/terms/support links, public tool catalog and [reviewer scenarios](reviewer-scenarios.md). Transfer review account access only through the provider's secure channel; do not put it in a public PR or packet.

The service owner must supply real answers for legal identity verification, authorized data processing, retention, subprocessors, incident contact, any requested DPA, reviewer account and demo. A blank external item is a dependency, not a permission to fabricate a value. Keep secret details out of `profiles.json`.

Use separate statuses: source prepared, local validation, owner submitted, provider review, approved listing, installed host acceptance and deployed backend revision. Record provider reference/date for any actual submission. Preserve rejected review feedback and the exact artifact revision so a corrected resubmission can be compared.

## Local preparation

```sh
node scripts/validate-public-plugins.mjs
node --test scripts/test/release.test.mjs
node scripts/pack-public-connectors.mjs
node scripts/pack-public-connectors.mjs --check
```

These checks validate structure, source parity, boundaries and artifact preservation. They do not submit anything or authenticate a customer in a third-party host. Before provider submission, complete the applicable external requirements and [installed acceptance](../enterprise/acceptance.md) where access allows.
