# Implementation evidence and limits

Prepared 2026-11-01. This record identifies the sources used for implementation and the verification boundaries. It is not a live tenant test report.

## Official sources

- [Build an MCP plugin](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [Dynamic tool discovery](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-dynamic-tool-discovery)
- [OAuth configuration](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-oauth)
- [Dynamic client registration](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication-dynamic-client-registration)
- [Microsoft 365 Agents Toolkit source](https://github.com/OfficeDev/microsoft-365-agents-toolkit)
- [Public marketplace publishing](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish-plugin-publicly)
- [Direct MCP certification preview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-certification)

The CLI is pinned to `@microsoft/m365agentstoolkit-cli@1.1.18` and its `@microsoft/teamsfx-core@3.1.4` dependency is captured by the lockfile. Inspection of the official OAuth create driver confirmed that public PKCE configuration can omit the provider secret. The driver's scope parser splits the configured comma-separated string into individual scopes. The OAuth documentation requires `AnyApp` for this MCP path and retains the app ID field for driver validation.

The local validator reads these official schemas from the installed CLI package, so the source archive does not vendor or relicense Microsoft schema files:

| Artifact | Schema path in the pinned CLI |
| --- | --- |
| App manifest | `json-schemas/teams/v1.29/MicrosoftTeams.schema.json` |
| Declarative agent | `json-schemas/copilot/declarative-agent/v1.6/schema.json` |
| MCP plugin | `json-schemas/copilot/plugin/v2.4/schema.json` |
| Provisioning lifecycle | `resource/yaml-schema/v1.13/yaml.schema.json` |

## What local checks establish

The authored source fits the pinned schema versions; its references are consistent; dynamic discovery points to the canonical MCP endpoint; static public PKCE is configured; the approved mark has valid deterministic exports; and packaging rejects missing configuration and unsafe paths. Tests also verify response binding for public OAuth registration and that the source archive excludes local configuration.

The official CLI help was inspected for `provision --env`, `auth login m365`, and `validate --package-file --env`. These are real commands, not invented deployment wrappers. Source schema validation uses in-memory identifiers only. The resolved package command does not accept those schema-test identifiers.

A public read-only discovery run on 2026-11-01 confirmed the canonical resource, apex issuer, S256 PKCE, public client authentication (`none`), and both requested scopes. This check did not register a client, authenticate a user, or verify callback acceptance. In the restricted build environment the request required Node's configured HTTPS proxy support; no TLS checks were disabled.

## What remains to be established externally

The exact Teams callback must be live on the service, the publisher's actual Microsoft tenant must be provisioned, the resolved package must pass authenticated Microsoft validation, and the complete user journeys must run in each claimed host. Publisher verification, offer eligibility, submission review, and public availability must be confirmed separately. Direct MCP certification has additional authentication and tool-definition requirements described in `certification/README.md`.
