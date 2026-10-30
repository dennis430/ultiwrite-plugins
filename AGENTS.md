# Working on Ultiwrite plugins

For public copy, plugin metadata, skill descriptions, capability descriptions, commercial materials or outreach, read [POSITIONING.md](POSITIONING.md) first. Preserve Ultiwrite’s cross-domain asymmetric diligence positioning: ordinary documents start a wider investigation whose evidence is reconciled into a cohesive assessment.

Keep the existing plugin identities, account isolation, OAuth flow, permissions, real hosted tool names, evidence-consent boundaries and reporting semantics. Preserve Claude’s connection-recovery skill. Use the canonical hosted engine source to resolve contract conflicts; this repository is the thin distribution and must not contain private engine implementation or customer data.

When package source changes, increment its version, rebuild the current archives and refresh the inventories. Preserve historical archives byte-for-byte. Run `node scripts/validate-public-plugins.mjs` and `node scripts/pack-public-connectors.mjs --check` before proposing publication. Keep `evals/discovery-prompts.json` aligned with actual supported workflows and label host-selection results honestly; structural checks are not host evaluations.

Source preparation does not itself authorize deployment, marketplace submission or release. Preserve the user’s current instructions and existing release process.
