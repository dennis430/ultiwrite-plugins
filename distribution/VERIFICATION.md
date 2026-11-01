# Distribution preparation verification — 2026-11-01

## Executed locally

Command: `node scripts/verify-distribution.mjs` with Node.js 22.16.0 and PHP 8.4.24.

- JavaScript/TypeScript-execution tests: **76 passed, 0 failed, 0 skipped**.
- WordPress PHP syntax: passed.
- WordPress routing/URL functions: **11 checks passed**, using minimal WordPress stubs.
- Workspace, Chrome and MCP discovery JavaScript syntax: passed.
- Submission-pack generation: passed; **21 channel packs**.
- Deterministic generation: two independent output directories produced identical inventories and SHA-256 entries.
- Asset-preparation Python syntax: passed. Actual approved-logo resizing was not run locally because the binary logo was not available in this additions-only workspace.

Tests cover restricted API operations, credential/tenant boundaries, hostile identifiers, redirect refusal, safe errors, explicit side effects, input limits, mocked native adapter calls, Workspace action responses, generation contracts and Microsoft prerequisite checks. They are not live platform certification.

## Not established

Native n8n/Zapier/Antigravity/WordPress/Chrome/Workspace validation; authenticated host acceptance; a real customer evidence-to-report journey; publisher ownership; native install screenshots; directory approval; marketplace publication.

The preparation container could not download npm packages or clone the baseline repository. Native dependency resolution and platform checks remain required. The complete original public-package validator and source/archive-parity checks must run in the full GitHub checkout; they were not available in the local additions-only workspace. The original validator is preserved unchanged in `.github/validate-legacy-tree.mjs`.

## Reproducibility

The generated package inventory records individual paths, sizes and SHA-256 hashes. The full repository already contains the approved Ultiwrite logo; the new branch also references the same existing logo blob under `distribution/assets/logo.png`. The asset helper can derive host sizes from that logo or explicitly fetch and verify its pinned Git blob on a network-enabled machine. It does not invent a Microsoft outline or actual-host screenshots.

Run `VERIFY.cmd` on Windows, `sh VERIFY.sh` on a shell, or the Node command above. Generated directories go to `dist/distribution/`. For this dated verification receipt, use the accompanying logs; a subsequent run produces fresh `distribution/verification/RESULTS.json` and logs.

No merge, production deployment, marketplace submission or package publication was performed by the preparation scripts.
