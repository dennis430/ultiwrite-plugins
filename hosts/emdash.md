# EmDash coding agents

This guide applies to the **EmDash coding-agent application**, whose [MCP documentation](https://emdash.ai/docs/library/mcp) describes central MCP management and translation into selected agents' native config files. It is distinct from the similarly named EmDash CMS and its own content-management MCP server.

## Connect Ultiwrite

1. Open **Library → MCP** in EmDash. For agents on another machine, use **Settings → Machines → your machine → MCP**; its paths and localhost belong to that machine.
2. Choose **Custom MCP**, name the connection `ultiwrite`, select **http**, and enter `https://mcp.dwsoffshorepartners.com/mcp`.
3. Select the installed agents that should receive this server. EmDash disables targets without the selected transport according to their declared capabilities. Do not overwrite unrelated MCP entries.
4. Start a new session in the selected agent and complete **that agent's native OAuth flow**. For Codex use `codex mcp login ultiwrite`; for Claude Code use `/mcp`; for Cursor use its MCP authentication control. EmDash config sync does not itself prove shared OAuth token custody or that every target is signed in.
5. Confirm `ultiwrite_account_get` and `ultiwrite_capabilities_get` in each actual target before reading private reports or sending evidence.

Use the remote endpoint and no static bearer headers. The portable connection in [configs/generic-remote.json](configs/generic-remote.json) is a reference, not an EmDash-specific file import schema. EmDash's UI translates the fields to the installed agent's native format.

If a target lacks native remote OAuth, review the existing [stdio adapter instructions](README.md#optional-stdio-adapter). Install the command and its dependencies on the machine running that agent, use a distinct credential profile and verify the connected account there. The npm adapter package is prepared; publication is not claimed.

## Enterprise deployment and catalog submission

Keep a record of which agents and machines received the connection. Editing or removing an EmDash config does not establish upstream OAuth revocation; revoke the actual grant when access must end. A newly synced config should be accepted and authenticated before the next session uses evidence.

The official guide establishes custom HTTP connections and a curated catalog. It does not establish that this repository is accepted in that catalog or an unattended directory submission API. The [submission packet](submissions/README.md) provides the endpoint, public metadata, privacy links and review scenarios; confirm the current maintainer submission route before requesting catalog inclusion. No invented EmDash manifest or universal OAuth callback is included.

Source checked November 13, 2026 through the official indexed documentation. Native EmDash/agent authentication and catalog acceptance are **NOT_RUN**. Complete the [installed acceptance matrix](enterprise/acceptance.md) for each intended agent/machine; one synced config is not proof that all selected agents work.
