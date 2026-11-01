# Ultiwrite MCP Registry submission

`server.json` is a prepared, unpublished domain-owned listing for the existing Ultiwrite remote MCP service. It is separate from the historical `server.draft.json` and from the VS Code extension identity.

## Identity

- Name: `com.dwsoffshorepartners/ultiwrite`
- Endpoint: `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp`
- Transport: Streamable HTTP
- Product: Ultiwrite — Asymmetric Diligence
- Legal publisher: DWS Offshore Fund, Inc.
- Ownership: prove control of `dwsoffshorepartners.com` with the official publisher's DNS or HTTP verification flow.

The metadata intentionally omits a server-source repository: this public repository contains connector packaging, while the hosted service is proprietary. Remote-only listings do not require an npm package. Credentials, publishing keys, DNS record values, and customer data are not part of this package.

## Finish publishing

Validate the official registry and portable Copilot schemas first:

```bash
npm ci --ignore-scripts
npm run check
```

The checker fetches the three versioned official schemas and prints their hashes. For a repeatable offline check, pass `npm run check -- --schemas /path/to/schemas` with the official files named `mcp-server.json`, `agent-plugin.json`, and `agent-mcp.json`. A schema/network error fails the check; it does not establish successful validation. This checker does not register a publisher or publish anything.

1. Install the official [`mcp-publisher`](https://github.com/modelcontextprotocol/registry/releases) CLI.
2. Follow the official [domain authentication instructions](https://modelcontextprotocol.io/registry/authentication) for `dwsoffshorepartners.com`. Generate and retain the private publishing key outside this repository; publish only the required public DNS/HTTP proof. No ownership proof has been installed by this change.
3. From this directory, validate the candidate with the installed CLI's `validate` command, then run `mcp-publisher publish` after the release is authorized.
4. Confirm the returned registry version and name using the official registry API. Record the publication result; the presence of this file is not publication.
5. Request inclusion in GitHub's curated MCP Registry according to [GitHub's publisher guidance](https://github.blog/ai-and-ml/generative-ai/how-to-find-install-and-manage-mcp-servers-with-the-github-mcp-registry/). Inclusion and a working client install are separate checks.

Do not publish the same endpoint under an alternative namespace as an experiment. Namespace ownership and the intended permanent identity must be settled before submission. Authentication to the Registry is separate from customers authenticating to the Ultiwrite service.

## Review before submission

Confirm public metadata and protected-resource discovery; verify a fresh OAuth connection and authorized end-to-end investigation on a dedicated test account. Check that listing descriptions match the current service and that support/privacy/terms links work. The account's current commercial terms come from `ultiwrite_capabilities_get`; no stale prices are embedded here.

Schema reference: [Publishing remote servers](https://modelcontextprotocol.io/registry/remote-servers).
