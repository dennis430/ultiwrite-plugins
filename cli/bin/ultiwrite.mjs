#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { configureClient, configTargets, MCP_URL } from '../lib/config.mjs'
import { configureCodex } from '../lib/codex.mjs'

const metadata = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'))
const packageName = `${metadata.name}@${metadata.version}`
const aliases = { claude: 'claude-code', 'vs-code': 'vscode', 'claude.ai': 'claude-desktop', 'grokbot': 'grok' }
const hosted = new Set(['chatgpt', 'claude-desktop', 'grok'])
const local = new Set([...configTargets.map(target => target.id), 'codex'])
const booleanFlags = new Set(['--dry-run', '--force', '--json', '--offline', '--help', '--version'])
const valueFlags = new Set(['--scope', '--config'])

function usage() {
  return `Ultiwrite ${metadata.version} — asymmetric diligence and investigative intelligence

Usage: ultiwrite <command> [client] [options]

Commands:
  install <client>     Configure Ultiwrite in a client
  uninstall <client>   Remove only its Ultiwrite MCP entry
  status <client>      Check configuration without displaying credentials
  clients             List supported clients
  doctor              Check public MCP / OAuth discovery (no login or analysis)

Clients:
  cursor              Cursor, user or project configuration
  claude-code         Claude Code (alias: claude), user or project
  vscode              VS Code default profile, or project
  codex               Installed Codex CLI and IDE shared user configuration
  cline               Cline; requires --config with its MCP settings file
  windsurf            Legacy Windsurf; requires --config with its MCP settings file
  chatgpt             Show hosted connection instructions
  claude-desktop      Show Ultiwrite's Claude directory connection
  grok                Show MCP setup instructions for compatible Grok hosts

Options:
  --scope user|project User scope by default; project support varies by client
  --config <path>      Select an explicit JSON/JSONC MCP configuration file
  --dry-run            Preview changes without writing
  --force              Replace a conflicting Ultiwrite entry in a JSON config
  --json               Return a machine-readable summary, never full config
  --offline            Doctor: show expected settings without a network check
  --help, -h           Show this help
  --version, -v        Show the version

Examples:
  ultiwrite install cursor
  ultiwrite install claude
  ultiwrite install vscode --scope project
  ultiwrite install cursor --dry-run
  ultiwrite status cursor
  ultiwrite uninstall cursor

Existing client settings are preserved. OAuth authorization stays in the client.
This configures the MCP connection; packaged marketplace skills are installed
through each marketplace separately. See INSTALL.md for those routes.
MCP: ${MCP_URL}
`
}

function parseArguments(args) {
  const options = { scope: 'user' }
  const positional = []
  const seen = new Set()
  for (let index = 0; index < args.length; index++) {
    let item = args[index]
    if (item === '-h') item = '--help'
    if (item === '-v') item = '--version'
    if (booleanFlags.has(item)) {
      if (seen.has(item)) throw new Error(`Option repeated: ${item}`)
      seen.add(item)
      options[item.slice(2)] = true
    } else if (valueFlags.has(item)) {
      if (seen.has(item)) throw new Error(`Option repeated: ${item}`)
      seen.add(item)
      const value = args[++index]
      if (!value || value.startsWith('-') || value.includes('\0')) throw new Error(`${item} requires a value.`)
      options[item.slice(2)] = value
    } else if (item.startsWith('-')) {
      throw new Error(`Unknown option: ${item}. Run ultiwrite --help.`)
    } else {
      positional.push(item)
    }
  }
  if (positional.length > 2) throw new Error('Too many arguments. Run ultiwrite --help.')
  if (!['user', 'project'].includes(options.scope)) throw new Error('--scope must be user or project.')
  const command = options.help ? 'help' : options.version ? 'version' : positional[0] || 'help'
  const client = aliases[positional[1]] || positional[1]
  if (!['help', 'version', 'clients', 'doctor', 'install', 'uninstall', 'status'].includes(command)) {
    throw new Error(`Unknown command: ${command}. Run ultiwrite --help.`)
  }
  if (['install', 'uninstall', 'status'].includes(command)) {
    if (!client || (!local.has(client) && !hosted.has(client))) throw new Error('Choose a supported client. Run ultiwrite clients.')
    if (options.offline) throw new Error('--offline is only supported by doctor.')
    if (command === 'status' && (options['dry-run'] || options.force)) throw new Error('status is read-only; --dry-run and --force do not apply.')
    if (client === 'codex' && (options.config || options.scope !== 'user')) throw new Error('Codex uses its native CLI and user configuration. --config and project scope are not supported.')
    if (hosted.has(client) && (options.config || options.scope !== 'user' || options.force || options['dry-run'])) throw new Error('Hosted clients use account settings; local configuration options do not apply.')
  } else if (!['help', 'version'].includes(command)) {
    if (client) throw new Error(`${command} does not take a client argument.`)
    if (options.config || seen.has('--scope') || options.force || options['dry-run'] || (options.offline && command !== 'doctor')) {
      throw new Error(`Unsupported option for ${command}. Run ultiwrite --help.`)
    }
  }
  return { command, client, options }
}

