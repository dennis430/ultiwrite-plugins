import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { execFile } from 'node:child_process'
import { homedir } from 'node:os'
import { posix, win32 } from 'node:path'

export const CODEX_MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const OWNED_URLS = new Set([
  CODEX_MCP_URL,
  'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp',
])
const AUTH_STATES = new Set(['o_auth', 'not_logged_in', 'bearer_token', 'unsupported', 'unknown'])
const LOGIN_STEP = 'Run codex mcp login ultiwrite to sign in, then start a new Codex session.'

function notFound() {
  const error = new Error('Codex CLI was not found on PATH. Install it with npm install -g @openai/codex, then retry this command.')
  error.code = 'CODEX_NOT_FOUND'
  return error
}

async function accessible(path, mode) {
  try { await access(path, mode); return true } catch { return false }
}

// Node cannot execute npm's Windows .cmd shim with shell:false. Resolve only
// the installed @openai/codex package beside that shim and run its declared JS
// entry with Node. No shell text or user-controlled command interpolation.
export async function resolveCodexInvocation({
  platform = process.platform,
  env = process.env,
  canAccess = accessible,
  readText = path => readFile(path, 'utf8'),
  nodePath = process.execPath,
} = {}) {
  const path = platform === 'win32' ? win32 : posix
  const pathValue = platform === 'win32'
    ? Object.entries(env).find(([key]) => key.toLowerCase() === 'path')?.[1]
    : env.PATH
  const directories = String(pathValue || '').split(path.delimiter).map(value => value.replace(/^"|"$/g, '')).filter(Boolean)
  for (const directory of directories) {
    if (!path.isAbsolute(directory)) continue
    if (platform !== 'win32') {
      const file = path.join(directory, 'codex')
      if (await canAccess(file, constants.X_OK)) return { file, prefix: [] }
      continue
    }
    for (const name of ['codex.exe', 'codex.com']) {
      const file = path.join(directory, name)
      if (await canAccess(file, constants.F_OK)) return { file, prefix: [] }
    }
    if (!await canAccess(path.join(directory, 'codex.cmd'), constants.F_OK)) continue
    const candidates = [
      path.join(directory, 'node_modules', '@openai', 'codex'),
      path.resolve(directory, '..', '@openai', 'codex'),
    ]
    for (const packageRoot of candidates) {
      let metadata
      try { metadata = JSON.parse(await readText(path.join(packageRoot, 'package.json'))) } catch { continue }
      if (metadata?.name !== '@openai/codex') continue
      const bin = typeof metadata.bin === 'string' ? metadata.bin : metadata.bin?.codex
      if (typeof bin !== 'string' || path.isAbsolute(bin) || !/\.m?js$/i.test(bin)) continue
      const script = path.resolve(packageRoot, bin)
      const relative = path.relative(packageRoot, script)
      if (relative.startsWith('..') || path.isAbsolute(relative)) continue
      if (await canAccess(script, constants.R_OK)) return { file: nodePath, prefix: [script] }
    }
  }
  throw notFound()
}

function nativeRunner(invocation, { env, cwd }) {
  return (args, { timeoutMs = 15_000 } = {}) => new Promise(resolve => {
    execFile(invocation.file, [...invocation.prefix, ...args], {
      env,
      cwd,
      encoding: 'utf8',
      shell: false,
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout) => resolve({
      code: error ? (Number.isInteger(error.code) ? error.code : 1) : 0,
      stdout: stdout || '',
      timedOut: Boolean(error?.killed),
    }))
  })
}

function parseEntries(stdout) {
  let entries
  try { entries = JSON.parse(stdout) } catch { throw new Error('Codex returned invalid JSON. Run codex mcp list --json directly to diagnose it; no settings were changed by this step.') }
  if (!Array.isArray(entries) || entries.some(entry => !entry || Array.isArray(entry) || typeof entry.name !== 'string' || !entry.name ||
    !entry.transport || typeof entry.transport !== 'object' || Array.isArray(entry.transport) || typeof entry.transport.type !== 'string' ||
    typeof entry.enabled !== 'boolean' ||
    (entry.transport.type === 'streamable_http' && typeof entry.transport.url !== 'string'))) {
    throw new Error('Codex returned an unsupported MCP list format. Update Codex and retry; no settings were changed by this step.')
  }
  if (new Set(entries.map(entry => entry.name)).size !== entries.length) {
    throw new Error('Codex returned duplicate MCP server names. Review codex mcp list before retrying.')
  }
  return entries
}

