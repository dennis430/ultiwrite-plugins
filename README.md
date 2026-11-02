# Ultiwrite plugins

Ultiwrite is an asymmetric diligence engine that turns ordinary documents into a much wider investigation. It connects financial, identity, document-integrity, operational and external-context evidence across acquisitions, financing, counterparties, property and portfolios through your connected account. Publisher: DWS Offshore Fund. Product: Ultiwrite.

This repository distributes thin public connectors and workflow instructions maintained in the canonical private application packaging source. The proprietary analytical service and customer records are not included. The MIT license applies to the original connector files; see LICENSE and NOTICE.

## Current packages

| Directory | Version | Contents |
| --- | --- | --- |
| `chatgpt/` | 0.9.1 | Portable ChatGPT/Codex plugin; OAuth, account-first onboarding and five skills |
| `claude/` | 0.9.1 | Claude plugin; OAuth, connection recovery and five skills; enabled by default on a new installation |
| `cursor/` | 0.9.1 | Cursor plugin; remote MCP, complete skill-directory discovery and five skills |
| `grokbot/` | 0.8.0 | Grok Bot submission dossier with shared account and permission contracts |
| `client/` | 0.7.1 | Unchanged local `ultiwrite-mcp` wrapper; npm publication is not claimed |

New ChatGPT/Codex, Claude, Cursor and Grok packages use https://mcp.dwsoffshorepartners.com/mcp. The original https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp route remains available for existing connections. Both URLs reach the same Ultiwrite account service. No API key belongs in any plugin configuration.

## Accounts, permissions and feature controls

| Control | What the package provides | What the host/user controls |
| --- | --- | --- |
| Account identity | Protected `ultiwrite_account_get` profile and OAuth connection | Selected connection and native account label |
| Connect/reconnect | Account-first onboarding and recovery workflow | Native Connect/Reconnect prompt |
| Additional accounts | Fresh authorization and identity verification | Whether simultaneous connected accounts are supported |
| Permissions | Read/evidence scopes and server tool annotations | Approval mode, selected consent and workspace policy |
| Features | Five separate skills with automatic invocation enabled | Per-skill switches and existing disabled choices |
| Listing details | Current logo, version, publisher, website, privacy, terms and support | Directory review and installed version |

The five workflows explain capabilities, connect/select accounts, submit evidence, read reports and plan follow-up diligence. ChatGPT retains the established `ultiwrite-read` primary skill identity; Claude and Cursor retain `ultiwrite`. New installs permit automatic workflow invocation, with host policies and user overrides preserved. Availability does not preapprove tool use, start an investigation, select a paid add-on or grant account allowance.

## Downloads

This commit prepares the combined 0.9.1 release. The links below resolve after these archives reach `main`; website deployment and directory updates must be verified separately. Packaging and discovery evaluation status are recorded in `release/PLUGIN_0.9.1_VERIFICATION.json`.

