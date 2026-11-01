# Optional direct Microsoft MCP certification preparation

The primary deliverable in the parent directory is a declarative agent with an MCP action. This directory prepares a separate **direct MCP certification** route. It is not an installable or submission-complete package.

Microsoft's [certification preview guidance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-certification), reviewed 2026-11-01, specifies the **Apps and Agents for M365 and Copilot** offer and a verified publisher. It describes an `agentConnectors` descriptor, current tool definitions, public documentation, icons, and an Azure Key Vault authentication reference. That route does not currently support DCR. Its OAuth Key Vault configuration requires a provider secret. The old submission path's stated October 31, 2026 cutoff has passed.

Ultiwrite's current OAuth metadata advertises public clients with authentication method `none`. A valid static public PKCE configuration for the declarative agent does not establish support for the separate Key Vault certification route. Do not invent a secret, place an empty fake credential in a vault, or reuse the declarative agent's auth configuration ID as a vault URI. Resolve provider/host support with Microsoft and the service owner before preparing that authentication configuration.

## Prepared material

`manifest.template.json` supplies an `agentConnectors` draft using the official app 1.29 schema, whose connector definition includes AzureKeyVault. The primary source validator checks this template's schema shape with transient test values only. No runtime compatibility or certification acceptance is implied by that check. Confirm the schema version accepted by the selected certification offer at submission; Microsoft's current documentation sample uses 1.30.

`intro.md` supplies customer-facing feature and setup copy. The parent package supplies approved color and outline icons, publisher/legal/support copy, and reviewer scenarios. `tool-inventory.json` records the current eight public tool names and their purposes. It is deliberately labeled an inventory rather than an MCP tool schema.

## Required completion work

Obtain an authenticated current `tools/list` export from the service using an authorized publisher test account. Review its exact descriptions, input schemas, and tool annotations with the service owner. Produce the certification tool file in Microsoft's currently accepted format and include every referenced file in the final package. Do not construct argument schemas from this inventory or from natural-language examples.

Complete an approved provider authentication design for the Key Vault route, create the publisher-owned vault in the intended tenant, and grant the certification service the access required by Microsoft's current guide. Populate only actual provider values privately. Supply the vault URI as `CERTIFICATION_KEY_VAULT_URI`, and obtain the real `CERTIFICATION_APP_ID`. No tenant, vault, identity, or secret has been created by this source kit.

Finally, compile a separate package with `manifest.json`, the validated tool file, `intro.md`, and the approved icons; validate it against the accepted schema and test each included tool. Capture evaluation evidence and submit through the publisher's verified Partner Center account only after those gates pass. The parent build intentionally does not emit this incomplete certification ZIP.

Microsoft's guide also discusses future handling of MCP servers associated with existing M365 agents. Confirm the current treatment of the publisher's actual offer before creating a duplicate standalone submission.
