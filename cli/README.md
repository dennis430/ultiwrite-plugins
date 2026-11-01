# Ultiwrite CLI

`@ultiwrite/cli` installs Ultiwrite's hosted MCP connection in supported AI clients. It uses `https://mcp.dwsoffshorepartners.com/mcp`. Analysis, account authorization, and reporting run on the existing Ultiwrite service.

Requires **Node.js 22+**. The package version is **0.1.0**, and npm publication is pending. The separate `client/` directory contains the existing `ultiwrite-mcp` local upload/stdio wrapper; this installer does not publish or replace it.

## Run before npm publication

With Git installed:

```sh
npx --yes github:dennis430/ultiwrite-plugins#codex/npx-plugin-installer-20261101 install cursor
```

The branch command uses the branch's current commit. To pin an approved version, replace the text after `#` with that commit's full SHA. A GitHub install requires network access to GitHub and npm for the declared dependency.

From a checkout:

```sh
npm ci --ignore-scripts
node cli/bin/ultiwrite.mjs install cursor --dry-run
node cli/bin/ultiwrite.mjs install cursor
```

## Run after npm publication

These commands require a successful registry release first:

```sh
npx @ultiwrite/cli@latest install cursor
npx @ultiwrite/cli@latest install claude-code
npx @ultiwrite/cli@latest install vscode
npx @ultiwrite/cli@latest install codex
```

The equivalent npm command is:

```sh
npm exec --package=@ultiwrite/cli@latest -- ultiwrite install cursor
```

For a persistent command:

```sh
npm install --global @ultiwrite/cli
ultiwrite install cursor
ultiwrite status cursor
```

Run `npm install --global @ultiwrite/cli@latest` to update a global CLI installation. Running the installer again with identical configuration leaves the existing file unchanged. Authentication remains in the client that owns the connection.

## Clients and scope

| Client | Install behavior | Configuration destination |
| --- | --- | --- |
| `cursor` | Adds native remote HTTP MCP configuration | User: `~/.cursor/mcp.json`; project: `.cursor/mcp.json` |
| `claude-code`, `claude` | Adds native remote HTTP MCP configuration | User: `~/.claude.json`; project: `.mcp.json` |
| `vscode` | Adds native remote HTTP MCP configuration | Standard default user profile, or project `.vscode/mcp.json` |
| `codex` | Uses the installed `codex mcp` CLI | User scope; Codex owns its TOML file and account flow |
| `cline` | Adds Streamable HTTP configuration | Requires `--config` with the actual Cline MCP settings file |
| `windsurf` | Adds legacy Windsurf `serverUrl` configuration | Requires `--config`; intended for the legacy Windsurf/Cascade format |
| `chatgpt` | Prints hosted connection instructions | Managed through ChatGPT's own app/plugin interface |
| `claude-desktop` | Prints hosted connection instructions | Managed through the Claude account; includes the Ultiwrite directory link |
| `grok` | Prints available hosted setup guidance | Managed through the host; no consumer installation is claimed |

`~` means the operating system's user home directory. For VS Code user scope, the standard destinations are:

| Operating system | VS Code default-profile MCP file |
| --- | --- |
| macOS | `~/Library/Application Support/Code/User/mcp.json` |
| Linux | `$XDG_CONFIG_HOME/Code/User/mcp.json`, falling back to `~/.config/Code/User/mcp.json` |
| Windows | `%APPDATA%\Code\User\mcp.json`, with the standard home AppData/Roaming fallback |

Use `--config` for VS Code Insiders, portable installations, another profile, or a custom client location. Open the relevant client's MCP settings to identify its actual file. The legacy Windsurf target does not claim compatibility with current Devin configuration. Cline uses `type: "streamableHttp"`; its tool auto-approval list starts empty.

## Commands

Use the `ultiwrite` command after global installation, or replace it with the GitHub or npm invocation above:

```sh
ultiwrite clients
ultiwrite install cursor --dry-run
ultiwrite install cursor
ultiwrite install claude-code --scope project
ultiwrite install vscode --config "/path/to/profile/mcp.json"
ultiwrite install cline --config "/path/to/cline_mcp_settings.json"
ultiwrite install windsurf --config "/path/to/legacy/mcp_config.json"
ultiwrite status cursor
ultiwrite uninstall cursor
ultiwrite doctor
ultiwrite doctor --offline
ultiwrite --help
ultiwrite --version
```