<!-- CURRENT_DOWNLOADS_START -->
| Archive | SHA-256 |
| --- | --- |
| [`ultiwrite-chatgpt-plugin-0.9.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-chatgpt-plugin-0.9.1.zip) | `4f3210b56f1a6ccdbaaeca72aaf9c87f767cbc55125a6ca6718122dfe74cec27` |
| [`ultiwrite-cursor-plugin-0.9.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/ultiwrite-cursor-plugin-0.9.1.zip) | `f41346af459431fd1f174111b5da3b361c54ee660575ca008a65d51bf1e556cc` |
| [`Ultiwrite_Claude_Plugin_v0.9.1.zip`](https://github.com/dennis430/ultiwrite-plugins/raw/main/release/Ultiwrite_Claude_Plugin_v0.9.1.zip) | `a509a59979d21f9a63fa1e74dcdc1a1057f8af64f8f0efc6fcf25af2f756f9d6` |
<!-- CURRENT_DOWNLOADS_END -->

Historical ZIPs remain unchanged so existing links keep working. `release/SHA256SUMS.txt` and `release/INVENTORY.json` record every current and historical archive. `RELEASE_MANIFEST.json` records source-file hashes.

## Install and connect

- **ChatGPT/Codex:** update the existing Ultiwrite plugin/listing with the ChatGPT package. Preserve its identity. Open its connection settings and choose Connect; use Connect another account where available.
- **Claude web/Desktop/Cowork:** add the listed Ultiwrite plugin or upload the current Claude ZIP through Plugins > Add > Upload plugin. For recovery, use Plugins > Ultiwrite > Connectors > Connect. Older interfaces use Customize > Connectors.
- **Claude Code:** `/plugin marketplace add dennis430/ultiwrite-plugins`, then `/plugin install ultiwrite@ultiwrite`. Use `/mcp` > Ultiwrite > Authenticate to reconnect.
- **Cursor:** install the Cursor package or add the remote MCP URL in its MCP settings. The root marketplace entry points to `cursor/`; all five skills are automatically discovered.
- **Grok Bot:** use the separate dossier and the platform's supported MCP registration. A consumer Grok integration is not claimed.

Ask “Connect Ultiwrite and confirm which account is connected.” If the sign-in window closes, reopen the host's persistent connection control. To switch, use the host account selector or start fresh authorization and choose **Use a different account** in Ultiwrite's consent screen. Verify the new identity before continuing. Signing in on the website alone does not complete a host's OAuth grant.

## Validation and release

```sh
node scripts/validate-public-plugins.mjs
node --test scripts/test/release.test.mjs
node scripts/pack-public-connectors.mjs
node scripts/pack-public-connectors.mjs --check
```

The packer includes every source skill and its UI metadata, round-trips each current archive against its source and preserves historical archives. Built source is not directory approval, installed-client verification or server deployment. Claude's directory may track the configured GitHub branch, but its scan/review process determines when an update reaches users. ChatGPT and Cursor publication require their own current release workflows. `server.draft.json` remains unpublished registry metadata.

See [POSITIONING.md](POSITIONING.md) for the maintained commercial description and [evals/README.md](evals/README.md) for the 32-prompt discovery protocol. Host selection results are not claimed from source checks.

## Source ownership and compatibility

Canonical editable package paths are `packaging/chatgpt-plugin`, `packaging/claude-plugin`, `packaging/cursor-plugin` and `packaging/grokbot` in the private application repository. This public tree is their distribution surface. Keep those sources synchronized before exporting a new public release. Historical private handoff exports and website ZIPs remain labeled snapshots; they are not the current source.

The private exporter writes only to a new or empty directory outside the private repository. Run `node scripts/export-plugin-distribution.mjs --out <new-directory>` there, then run `node scripts/pack-public-connectors.mjs` in that exported tree. Integrate the reviewed files into this existing distribution repository while retaining its historical archives. The older `pack-mcp-release.mjs` website builder and private release handoff snapshots are outside this release.

The ChatGPT portable connection retains the canonical parser-compatible `type`/`url`-only entry and uses OAuth discovery. Native permission choices and feature defaults come from the service and supported host metadata, not undocumented or incompatible per-server fields.

## Supported host contracts

- [OpenAI account profiles and OAuth](https://developers.openai.com/plugins/build/auth)
- [OpenAI plugin packaging and onboarding skills](https://developers.openai.com/plugins/build/plugins)
- [Skill display metadata and automatic invocation](https://learn.chatgpt.com/docs/build-skills)
- [Cursor plugin skill discovery](https://cursor.com/docs/reference/plugins)
- [Claude default enablement](https://code.claude.com/docs/en/plugins-reference#defaultenabled)

Website: https://dwsoffshorepartners.com · Setup: https://dwsoffshorepartners.com/docs/mcp · Privacy: https://dwsoffshorepartners.com/privacy · Terms: https://dwsoffshorepartners.com/terms · Support: https://dwsoffshorepartners.com/contact
