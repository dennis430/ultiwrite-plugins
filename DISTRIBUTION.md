# Ultiwrite Microsoft distribution

Version 0.1.0 introduces a VS Code extension, a GitHub Copilot agent plugin, a Microsoft 365 Copilot agent project, and domain-owned MCP Registry metadata. These connect to the existing Ultiwrite service and preserve its account, entitlement, evidence, and report boundaries.

## Deliverables and status

| Deliverable | Location | Release boundary |
| --- | --- | --- |
| VS Code extension | `vscode/`; `release/ultiwrite-vscode-0.1.0.vsix` | Review installation candidate. Confirm the actual Marketplace publisher ID before submission. |
| GitHub Copilot plugin | `copilot/`; `release/ultiwrite-copilot-plugin-0.1.0.zip` | Portable Agent Plugins 1.0 MCP package. Repository marketplace at `.github/plugin/marketplace.json`. |
| Microsoft 365 Copilot agent | `microsoft365/`; `release/ultiwrite-m365-source-0.1.0.zip` | Complete source/provisioning project. Installable tenant package requires real Microsoft app/auth registration outputs. |
| Official MCP Registry | `registry/server.json` | Unpublished candidate `com.dwsoffshorepartners/ultiwrite`; requires domain proof and authorized publication. |
| Combined handoff | `release/Ultiwrite_Microsoft_Distribution_0.1.0.zip` | Contains the three artifacts, registry metadata, checksums, verification record, and this guide. |

See `release/MICROSOFT_VERIFICATION.json` (or `MICROSOFT_VERIFICATION.json` inside the combined handoff) for the exact checks actually performed and the boundaries still unverified. A successful build or local installation is not a signed-in customer investigation, Microsoft certification, or marketplace approval.

## Build all review packages locally

Node.js 22.8 or later, npm, and Git are required. From the repository root:

```bash
node scripts/build-microsoft-distribution.mjs
```

The command installs pinned development dependencies, runs focused tests and manifest checks, builds the VSIX and Microsoft source bundle, validates the portable manifests against the official schemas, checks the historical connector archives, and writes the combined handoff. It does not publish or provision anything. Add `--skip-install` after a successful `npm ci`; add `--schemas /path/to/schemas` for an offline official-schema check as described in `registry/README.md`.

GitHub Actions is not required. Local results and actual host results are recorded separately. Historical ChatGPT, Claude, Cursor, and Grok packages are retained.

## VS Code

Use **Extensions → Install from VSIX** and select the VSIX. The extension provides its Ultiwrite view, Connect/Reconnect/account switching, explicit selection of files to transfer, analysis status, saved reports, export links, and dashboard access. It also registers the service for use by compatible VS Code agents.

Before release, test a dedicated ordinary account: connect, confirm account identity, select synthetic evidence, choose Document Forensics explicitly, complete one analysis, retrieve the report, open exports, disconnect, and reconnect. Verify the second account cannot reuse the first account's case list or grant. A local file path is never substituted for file bytes.

Create or reuse a publisher at [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage). The proposed publisher ID is `ultiwrite`; its reservation is not established by this source tree. Build with the actual identifier before uploading. See `vscode/README.md` for package and publisher instructions. No Marketplace credentials are included.

## Microsoft 365 Copilot

The primary integration is a declarative agent backed by the existing MCP server. It uses a **statically registered public OAuth client with PKCE**, avoiding the confidential-client requirement of Microsoft's dynamic-registration flow.

The service must accept Microsoft's exact callback:

```text
https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect
```

The corresponding private-engine change is prepared separately. This source project does not deploy the service. Run its read-only preflight and review the backend's actual deployed compatibility before creating a client or provisioning the Microsoft registration.

From `microsoft365/`, follow its README to set up a local environment, register the public OAuth client once, sign into the Microsoft 365 tenant, provision through Agents Toolkit, and create the tenant app ZIP. The packaging command refuses missing or placeholder app/auth registration IDs. No source archive should be uploaded as an installable app package.

For public distribution, enroll DWS Offshore Fund, Inc. in Partner Center's **Microsoft 365 and Copilot** program and submit the tested supported agent package under **Apps and agents for Microsoft 365 and Copilot**. Include customer setup requirements and reviewer access through the private submission process. Test in each host advertised by the listing.

Direct Microsoft MCP server certification is a separate preview route with its own authentication and Azure Key Vault requirements. This primary agent project does not claim that certification or compatibility with its confidential-client requirements.

## GitHub Copilot and MCP discovery

The local repository marketplace has been prepared for Copilot. Review the candidate from a checkout:

```bash
copilot plugin marketplace add /absolute/path/to/ultiwrite-plugins
copilot plugin install ultiwrite@ultiwrite-copilot
```

After authorized merge, replace the local path with `dennis430/ultiwrite-plugins`. See `copilot/README.md` for connection and usage instructions. This creates a repository-distributed plugin; it does not claim inclusion in GitHub's curated MCP registry.

For the official MCP Registry, finish the domain-owned publisher setup described in `registry/README.md`, validate, publish after authorization, and confirm the actual public listing. Keep the publishing key outside the source tree. No credential or DNS proof is required to build these review packages.

## Commercial and publication boundaries

Public brand: **Ultiwrite**. Legal publisher: **DWS Offshore Fund, Inc.** Existing backend account permissions, allowances, paid investigative entitlements, and API-access controls remain authoritative. The client does not mint credits or grant API access. Current commercial terms come from the account/service; no prices are embedded in these public packages.

[Product](https://dwsoffshorepartners.com) · [MCP documentation](https://dwsoffshorepartners.com/docs/mcp) · [Support](https://dwsoffshorepartners.com/contact) · [Privacy](https://dwsoffshorepartners.com/privacy) · [Terms](https://dwsoffshorepartners.com/terms)
