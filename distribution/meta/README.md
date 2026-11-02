# Ultiwrite for Meta Muse

Prepared November 1, 2026. Channel package version 0.1.0. Published public plugin source is 0.9.1; this kit targets the prepared 0.9.2 evidence-handoff contract at canonical source pin `00682b0179824fcf182856713de5864b54b140c2`. This source pin does not establish runtime deployment or completed host validation.

**A public submission route exists.** The [Muse Connector Platform](https://platform.muse.ai/) offers connector submissions, review and directory placement. The platform is linked directly from [Meta's Muse for Small Business announcement](https://about.fb.com/news/2026/09/introducing-muse-small-business/). Acceptance is reviewed; directory placement is not automatic.

## Dennis's account steps

1. Open [Submit a connector](https://platform.muse.ai/submission). Sign in or create the requested platform account. The observed logged-out route is [platform sign-in](https://platform.muse.ai/login?return_to=%2Fsubmission).
2. Use `submission-copy.md` and `connection-profile.json` for product, developer, endpoint, OAuth and review details. The profile is our handoff format, not an official Muse import schema.
3. Upload the existing approved gold Ultiwrite logo in the sizes requested by the signed-in form. Use only actual host screenshots and a completed synthetic demonstration when media is requested.
4. Complete the signed-in form's technical requirements and the sequence in `reviewer-runbook.md`. Any Meta-generated redirect URI or client identifier must be registered before claiming authentication compatibility.
5. Submit the completed connector for Meta review. Complete any partner follow-up and publish only after the review and required acceptance steps.

## What is prepared

- Product positioning, user journeys and proposed listing text.
- Exact existing remote MCP endpoint and OAuth discovery references.
- Read/evidence permission explanations and current tool catalog.
- Review demonstration and end-to-end acceptance record requirements.

## What still depends on the platform account

The public page exposes the submission route and review process, but not a complete signed-in submission schema or a public Muse connector package specification. No fabricated `muse-manifest.json` or unverified callback URI is included. The signed-in form must establish required integration format, media dimensions, callback addresses, test-account delivery and any partner terms.

Meta also supports custom connectors for individual users. Those are separate from approved directory distribution; a personal custom connector is not proof of a published listing. See [Meta's connector help](https://www.meta.com/help/superintelligence/1687253048996149/).

The existing MCP should be the first proposed integration. If Meta requests a different protocol, confirm it from the platform specification before adding an adapter. The package does not claim that Meta has accepted MCP compatibility or approved Ultiwrite.