function hostedGuidance(client, action) {
  const common = { client, action, changed: false, installed: null, managedBy: 'host-account', endpoint: MCP_URL, authentication: 'OAuth in the host' }
  if (action !== 'install') return {
    ...common,
    nextSteps: action === 'uninstall'
      ? 'Remove or disconnect Ultiwrite in this host account’s Apps, Plugins, or Connectors settings. No local file was changed.'
      : 'Check Ultiwrite in this host account’s Apps, Plugins, or Connectors settings. A local CLI cannot inspect that account connection.',
  }
  if (client === 'claude-desktop') return {
    ...common,
    label: 'Claude Desktop / Claude.ai',
    url: 'https://claude.ai/directory/ultiwrite',
    nextSteps: 'Open https://claude.ai/directory/ultiwrite and connect Ultiwrite. Complete sign-in and approve account access in Claude. If sign-in was dismissed, select Connect again in the Ultiwrite connector settings.',
  }
  if (client === 'chatgpt') return {
    ...common,
    label: 'ChatGPT',
    url: 'https://dwsoffshorepartners.com/docs/mcp',
    nextSteps: `Use ChatGPT’s Apps settings to connect the existing Ultiwrite app where available. For supported developer-mode/custom-app accounts, add ${MCP_URL} with OAuth. Complete the connection in ChatGPT. This command does not install or publish a ChatGPT directory listing.`,
  }
  return {
    ...common,
    label: 'Grok MCP-compatible host',
    url: 'https://github.com/dennis430/ultiwrite-plugins/tree/main/grokbot',
    nextSteps: `If your Grok host supports remote MCP with OAuth, add ${MCP_URL} in that host’s MCP settings. Consumer Grok support is not assumed. For Grok running in Cursor, run ultiwrite install cursor.`,
  }
}

async function doctor(offline) {
  const base = new URL(MCP_URL).origin
  const expected = {
    package: packageName, endpoint: MCP_URL, issuer: base,
    scopes: ['ultiwrite:read', 'ultiwrite:evidence'],
    authentication: 'OAuth, authorized inside each client',
    authenticated: false,
  }
  if (offline) return { ...expected, mode: 'offline', checked: false, nextSteps: 'No network check was made. Run ultiwrite doctor to check public discovery.' }
  const endpoints = [
    ['resource', `${base}/.well-known/oauth-protected-resource`],
    ['authorization', `${base}/.well-known/oauth-authorization-server`],
  ]
  const responses = await Promise.all(endpoints.map(async ([name, url]) => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: 'error', headers: { accept: 'application/json' } })
      if (!response.ok) { await response.body?.cancel(); return { name, ok: false, status: response.status } }
      const body = await response.json()
      const ok = name === 'resource'
        ? body.resource === MCP_URL && body.authorization_servers?.includes(base) && expected.scopes.every(scope => body.scopes_supported?.includes(scope))
        : body.issuer === base && body.code_challenge_methods_supported?.includes('S256') && typeof body.authorization_endpoint === 'string' && typeof body.token_endpoint === 'string'
      return { name, ok: Boolean(ok), status: response.status }
    } catch {
      return { name, ok: false, error: 'Public discovery could not be read. Check connectivity, proxy settings, and service availability.' }
    }
  }))
  const ok = responses.every(response => response.ok)
  return { ...expected, mode: 'online', checked: true, ok, checks: responses, nextSteps: ok
    ? 'Public OAuth discovery is reachable. Install a client, then sign in there to authorize your account.'
    : 'Discovery did not pass. You can still inspect settings with doctor --offline; resolve the connection before authenticating.' }
}

