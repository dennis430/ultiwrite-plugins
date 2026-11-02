# Preparation evidence

Prepared November 1, 2026 (America/Los_Angeles). This record describes source and public-endpoint checks. It is not a marketplace approval or authenticated user-journey receipt.

## Source basis

- Current public repository baseline: `63adef9ae6ae0bacf3cdc6a59c20a5513831a1ac` (0.9.3 branding release). The preparation began at 0.9.1 and was reconciled with this newer release before handoff.
- Canonical 0.9.2 Cursor workflow source: `00682b0179824fcf182856713de5864b54b140c2`.
- The two updated Cursor workflow files exactly match the canonical 0.9.2 source. The candidate version is 0.9.4, and the current 0.9.3 artwork/UI metadata is preserved.
- New host preparation uses that 0.9.2 contract. The current live authenticated runtime and seven host journeys were not exercised.

## Public endpoint observations

| Check | Observed result |
| --- | --- |
| Clean-host authorization server discovery | HTTP 200; issuer, endpoints, S256, two scopes and public-client method matched the profile |
| Clean-host protected resource discovery | HTTP 200; resource matched the clean MCP URL |
| Anonymous MCP initialize | HTTP 401; no access granted without OAuth |
| Anonymous MCP tools/list | HTTP 401; this did not reveal or validate an authenticated tool catalog |
| Official registry search for Ultiwrite | HTTP 200; zero entries at preparation time |

The eight tool names and argument workflows come from the current canonical package contract. No files were submitted and no analysis was started for these checks.

## Local validation

Source validators check JSON, local links, exact channel scope, endpoint agreement, registry constraints, decoded Cursor install URI, Microsoft runtime and handoff recovery. Microsoft's builder separately checks three official schema snapshots, manifest cross-references and icon requirements. Google helper checks use local synthetic token/callback inputs. Salesforce's incomplete source is required to fail until real organization metadata is retrieved.

| Command or check | Result |
| --- | --- |
| `node scripts/validate-public-plugins.mjs` | PASS: public source boundary, manifests, secrets scan and package identities |
| `node scripts/validate-distribution.mjs` | PASS: seven channels, JSON, local links, endpoint and package invariants |
| `node --test scripts/test/release.test.mjs` | PASS: five packaging regressions, using normal subprocess execution |
| `python3 distribution/microsoft/scripts/build_package.py` | PASS: three official schemas and package structure at 0.9.4; template mode only |
| Official registry schema, both manifests | PASS: Draft 7 validation against the retrieved 2025-12-11 schema; descriptions are 96 characters |
| `node scripts/pack-public-connectors.mjs --check` | PASS: current archives match source; historical archives preserved |
| `python3 scripts/pack-distribution.py` | PASS: archive CRC and every included byte compared with source |

The restricted execution wrapper dropped child-process stdout in the regression harness. Running the same unchanged assertions with normal subprocess execution passed all five tests. This was an execution-environment issue, not a relaxed test expectation. The completed command results are also recorded in the preparation pull request. The handoff includes a SHA-256 inventory.

## Remaining proof

| Channel | Not established by this preparation |
| --- | --- |
| Registry | Namespace ownership authentication or publication |
| Google | Preview access, real verification deployment, exact callback rollout or Google OAuth journey |
| Meta | Signed-in form/schema acceptance, current callback confirmation or actual Muse journey |
| Cursor | Candidate release to main, installed 0.9.4 journey or Marketplace review |
| Microsoft | Real app/auth-config provisioning, sideloaded package journey, screenshots or store review |
| Salesforce | Public-client token exchange in an org, actual retrieved metadata, managed package or security review |
| AWS | Seller enrollment, selected commercial model, buyer fulfillment/entitlement/billing integration or Marketplace review |

AWS account signup alone does not finish its service integration. Salesforce's authenticated host compatibility must be established before calling its metadata project installable. Google requires a small channel-specific service rollout after console-issued values are known.
