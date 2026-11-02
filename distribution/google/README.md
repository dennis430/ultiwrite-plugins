# Ultiwrite for Google Connected Apps

Prepared November 1, 2026. Channel package version 0.1.0. Published public plugin source is 0.9.1; this kit targets the prepared 0.9.2 evidence-handoff contract at canonical source pin `00682b0179824fcf182856713de5864b54b140c2`. This source pin does not establish runtime deployment or completed host validation.

**Route:** Google Connected Console → preview → review → Gemini and Search. Google's public launch announcement is dated October 28, 2026. Access is opening in phases. This package prepares the existing remote MCP; it does not register or publish a Google app. [Google launch](https://blog.google/innovation-and-ai/technology/developers-tools/connected-apps-one-place/)

## Dennis's account steps

1. [Apply for Connected Apps preview access](https://connected.google.com/console/help/?apply=). Use the business Google account that will own Ultiwrite.
2. Open [Google Connected Console](https://connected.google.com/), create the Ultiwrite connected app, and choose **MCP server**. An account administrator accepts the program agreement. Select a category whose required journeys Ultiwrite actually supports; category and connection type cannot later be changed in place.
3. Use `console-fields.json` as the copy/paste worksheet. It is an internal worksheet, not an importable Google manifest. Select both Gemini and Search where the console offers them; begin with English and the United States.
4. Enter `https://mcp.dwsoffshorepartners.com/mcp`. Download Google's domain token. Serve its exact JSON at `https://mcp.dwsoffshorepartners.com/.well-known/google-connected-apps`, returning 200 directly. The provided route overlay and static-file renderer support this step; they must be deployed on the **MCP hostname** before verification.
5. Choose user-delegated authorization. Use automatic DCR when accepted, or a dedicated preregistered client. Copy the exact app-specific callback URIs shown by Google and register those URIs with Ultiwrite. Do not paste wildcard callbacks into a client registration.
6. Authenticate the review/developer account, sync tools, add testers, and complete `reviewer-runbook.md`. Submit for review when the console configuration and actual host run pass; publishing is a separate action after approval.

The setup sequence and versioned tool snapshot behavior are documented in [registration and publishing](https://developers.google.com/connected-apps/gpc/perform-the-steps). Preview registration and account acceptance remain to be completed.

## Included implementation

| File | Purpose |
|---|---|
| `console-fields.json` | Completed listing fields, MCP/OAuth references, and recommended tool confirmation choices |
| `reviewer-runbook.md` | A concrete authorized evidence → saved assessment → export demonstration |
| `scripts/render-domain-verification.mjs` | Validates the real console token file and emits the required extensionless well-known document |
| `server-overlay/google-connected-apps-route.ts` | Next.js route that returns account-provided verification tokens without redirecting |
| `sources.json` | Official technical and enrollment sources |

## Domain verification implementation

For a static host, render the token document into the server's public tree:

```bash
node scripts/render-domain-verification.mjs --input /absolute/path/google-connected-apps.json --output /absolute/path/public/.well-known/google-connected-apps
```

For the Next.js host, apply the included route in the canonical server repository and set `GOOGLE_CONNECTED_APPS_VERIFICATION_TOKENS` to a JSON array containing the console-issued tokens. With no configured token the route returns 503; it never advertises a fabricated verification token. Ensure middleware and proxy routing let this path reach the route without an apex redirect. Do not add the route to the thin plugin package and assume it becomes hosted.

Google requires a direct extensionless verification URL and a 512×512 PNG/JPEG icon under 1 MB. Use the current approved gold Ultiwrite artwork, resized from the source asset if necessary. [Console prerequisites](https://developers.google.com/connected-apps/gpc/prerequisites)

## OAuth and host compatibility

Use `ultiwrite:read` for account and report reads and `ultiwrite:evidence` for evidence submission. Keep PKCE S256, exact redirect matching, token scoping and account isolation. The authorization server is discovered from the MCP host; the interactive authorize endpoint remains on the main Ultiwrite site. Google supports authorization-code PKCE and DCR/manual client configuration. [OAuth guide](https://developers.google.com/connected-apps/mcp/oauth)

The OAuth guide and newer console instructions differ on CIMD/DCR wording. Prefer the already available DCR route and verify it in Developer Mode. Google also describes persistent linking behavior; validate refresh and reconnect behavior for this client before changing the shared token implementation. Do not disable global rotation or weaken other hosts to satisfy a description in a guide.

Google supports explicit tool safety annotations and optional MCP Apps UI. The listing can use the existing text/results workflow; a custom UI is not a prerequisite to this preparation. [MCP developer guide](https://developers.google.com/connected-apps/mcp/)

## Remaining completion evidence

- Preview account and chosen console category.
- Console-issued domain token served from the MCP hostname.
- Exact Google app callback URIs registered and an actual Google authorization run.
- A dedicated reviewer account with synthetic evidence and sufficient allowance, supplied through Google's secure review process.
- Gemini tool-sync and evidence/report/export results. A JSON file passing local validation does not establish host acceptance.

Use the [troubleshooting guide](https://developers.google.com/connected-apps/gpc/troubleshooting) for discovery, redirect, token, or sync failures. Do not report this app as submitted, approved or live until those states are observed.