function printResult(result, json) {
  if (json) { process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); return }
  if (Array.isArray(result)) {
    process.stdout.write('Ultiwrite client setup\n\n')
    for (const target of result) process.stdout.write(`  ${target.id.padEnd(16)} ${target.label}${target.requiresConfig ? ' (requires --config)' : ''}${target.hosted ? ' (account connection instructions)' : ''}\n`)
    return
  }
  if (result.mode) {
    process.stdout.write(`Ultiwrite ${metadata.version}\nMCP: ${result.endpoint}\n`)
    process.stdout.write(result.checked ? `Public OAuth discovery: ${result.ok ? 'passed' : 'failed'}\n` : 'Offline settings; connectivity and sign-in have not been checked.\n')
  } else if (result.managedBy) {
    process.stdout.write(`Ultiwrite — ${result.label || result.client}\nThis connection is managed in your host account.\n`)
  } else {
    const label = result.label || result.client
    if (result.action === 'status') process.stdout.write(`${label}: ${result.conflict ? 'a different entry uses the name ultiwrite' : result.installed ? 'Ultiwrite is configured' : 'Ultiwrite is not configured'}.\n`)
    else if (result.dryRun) process.stdout.write(`${label}: ${(result.changed || result.wouldChange) ? `would ${result.action === 'install' ? 'configure' : 'remove'} Ultiwrite` : 'no change needed'} (dry run).\n`)
    else if (result.changed) process.stdout.write(`${result.action === 'install' ? 'Successfully configured Ultiwrite for' : 'Removed Ultiwrite from'} ${label}.\n`)
    else process.stdout.write(`${label}: ${result.installed ? 'Ultiwrite is already configured' : 'no Ultiwrite configuration to remove'}.\n`)
    if (result.path) process.stdout.write(`Configuration: ${result.path}\n`)
    if (result.backupPath) process.stdout.write(`Backup: ${result.backupPath}\n`)
    if (result.action !== 'uninstall' && !result.dryRun) process.stdout.write('Account authorization is completed separately in the client.\n')
  }
  if (result.nextSteps && result.action !== 'uninstall') {
    process.stdout.write(`\n${Array.isArray(result.nextSteps) ? result.nextSteps.join('\n') : result.nextSteps}\n`)
  } else if (result.managedBy && result.nextSteps) {
    process.stdout.write(`\n${result.nextSteps}\n`)
  }
}

let parsed
try {
  parsed = parseArguments(process.argv.slice(2))
} catch (error) {
  process.stderr.write(`Ultiwrite: ${error.message}\n`)
  process.exitCode = 2
}

if (parsed) {
  const { command, client, options } = parsed
  try {
    if (command === 'help') process.stdout.write(usage())
    else if (command === 'version') process.stdout.write(`${metadata.version}\n`)
    else if (command === 'clients') printResult([...configTargets, { id: 'codex', label: 'Codex CLI / IDE' }, { id: 'chatgpt', label: 'ChatGPT', hosted: true }, { id: 'claude-desktop', label: 'Claude Desktop / Claude.ai', hosted: true }, { id: 'grok', label: 'Grok MCP-compatible host', hosted: true }], options.json)
    else if (command === 'doctor') {
      const result = await doctor(options.offline)
      printResult(result, options.json)
      if (result.checked && !result.ok) process.exitCode = 1
    } else if (hosted.has(client)) printResult(hostedGuidance(client, command), options.json)
    else {
      const request = { client, action: command, scope: options.scope, configPath: options.config, dryRun: Boolean(options['dry-run']), force: Boolean(options.force) }
      const result = client === 'codex' ? await configureCodex({ ...request, onProgress: message => { if (!options.json) process.stderr.write(`${message}\n`) } }) : await configureClient(request)
      printResult(result, options.json)
      if (command === 'status' && (!result.installed || result.conflict)) process.exitCode = 1
    }
  } catch (error) {
    if (options.json) process.stderr.write(`${JSON.stringify({ ok: false, error: error.message })}\n`)
    else process.stderr.write(`Ultiwrite: ${error.message}\n`)
    process.exitCode = 1
  }
}
