# Ultiwrite — Asymmetric Diligence

Investigate authorized business evidence from VS Code and connect GitHub Copilot to your Ultiwrite account.

Ultiwrite expands financial and operating evidence, company records, digital footprints and document integrity signals into a connected investigation. Use the extension to transfer selected files, follow the existing investigation, and open the report saved by Ultiwrite.

**Review candidate 0.1.0.** The proposed Marketplace publisher identifier is `ultiwrite`. A publisher account, final Marketplace publication and a live authenticated customer acceptance run remain separate release steps.

## Start an investigation

1. Install the VSIX using **Extensions → … → Install from VSIX…**.
2. Open **Ultiwrite** in the Activity Bar and select **Connect / Reconnect**.
3. Complete Ultiwrite's browser sign-in and consent. The extension requests permission to read your account's cases/reports and to submit evidence.
4. Run **Ultiwrite: Analyze Selected Files** or right-click selected local files in Explorer. The file picker also works without opening a project.
5. Choose whether to include optional Document Forensics. Review the account and selected filenames, then select **Upload and analyze**.
6. The extension transfers the actual file bytes, starts the investigation and follows the returned case. It advances only continuations for that same case; it never resubmits the original files to retry processing.
7. Select **Open report** when a saved report becomes available, or use **Cases and Reports** later.

Your current Ultiwrite account allowance, limits and entitlements apply. An account is required; additional service purchases may be required. The extension does not set prices, collect payments or grant partner API access. Account purchases and settings are handled in the [Ultiwrite dashboard](https://dwsoffshorepartners.com/dashboard).

Cancelling progress stops the extension's active requests, transfers and status checks. It does not cancel work already accepted by Ultiwrite. If a transfer or final request fails, check existing cases before uploading the same evidence again. Status monitoring stops after 15 minutes and can be continued through **Check Analysis Status**.

## Use GitHub Copilot

The extension contributes an **Ultiwrite** remote MCP server through VS Code's supported MCP server provider API. Review VS Code's server trust/tool approval prompts. Choose Ultiwrite's tools in your Copilot session when necessary.

Example prompts:

- “Use Ultiwrite to show my existing cases and saved reports.”
- “Read the saved Ultiwrite Decision Brief for this case and explain the evidence behind its findings.”
- “Check whether my Ultiwrite investigation has finished and give me the saved report link.”

For files on your computer, use **Analyze Selected Files**. A path pasted into chat does not transfer the original file bytes. If Copilot returns an authenticated browser upload handoff, use that exact handoff instead; don't also upload the same files through the extension.

The remote service is [Ultiwrite's canonical MCP endpoint](https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp). The engine runs on Ultiwrite's infrastructure.

### Candidate limitation: renewal during a Copilot call

The extension's commands and native MCP connection share one encrypted account session. When that session's access token renews, the extension updates the in-memory MCP definition. VS Code may restart the MCP connection when those headers change, which can interrupt a long Copilot tool call. If that happens, use **Browse Cases and Reports** or **Check Analysis Status** to recover the existing case before submitting files again. Long-running Copilot analysis across token renewal remains a live host acceptance check for this candidate.

## Connection recovery and another account

Use **Reconnect** if sign-in was dismissed, timed out or expired. Every attempt opens a fresh authorization flow; reinstallation is not required.

Use **Connect Another Account**, then select **Use a different account** on Ultiwrite's consent page. This replaces the connection in this VS Code profile. Recent case selection is cleared when you disconnect. Separate VS Code profiles can maintain separate connections.

**Account and Permissions** shows the connected account and granted scopes:

| Permission | What it allows |
| --- | --- |
| `ultiwrite:read` | Read the account identity, capabilities, cases and saved reports. |
| `ultiwrite:evidence` | Submit authorized files and continue existing investigations under the account's allowance. |

## Privacy and security

- Only files you explicitly select and confirm are uploaded. No workspace scan, indexing, automatic document discovery or background file upload occurs.
- OAuth uses authorization-code flow with S256 PKCE, a random state, an ephemeral loopback callback and the canonical resource identifier. Tokens are stored only in VS Code **SecretStorage**, not in project files or ordinary extension settings.
- The extension supplies a token to VS Code's MCP provider in memory. Object-storage transfers use only the server-issued signed upload URLs; OAuth tokens are never sent to storage hosts.
- Upload plans are checked against the selected filenames and sizes. Changed files, partial transfers and mismatched receipts prevent final submission.
- Report links require the browser to be signed in to the same Ultiwrite account. The extension opens the returned service links; it does not download reports using an MCP bearer token.
- The extension does not add telemetry. Ultiwrite receives the account requests, selected evidence and required request metadata described in its [privacy policy](https://dwsoffshorepartners.com/privacy).
- Local commands run in the UI extension host. The package supports desktop VS Code and local files. It does not upload remote filesystem URIs or run in restricted/untrusted workspaces or the browser version of VS Code.

[Terms](https://dwsoffshorepartners.com/terms) · [Support](https://dwsoffshorepartners.com/contact) · [MCP setup](https://dwsoffshorepartners.com/docs/mcp)

## Build and test

Node.js 22 or later is required for the packaging toolchain. The extension has no third-party runtime dependencies.

```bash
npm ci --ignore-scripts
npm test
npm run package
```

The output is `dist/ultiwrite-0.1.0.vsix`. The locked build compiles against stable VS Code 1.102 APIs. The tests run isolated loopback servers and synthetic evidence, exercising actual single/multipart byte transfer, OAuth callbacks/PKCE, token refresh, cancellation, origin restrictions, file-change detection and prevention of partial final submissions.

For an actual VS Code extension-host smoke test:

```bash
npm run test:host
```

This downloads an official VS Code build and requires a desktop display or Xvfb on Linux. It checks real extension activation and command registration without a customer account. It is separate from a live OAuth/upload/report acceptance run.

## Marketplace submission

1. Create or confirm the publisher in [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage). This package proposes `ultiwrite`; confirm that you own that publisher before publication. If a different ID is selected, change `publisher` in `package.json` and rebuild. The provider ID stays `ultiwrite.mcp`.
2. Run the local tests and build. Install the exact resulting VSIX in a clean VS Code profile.
3. Complete the live sign-in, file upload, continuation, saved report and reconnect checks in [TESTING.md](TESTING.md). Use authorized synthetic files and record the actual result.
4. Upload the exact VSIX through the publisher management page. Use the README, existing PNG logo, website, privacy, terms and support links in this package.
5. Keep the extension free to install and disclose the account/service-purchase requirements. Ultiwrite's backend remains the authority for offers and usage.

Publishing is a separate authorized release operation. No Marketplace submission, publisher verification, production change or live customer acceptance is performed by the build command. This package does not rely on GitHub Actions.

Publisher: **DWS Offshore Fund, Inc.** Product: **Ultiwrite**. The MIT license covers the original connector code; the analytical service remains proprietary.