async function inspect(run) {
  let result
  try { result = await run(['mcp', 'list', '--json'], { timeoutMs: 15_000 }) } catch {
    throw new Error('Could not inspect Codex MCP settings. Run codex mcp list --json directly to diagnose it.')
  }
  if (result?.code !== 0) throw new Error('Could not inspect Codex MCP settings. Run codex mcp list --json directly to diagnose it.')
  return parseEntries(result.stdout).find(entry => entry.name === 'ultiwrite')
}

function isOwned(entry) {
  return entry?.transport?.type === 'streamable_http' && OWNED_URLS.has(entry.transport.url)
}

function summary(entry, action, extra = {}) {
  return {
    client: 'codex',
    label: 'Codex',
    action,
    changed: false,
    installed: isOwned(entry),
    present: Boolean(entry),
    enabled: Boolean(entry?.enabled),
    conflict: Boolean(entry && !isOwned(entry)),
    transport: 'http',
    authentication: AUTH_STATES.has(entry?.auth_status) ? entry.auth_status : 'unknown',
    nextSteps: isOwned(entry)
      ? [entry.enabled ? LOGIN_STEP : 'Ultiwrite is configured but disabled. Enable it in Codex MCP settings, then run codex mcp login ultiwrite.']
      : ['Run ultiwrite install codex to configure Ultiwrite.'],
    ...extra,
  }
}

/** Native user configuration; Codex owns TOML parsing and OAuth credentials. */
export async function configureCodex({
  action = 'install',
  scope = 'user',
  configPath,
  dryRun = false,
  force = false,
  env = process.env,
  cwd = homedir(),
  run,
  onProgress = () => {},
} = {}) {
  if (!['install', 'uninstall', 'status'].includes(action)) throw new Error('Unsupported Codex action.')
  if (scope !== 'user' || configPath !== undefined) {
    throw new Error('Codex uses its native user configuration. Omit --config and use --scope user; project setup is available through Codex itself.')
  }
  if (!run) {
    const invocation = await resolveCodexInvocation({ env })
    run = nativeRunner(invocation, { env, cwd })
  }
  const before = await inspect(run)
  if (action === 'status') return summary(before, action)
  if (before && !isOwned(before)) {
    // A forceful remove/add resets native options and potentially grants. Keep
    // that deliberate operation in Codex rather than silently replacing it.
    throw new Error(`A different Codex MCP entry uses the name ultiwrite. Review it with codex mcp get ultiwrite and resolve the name in Codex before retrying.${force ? ' --force does not replace native Codex entries.' : ''}`)
  }
  if ((action === 'install' && before) || (action === 'uninstall' && !before)) return summary(before, action, { dryRun })

  const args = action === 'install'
    ? ['mcp', 'add', 'ultiwrite', '--url', CODEX_MCP_URL]
    : ['mcp', 'remove', 'ultiwrite']
  if (dryRun) return summary(before, action, { dryRun: true, wouldChange: true, command: ['codex', ...args] })

  if (action === 'install') onProgress('Codex may open your browser to sign in. Setup waits up to 30 seconds; you can finish later with codex mcp login ultiwrite.')
  let mutation
  try { mutation = await run(args, { timeoutMs: 30_000 }) } catch { mutation = { code: 1 } }
  // `mcp add` can save configuration and then fail or time out during OAuth.
  // Verify the saved entry independently before reporting its outcome.
  let after
  try { after = await inspect(run) } catch {
    throw new Error('Codex setup finished without a verifiable configuration result. Run codex mcp list, then codex mcp login ultiwrite if the server is present. Configuration may have been saved.')
  }
  if (action === 'install' && isOwned(after)) {
    return summary(after, action, {
      changed: true,
      ...(mutation?.code !== 0 ? { loginPending: true, nextSteps: ['Ultiwrite configuration was saved. Browser sign-in did not finish.', LOGIN_STEP] } : {}),
    })
  }
  if (action === 'uninstall' && !after) {
    return summary(after, action, { changed: true, nextSteps: ['Ultiwrite was removed from Codex MCP configuration.'] })
  }
  throw new Error(`Codex did not confirm ${action === 'install' ? 'installation' : 'removal'}. Run codex mcp list to inspect the current configuration.`)
}
