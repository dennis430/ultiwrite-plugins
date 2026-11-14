# Hosted clients for Ultiwrite

Updated November 13, 2026. Host bundle 0.13.0. These instructions use official documentation and published client source. Current authenticated host acceptance is `NOT_RUN`; historical `SKIPPED_BY_USER` evidence remains dated. A documented configuration does not prove an installed connection.

Connect clients to **https://mcp.dwsoffshorepartners.com/mcp**. Use Ultiwrite’s existing account sign-in and approve a separate scoped OAuth grant for the client. Begin with `ultiwrite:read`; add `ultiwrite:evidence` only for authorized evidence submission or explicit audited case dispositions. Check the connected identity with `ultiwrite_account_get` before private work. The host’s account, model API credentials and Ultiwrite customer grant are different credentials.

## MCPJam SaaS

1. Open [app.mcpjam.com](https://app.mcpjam.com/) and choose **Add server**.
2. Enter the Ultiwrite HTTPS MCP endpoint above.
3. Choose **Auto** authentication, which escalates to OAuth when required. Use the supported public-client DCR/PKCE flow and complete Ultiwrite sign-in and consent.
4. Inspect the discovered tools. Reading metadata or account identity does not authorize a new investigation.

Ultiwrite already registers this exact hosted callback:

```text
https://app.mcpjam.com/oauth/callback
```

[MCPJam’s current callback source](https://github.com/MCPJam/inspector/blob/main/mcpjam-inspector/client/src/lib/oauth/constants.ts) derives `/oauth/callback` from the hosted app origin. Staging, scoring and preview domains are separate origins; their presence in upstream source does not authorize wildcard callbacks here.

The [hosted overview](https://docs.mcpjam.com/hosted/overview) says SaaS connections originate from MCPJam’s servers. The SaaS accepts HTTPS remote servers and does not run local stdio processes. Its [OAuth implementation](https://github.com/MCPJam/inspector/blob/main/mcpjam-inspector/client/src/lib/oauth/mcp-oauth.ts) proxies OAuth requests and supports an MCP-request proxy fallback. A browser CORS entry alone is therefore not proof that a hosted connection succeeds or fails. Local Inspector and desktop installations have different origins and callback handling.

MCPJam’s hosted documentation states that OAuth credentials are stored in Vault, retained in the user’s hosted workspace, and restored after signing back in. It states that hosted tokens are not stored in browser localStorage or shared with other users. These are vendor statements, not an independent security audit. Signing out does not revoke the upstream grant. Revoke the connected client’s Ultiwrite grant through the existing OAuth revocation flow when access should end; reconnect only the intended account. Do not put tokens in chat, screenshots or shared debugging exports.

Sources: [hosted setup and token custody](https://docs.mcpjam.com/hosted/overview), [OAuth debugger and registration modes](https://docs.mcpjam.com/inspector/guided-oauth), [privacy policy](https://www.mcpjam.com/privacy-policy).

## Cloudflare AI Playground

Open [Cloudflare AI Playground](https://playground.ai.cloudflare.com/), add the remote MCP URL, then authenticate as described in Cloudflare’s [current remote-server guide](https://developers.cloudflare.com/agents/model-context-protocol/guides/test-remote-mcp-server/).

Prepared exact origin and callback:

```text
Browser origin: https://playground.ai.cloudflare.com
OAuth callback: https://playground.ai.cloudflare.com/oauth/callback
```

The callback is evidenced by [Cloudflare-owned PR45](https://github.com/cloudflare/ai/pull/45), dated March 25, 2025. The current official guide confirms the Playground’s remote MCP client role, but this run did not verify its current deployed callback or an authenticated Ultiwrite connection. This is a source-backed configuration candidate. If the deployed client requests a different callback, retain the refusal and verify that exact URI before changing registration.

Cloudflare is a reasonable client option when its exact endpoint and the customer’s scopes are used. Its brand does not authorize all Cloudflare domains. Authorizing the client gives that service the ability to receive permitted tool results. [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/) describes inference-specific training and retention rules; it does not establish one policy for every Playground feature, application log, cache, stateful service or third-party model. Review the actual product’s terms and model handling for the evidence involved.

## Cloudflare MCP Portals

Portals are a separate, account-configured gateway. The [official upstream OAuth callback documentation](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#upstream-oauth-callback-urls) distinguishes these flows:

| Flow | Exact callback shape |
| --- | --- |
| Administrator DCR setup | `https://dash.cloudflare.com/<account-tag>/one/access-controls/ai-controls/mcp-server/oauth-callback/<server-id>` |
| Per-user flow with shared callback enabled | `https://oauth-callbacks.cloudflareaccess.com/cdn-cgi/access/outbound-oauth-callback` |
| Per-user flow without shared callback | `https://<your-portal-hostname>/servers-callback` |

The account tag, server ID and portal hostname must come from the actual portal configuration. These examples are not wildcard registration rules. A working portal requires separate exact configuration for the selected flow and an approved upstream client; none of these callback shapes grants all portals access to Ultiwrite. Keep **Require user auth** enabled so each user authorizes their own upstream account. Disabling it can share an administrator’s upstream credentials.

Do not register arbitrary `dash.cloudflare.com`, `*.cloudflareaccess.com`, portal hostnames or `*.workers.dev`. No portal-specific callback was inferred from a company name, and no portal installation or hosted acceptance is claimed.

## Postman hosted MCP Client

Open the [official online MCP Client](https://www.postman.com/tools/mcp-client), add the Ultiwrite HTTPS MCP URL, and configure OAuth. The browser origin is `https://www.postman.com`. Postman’s [OAuth debugger documentation](https://learning.postman.com/docs/use/send-requests/protocols/mcp-requests/oauth-debugger) supports DCR and PKCE S256.

For a browser OAuth configuration, Postman documents this configurable callback:

```text
https://oauth.pstmn.io/v1/browser-callback
```

Select that callback explicitly when configuring the documented browser flow. [Postman’s OAuth configuration guide](https://learning.postman.com/docs/use/send-requests/authorization/oauth-20) documents it; this run did not establish that the signed-out online workbench always selects it automatically. The desktop callback and desktop agent are separate surfaces. A different callback must be independently verified and registered exactly.

The online client routes the server URL, headers, authorization data and MCP messages through **Postman Cloud Agent**. A scoped customer OAuth grant therefore authorizes processing by that hosted service; its browser origin is not a substitute for consent. Keep private grants and responses out of shared collections or public workspaces. An authenticated online Ultiwrite connection was not tested.

## Stripe

[Stripe’s official MCP documentation](https://docs.stripe.com/mcp) describes a server at `https://mcp.stripe.com` that exposes Stripe operations to agents. It does not establish a hosted client that accepts arbitrary third-party MCP servers.

Stripe is recorded as a server-only surface, with no Ultiwrite client callback added. Existing Stripe billing integration remains independent. This guide does not grant Stripe account access, add Stripe tools, change payments or claim that Stripe can consume Ultiwrite.