| Option | Meaning |
| --- | --- |
| `--scope user` | Default: configure the current user's client |
| `--scope project` | Configure the current project for Cursor, Claude Code, or VS Code |
| `--config PATH` | Select the JSON file explicitly; required for Cline and legacy Windsurf; unsupported for Codex |
| `--dry-run` | Show the planned install or removal without writing configuration |
| `--force` | Explicitly allow replacement/removal of a conflicting entry in a JSON configuration; native Codex conflicts must be resolved through Codex |
| `--json` | Emit structured command output |
| `--offline` | Run `doctor` without contacting the hosted service |

JSON configuration edits preserve unrelated servers, comments, and settings. Changes create a backup of an existing file; the result reports its path. Invalid or ambiguous configuration fails before replacement. Keep backups private because existing client files can contain credentials for other services. No Ultiwrite API key is requested or written by this installer.

`status` checks installed configuration. `doctor` checks the public connection metadata; neither proves a user is signed in or that an analysis ran. `doctor --offline` shows the expected connection settings and performs no service requests. Successful installation means the connection configuration was added.

## Finish connecting and reconnect

Restart or refresh the client's MCP connections if the new server does not appear. Select Ultiwrite, complete its browser sign-in, then ask the assistant to confirm the connected account. For Claude Code use `/mcp`; for Codex run `codex mcp login ultiwrite`.

If authorization was dismissed, reconnect in that client's MCP/account settings. For a different account, start its authorization flow again and choose the intended identity. Website sign-in alone does not prove the MCP client finished authorization. Local CLI settings do not install the hosted ChatGPT or Claude account connector.

Removing a JSON entry removes its configuration, not the remote account grant. Revoke access in the client or Ultiwrite account settings when required. The native Codex removal command controls its own local credential behavior.

## Verify a source release

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run validate
npm run test:package
```

The package check creates a tarball in a temporary directory, verifies its file allowlist, installs that tarball in a clean temporary project, and runs the installed binary through npm. It exercises help/version, configuration installation, repeated installation, and removal without editing real client settings. Dependency installation needs registry access. It does not publish the package.

GitHub Actions runs the CLI checks on Node 22 and 24 across Linux, Windows, and macOS. The distribution checks also verify existing plugin archive/source parity. This configuration defines the CI coverage; a particular run is verified only when its checks finish successfully.

## Publish the npm package

Publishing is a separate release action. The prepared name is `@ultiwrite/cli`; ownership of the `@ultiwrite` npm scope and permission to publish that package must be established by its authorized owner. An unpublished package response does not prove scope ownership or name availability.

For the first release, use an authorized account on the publisher's computer. Sign up at [npm](https://www.npmjs.com/signup), create or join the appropriate organization, then authenticate through npm's browser flow. Do not send tokens or passwords in chat.

From the approved repository checkout:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm ci --ignore-scripts
npm publish --access public
```

The root `prepublishOnly` script runs build, tests, distribution validation, and the packed-install check before that publication. Complete npm's account and two-factor prompts. Confirm that the package version is not already published; npm versions cannot be reused. The first local release does not claim a GitHub provenance attestation.

After the package exists, configure its **Trusted Publisher** in npm with these values:

| npm field | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `dennis430` |
| Repository | `ultiwrite-plugins` |
| Workflow filename | `publish-cli.yml` |
| Environment | Leave empty; this workflow does not declare an environment |
| Allowed action | Enable direct `npm publish` for this workflow |

The workflow uses GitHub-hosted Ubuntu, Node 24, npm 11.5.1 or newer, and short-lived OIDC credentials with provenance. It has no publish token secret. npm currently requires a newly configured trusted publisher to complete its first publish within two days; create it when the next release is ready.

For later releases, update the version and lockfile in a reviewed change, merge the approved release to `main`, then manually run **Publish Ultiwrite CLI** from GitHub Actions using `main` and the exact package version. The workflow rejects a version mismatch and only runs in the owning repository on `main`. Pushes, pull requests, and merges do not trigger publishing. An existing npm version requires a new version before this workflow can publish again.

After registry publication, verify from a clean directory:

```sh
npx @ultiwrite/cli@latest --version
npx @ultiwrite/cli@latest install cursor --dry-run
```

Only after those checks succeed should the README's pending-publication notice be replaced with the registry command as the primary install route.

## Client and release references

- [Cursor MCP configuration](https://cursor.com/docs/mcp)
- [Claude Code MCP configuration and scopes](https://code.claude.com/docs/en/mcp)
- [VS Code MCP configuration](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)
- [Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp)
- [Cline MCP configuration](https://docs.cline.bot/mcp/mcp-overview)
- [Claude account-managed remote connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

The CLI uses the repository's MIT license. The Ultiwrite analytical service remains proprietary; see [LICENSE](../LICENSE) and [NOTICE](../NOTICE).
