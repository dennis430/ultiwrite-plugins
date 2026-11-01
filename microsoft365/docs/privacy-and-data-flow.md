# Privacy and data flow

This document describes this connector's behavior. The service's public [privacy policy](https://dwsoffshorepartners.com/privacy) and [terms](https://dwsoffshorepartners.com/terms) remain the governing service documents; this file does not introduce new retention, residency, deletion, or compliance commitments.

## Where data moves

The Microsoft host runs the declarative agent and calls Ultiwrite's HTTPS MCP endpoint on the user's behalf. Native OAuth sign-in and consent authorize access to the user's Ultiwrite account. The manifest references Microsoft's Enterprise token-store configuration and contains no password, bearer token, or provider credential. This package uses a public OAuth client protected by PKCE.

Requested scope `ultiwrite:read` supports account, case, report, and export-link reads. Scope `ultiwrite:evidence` supports evidence submission and continuation of an authorized case. The scopes do not add mail, calendar, Teams-message, Graph file, or administrator permissions to this package.

Report questions can send account-authorized case/report identifiers, pagination parameters, and tool arguments to Ultiwrite. The service returns account details, case status, saved findings, evidence references, decision-brief content, or links as appropriate. Returned report text becomes available to the Microsoft host in the user's conversation. The user should follow their organization's rules for the evidence they choose to discuss.

For new files, the agent requests an upload handoff and displays the exact signed link returned by the service. The user uploads evidence directly in the browser. This package has no implementation that reads a local file, a Copilot attachment, or a OneDrive reference and uploads its bytes. It does not claim that an attachment was transferred merely because it appears in the chat.

Report exports open through the service's returned links in a browser signed in to the same account. The agent does not download the export bytes or copy them into a second repository. Signed links should be treated as private and should not be included in support screenshots or public submission artifacts.

## Package and tooling

The source package contains manifest templates, instructions, icons, developer scripts, and documentation. Local setup saves public client and Microsoft configuration identifiers in an ignored environment directory. The source archive excludes that directory, dependencies, caches, and generated tenant packages. The release ZIP contains only resolved manifests and icons.

No custom analytics collector is included in this connector. Microsoft host behavior, Microsoft developer-tool telemetry, and the Ultiwrite service's own data practices are separate from this source code and are governed by their respective settings and policies. Avoid copying access tokens or private evidence into developer logs or issue reports.

## Access changes and support

To use another account, reconnect Ultiwrite through the host's connection controls and select the intended account during sign-in. To remove access, disconnect the Ultiwrite connection, remove the agent as appropriate for the tenant, and use the service's available account access controls or support channel for any remaining account-side revocation request. Removing a connector does not itself establish deletion of service records.

For privacy, retention, deletion, residency, or data-processing questions, contact [Ultiwrite support](https://dwsoffshorepartners.com/contact) and refer to the current privacy policy. Do not infer those answers from the connector's manifest.
