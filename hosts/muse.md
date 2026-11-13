# Meta Muse Connector Platform and Muse Code

Updated November 13, 2026 from current official sources. **Muse Connector Platform is a Meta product.** Meta's [September 24 developer recap](https://developers.meta.com/blog/meta-connect-recap/) links directly to [muse.ai/platform](https://muse.ai/platform). The [live submission portal](https://platform.muse.ai/) and [connector guidelines](https://platform.muse.ai/docs) describe its reviewed connector directory. Muse Code is Meta's separate coding agent with [documented native MCP and OAuth](https://dev.meta.ai/docs/muse-code/extending).

Product: **Ultiwrite**. Publisher: **DWS Offshore Fund**. Hosted MCP: `https://mcp.dwsoffshorepartners.com/mcp`. Website: https://dwsoffshorepartners.com. [Documentation](https://dwsoffshorepartners.com/docs), [privacy](https://dwsoffshorepartners.com/privacy), [terms](https://dwsoffshorepartners.com/terms), [support](https://dwsoffshorepartners.com/contact).

Source preparation is complete for this dossier. Provider submission/approval and authenticated customer acceptance remain **NOT_RUN / NOT_VERIFIED**. No legal terms have been accepted or external listing submitted by this release.

## Choose the Meta surface

| Surface | Integration and distribution |
| --- | --- |
| Muse's reviewed connector directory | Submit the service through the actual Meta portal. Meta reviews risk, each tool and end-to-end workflows before approval. Approved connectors are discoverable by the Muse agent and in Settings → Connectors. |
| Muse custom connector | The [official help page](https://www.meta.com/help/superintelligence/1687253048996149/) describes asking Muse to create a custom connector. Meta does not review custom connectors. This is separate from directory approval; do not claim that a custom connection is a reviewed listing. |
| Muse Code | Configure the coding agent's native remote MCP support and authorize this customer through its own OAuth flow. A working CLI connection does not establish consumer-directory approval. |
| A Meta model selected in another agent | Configure that actual agent. Model selection alone neither installs a connector nor transfers the customer's grant. |

## Native Muse Code configuration

The official [configuration reference](https://dev.meta.ai/docs/muse-code/configuration.md) places user settings at `~/.config/muse/settings.json` and requires `"schema_version": 1`. Merge this example with existing settings; do not replace unrelated servers or policies:

```json
{
  "schema_version": 1,
  "mcp_servers": {
    "ultiwrite": {
      "transport": "streamable_http",
      "url": "https://mcp.dwsoffshorepartners.com/mcp",
      "enabled": true,
      "mode": "optional"
    }
  }
}
```

`streamable_http` is Muse Code's documented transport spelling. Its default `mode` is `required`, which aborts the run if the server fails; this example selects `optional` so an unavailable connector produces a warning. Neither setting authorizes evidence submission.

Complete native customer authentication:

```sh
muse mcp login ultiwrite
# In the interactive session, inspect the connection with /mcp.
# To remove the local customer login:
muse mcp logout ultiwrite
```

The official guide describes OAuth 2.1 token management/refresh and dynamic client registration. `mcp_oauth_dynamic_client_registration: false` disables automatic client registration when an actual approved preconfigured client is required. Do not set it merely to bypass a failed callback. A model API key is separate from an Ultiwrite customer grant.

After connecting, call `ultiwrite_account_get` to verify the intended customer, then `ultiwrite_capabilities_get` for current scopes, eligibility and supported work. Start with `ultiwrite:read`; request `ultiwrite:evidence` only for authorized evidence workflows. Muse Code's permission mode may allow declared read-only tools without an approval prompt. Preserve the host's actual policy and obtain authorization for each requested investigation; never label a write as a read to avoid approval.

The docs establish native support and syntax. This release does not claim that the installed Muse Code version, requested callback, customer OAuth grant or an entire investigation has been tested. Complete the [acceptance matrix](enterprise/acceptance.md) in the actual intended installation.

## Official portal fields and review evidence

The [guidelines §5](https://platform.muse.ai/docs) identify the submission requirements below. Portal labels and additional intake can change; use the actual form and its secure credential instructions.

| Intake item | Ultiwrite preparation / required owner evidence |
| --- | --- |
| Connector overview | Ordinary commercial documents open a wider investigation across financial, identity, integrity, operational and external-context evidence. Describe the actual supported task, saved assessment and report delivery. State current account, approval, usage and region restrictions. |
| Business verification and terms | DWS Offshore Fund identity and the submitter's authority, with the real requested supporting documents. Supply authorized logo, privacy/product terms, support/security contacts and a maintenance developer. Acceptance of Meta terms remains an owner action. |
| Data-processing questionnaire | Identify each accessed data category, purpose, protection, recipient/processor, actual retention and deletion behavior. Answers must match the current service and selected workflow, including model processing. Do not copy the separate Forensics product's memory-only policy. |
| Integration credentials | The HTTPS MCP endpoint, OAuth setup, `ultiwrite:read` and optional `ultiwrite:evidence`, environment and actual approved client details. Transfer credentials only through the portal's secure mechanism. |
| Tool documentation | The generated [public catalog](catalog.json), setup, inputs/outputs, permissions, side effects, read/write classification, sensitive designation, saved status/recovery, errors and rate limits. |
| Dedicated test user and demo | A maintained controlled account that can exercise every submitted tool, with sign-in instructions, granted permissions, representative synthetic evidence and actual limits. Provide a real complete workflow/demo; a fabricated account or static package check is insufficient. |
| Transaction tests, if submitted | Explain how the real submitted transaction can be tested without charges. This package does not add purchase or financial money-movement tools. Disclose usage requirements before starting an investigation. |
| Review-status tracking | Read the actual portal status. Guidelines say status requests by individual message/email are not answered; no vendor outreach is part of this preparation. |

Meta's portal does **not** publish a universal OAuth callback in these guidelines. A previously accepted runtime URI, third-party example or model name is not official evidence of the callback for a new Meta client. Obtain the actual redirect URI and client registration mode from the real portal/host, register only that exact approved URI through the existing service process and verify it. This release makes no callback or runtime configuration change, invents no client secret and expands no redirect allowlist.

## Tool classification and consent

The official guidelines require a read-only OAuth option where possible; `ultiwrite:read` supplies that boundary. Use [catalog.json](catalog.json) for complete generated schemas. The following classification summarizes the current public registry:

| Tools | Proposed documented class | Side effects and authorization |
| --- | --- | --- |
| `ultiwrite_account_get`, `ultiwrite_capabilities_get`, `ultiwrite_cases_list`, `ultiwrite_case_status` | Read | Verify identity, discover support/usage and inspect saved state. They do not submit evidence or start an investigation. |
| `ultiwrite_coherence_get`, `ultiwrite_findings_get`, `ultiwrite_report_export` | Read | Read released, account-scoped findings/assessment and actual report handoff. Read permission does not remove retention or entitlement checks. |
| `ultiwrite_evidence_submit` | Write; disclose consequential/paid execution to the reviewer for sensitive designation | Sends authorized evidence and can start/continue saved investigation work under current entitlement. Requires read + evidence scopes, actual task authorization and honest saved-state/idempotency handling. |

The evidence tool includes both read/status behavior and writes. Meta's rule classifies a mixed tool as **Write**; do not present its entire surface as a read. Meta reviews classifications and sensitive designation. Its current portal tool-annotation UI is described as **coming soon**; include classifications in submitted documentation now rather than inventing a portal field.

Reads and ordinary writes default to Ask on first use in Muse's connector platform; the user may select Always allow where permitted. Sensitive writes require approval on every use and cannot be set to Always allow. If approved details change, obtain fresh approval. A connected account or prior approved task never authorizes unrelated evidence, fees or recipients. The connector cannot bypass these host controls.

## Completion, data use and security checklist

These requirements come from the current [official guidelines](https://platform.muse.ai/docs):

- Complete the core task within the approved scope, preserve progress across sign-in and correctly distinguish saved processing, partial findings, completed assessment and delivered report. After an uncertain outcome, check saved state before retrying to prevent duplicate work or charges.
- Show actual value beyond public-page links. For Ultiwrite, the useful result is the account-scoped evidence-backed assessment, unresolved questions and full report. A read-only connector can qualify when information itself is the outcome.
- Collect only required data. The guidelines prohibit secondary unrelated advertising/profiling, sensitive-characteristic inference and model training with connector data. Confirm the actual service's handling and applicable agreements before answering the processing questionnaire; these files are not a compliance attestation.
- Describe who receives evidence/results, actual retention and how data is deleted or made inaccessible when no longer necessary, access is revoked or deletion is requested. Keep customer account isolation and least privilege, encrypt transport and protect sensitive data at rest under the actual service arrangement.
- Keep credentials out of prompts, URLs, descriptions, responses, analytics and logs. Use secure sign-in and credential handoff. Stop access after revocation and test the real denial path.
- The guidelines specify notification to Meta within **48 hours** of a security incident involving user data, under the applicable Connector Platform Terms. The service owner must establish the actual incident contact and response procedure before submission.
- Financial data reads are permitted in the stated policy; new money movement and financial trade-order tools are not currently approved. This connector provides investigative information and no financial transfer/trading authority.

Review proceeds through **risk assessment → per-tool review → end-to-end QA**. Approval covers only approved tools. Featuring is a separate editorial decision and no approval, rank or traffic is guaranteed. Preserve the actual review record, submitted source/hash, deployment revision and native-host acceptance separately.

## Authoritative references

- [Meta's official Connect recap linking Muse Connector Platform](https://developers.meta.com/blog/meta-connect-recap/)
- [Submission portal](https://platform.muse.ai/)
- [Connector guidelines and submission requirements](https://platform.muse.ai/docs)
- [Connector Platform Terms](https://platform.muse.ai/terms)
- [Official customer connector help](https://www.meta.com/help/superintelligence/1687253048996149/)
- [Muse Code MCP and remote OAuth](https://dev.meta.ai/docs/muse-code/extending)
- [Muse Code settings schema and file](https://dev.meta.ai/docs/muse-code/configuration.md)
