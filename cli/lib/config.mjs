import { constants } from 'node:fs'
import { lstat, mkdir, open, rename, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { applyEdits, modify, parse, parseTree, printParseErrorCode } from 'jsonc-parser'

export const MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const LEGACY_URL = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
const OWN_URLS = new Set([MCP_URL, LEGACY_URL])
const CLIENTS = {
  cursor: {
    label: 'Cursor', key: 'mcpServers', entry: { url: MCP_URL }, project: true,
    nextSteps: 'Restart Cursor or refresh MCP settings, then connect Ultiwrite and approve access in your browser.',
  },
  'claude-code': {
    label: 'Claude Code', key: 'mcpServers', entry: { type: 'http', url: MCP_URL }, project: true,
    nextSteps: 'Restart Claude Code, open /mcp, and authenticate Ultiwrite. Project configurations may require approval.',
  },
  vscode: {
    label: 'VS Code', key: 'servers', entry: { type: 'http', url: MCP_URL }, project: true,
    nextSteps: 'In VS Code, run MCP: List Servers, select Ultiwrite, and start it. Approve trust and sign in when prompted. The default user profile is used unless --config selects another file.',
  },
  windsurf: {
    label: 'Windsurf (legacy configuration)', key: 'mcpServers', entry: { serverUrl: MCP_URL }, explicit: true,
    nextSteps: 'Refresh the MCP settings in your compatible Windsurf client and authenticate Ultiwrite. This writes the legacy serverUrl configuration to the file you selected.',
  },
  cline: {
    label: 'Cline', key: 'mcpServers', entry: { type: 'streamableHttp', url: MCP_URL, disabled: false, autoApprove: [] }, explicit: true,
    nextSteps: 'Refresh the MCP Servers view in Cline and authenticate Ultiwrite. Approve tool actions when requested.',
  },
}

export const configTargets = Object.freeze(Object.entries(CLIENTS).map(([id, info]) => Object.freeze({
  id, label: info.label, project: Boolean(info.project), requiresConfig: Boolean(info.explicit),
})))

function clientInfo(client) {
  if (!Object.hasOwn(CLIENTS, client)) throw new Error(`Unsupported configuration client: ${client}.`)
  return CLIENTS[client]
}

export function resolveConfigPath({ client, scope = 'user', configPath, cwd = process.cwd(), home = os.homedir(), platform = process.platform, env = process.env }) {
  const info = clientInfo(client)
  const paths = platform === 'win32' ? path.win32 : path.posix
  if (!['user', 'project'].includes(scope)) throw new Error('Scope must be user or project.')
  if (scope === 'project' && !info.project) throw new Error(`${info.label} does not support --scope project in this installer.`)
  if (configPath !== undefined) {
    if (typeof configPath !== 'string' || !configPath.trim()) throw new Error('--config requires a file path.')
    return paths.resolve(cwd, configPath)
  }
  if (info.explicit) throw new Error(`${info.label} requires --config with the MCP settings file selected in that client.`)
  if (scope === 'project') {
    const projectPaths = { cursor: ['.cursor', 'mcp.json'], 'claude-code': ['.mcp.json'], vscode: ['.vscode', 'mcp.json'] }
    return paths.resolve(cwd, ...projectPaths[client])
  }
  if (client === 'cursor') return paths.resolve(home, '.cursor', 'mcp.json')
  if (client === 'claude-code') return paths.resolve(home, '.claude.json')
  if (platform === 'darwin') return paths.resolve(home, 'Library', 'Application Support', 'Code', 'User', 'mcp.json')
  if (platform === 'win32') return paths.resolve(env.APPDATA || paths.join(home, 'AppData', 'Roaming'), 'Code', 'User', 'mcp.json')
  const configHome = env.XDG_CONFIG_HOME && paths.isAbsolute(env.XDG_CONFIG_HOME) ? env.XDG_CONFIG_HOME : paths.join(home, '.config')
  return paths.resolve(configHome, 'Code', 'User', 'mcp.json')
}

// Configurations often contain unrelated secrets. Never expose source text in errors or results.
function parseConfiguration(raw) {
  const source = raw.toString('utf8')
  if (!Buffer.from(source, 'utf8').equals(raw)) throw new Error('The configuration must use valid UTF-8 encoding. No configuration was changed.')
  const bom = source.startsWith('\uFEFF') ? '\uFEFF' : ''
  const text = source.slice(bom.length)
  const errors = []
  const tree = parseTree(text, errors, { allowTrailingComma: true })
  if (errors.length) throw new Error(`Invalid JSON/JSONC configuration (${printParseErrorCode(errors[0].error)} at offset ${errors[0].offset}). Repair the file before retrying.`)
  if (!tree || tree.type !== 'object') throw new Error('The configuration must contain a JSON object.')
  const visit = node => {
    if (node.type === 'object') {
      const keys = new Set()
      for (const property of node.children || []) {
        const key = property.children[0].value
        if (keys.has(key)) throw new Error('The configuration contains duplicate object keys. Resolve them before retrying.')
        keys.add(key)
      }
    }
    for (const child of node.children || []) visit(child)
  }
  visit(tree)
  return { text, bom, value: parse(text, [], { allowTrailingComma: true }) }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isOwned(entry, info) {
  if (!isObject(entry) || Object.hasOwn(entry, 'command')) return false
  const field = Object.hasOwn(info.entry, 'serverUrl') ? 'serverUrl' : 'url'
  return typeof entry[field] === 'string' && OWN_URLS.has(entry[field].replace(/\/$/, ''))
}

function sameObject(a, b) {
  if (a === b) return true
  if (!isObject(a) || !isObject(b)) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(key => Object.hasOwn(b, key) && JSON.stringify(a[key]) === JSON.stringify(b[key]))
}

async function rejectSymlinks(file) {
  const absolute = path.resolve(file)
  const parts = absolute.slice(path.parse(absolute).root.length).split(path.sep).filter(Boolean)
  let current = path.parse(absolute).root
  for (const part of parts) {
    current = path.join(current, part)
    try {
      const stats = await lstat(current)
      if (stats.isSymbolicLink()) throw new Error('Refusing to modify a configuration through a symbolic link. Select a regular file path with --config.')
    } catch (error) {
      if (error.code === 'ENOENT') break
      throw error
    }
  }
}

async function snapshot(file) {
  let handle
  try {
    handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW || 0))
    const stats = await handle.stat()
    if (!stats.isFile()) throw new Error('The configuration path is not a regular file.')
    if (stats.size > 10 * 1024 * 1024) throw new Error('The configuration exceeds 10 MiB. Select a smaller MCP configuration file.')
    return { exists: true, bytes: await handle.readFile(), mode: stats.mode & 0o777, ino: stats.ino, dev: stats.dev }
  } catch (error) {
    if (error.code === 'ENOENT') return { exists: false, bytes: Buffer.from('{}\n'), mode: 0o600 }
    throw error
  } finally {
    await handle?.close()
  }
}

async function assertUnchanged(file, before) {
  await rejectSymlinks(file)
  const current = await snapshot(file)
  if (current.exists !== before.exists || (before.exists && (current.ino !== before.ino || current.dev !== before.dev || !current.bytes.equals(before.bytes) || current.mode !== before.mode))) {
    throw new Error('The configuration changed during installation. No configuration was replaced; retry after the client finishes saving its settings.')
  }
}

async function writeExclusive(file, contents, mode) {
  const handle = await open(file, 'wx', mode)
  try {
    await handle.writeFile(contents)
    await handle.chmod(mode)
    await handle.sync()
  } finally {
    await handle.close()
  }
}

async function saveConfiguration(file, before, contents) {
  const parent = path.dirname(file)
  await rejectSymlinks(file)
  await mkdir(parent, { recursive: true, mode: 0o700 })
  await assertUnchanged(file, before)
  const nonce = randomUUID()
  const temp = path.join(parent, `.${path.basename(file)}.ultiwrite-${nonce}.tmp`)
  let backupPath
  try {
    if (before.exists) {
      backupPath = `${file}.ultiwrite-backup-${new Date().toISOString().replace(/[:.]/g, '-')}-${nonce}.bak`
      await writeExclusive(backupPath, before.bytes, 0o600)
    }
    await writeExclusive(temp, contents, before.mode)
    await assertUnchanged(file, before)
    await rename(temp, file)
    return backupPath
  } finally {
    await rm(temp, { force: true })
  }
}

/** Only edit the selected client's Ultiwrite entry; never print or return complete configuration data. */
export async function configureClient({ client, action = 'install', scope = 'user', configPath, cwd = process.cwd(), home = os.homedir(), platform = process.platform, env = process.env, dryRun = false, force = false }) {
  if (!['install', 'uninstall', 'status'].includes(action)) throw new Error('Action must be install, uninstall, or status.')
  const info = clientInfo(client)
  const file = resolveConfigPath({ client, scope, configPath, cwd, home, platform, env })
  await rejectSymlinks(file)
  const before = await snapshot(file)
  const { text, bom, value } = parseConfiguration(before.bytes)
  if (Object.hasOwn(value, info.key) && !isObject(value[info.key])) throw new Error(`The ${info.key} property must be an object. No configuration was changed.`)
  const servers = Object.hasOwn(value, info.key) ? value[info.key] : {}
  const hasEntry = Object.hasOwn(servers, 'ultiwrite')
  const existing = hasEntry ? servers.ultiwrite : undefined
  const owned = hasEntry && isOwned(existing, info)
  const result = {
    client, label: info.label, path: file, action, scope, changed: false, installed: owned,
    conflict: hasEntry && !owned, dryRun, transport: 'streamable-http', nextSteps: info.nextSteps,
  }
  if (action === 'status') return result
  if (hasEntry && !owned && !force) throw new Error('An unrelated entry already uses the name ultiwrite. Review it first; use --force only if you intend to replace or remove that entry. No configuration was changed.')
  if (action === 'uninstall' && !hasEntry) return result
  // Keep existing approval choices and additional options when updating our own endpoint.
  const desired = action === 'install' ? { ...info.entry, ...(owned ? existing : {}), ...Object.fromEntries(Object.entries(info.entry).filter(([key]) => key === 'url' || key === 'serverUrl' || key === 'type')) } : undefined
  if (action === 'install' && owned && sameObject(existing, desired)) return result
  const indent = text.match(/\n([\t ]+)"/)?.[1]
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const formattingOptions = { insertSpaces: !indent?.includes('\t'), tabSize: indent && !indent.includes('\t') ? indent.length : 2, eol }
  let updated = applyEdits(text, modify(text, [info.key, 'ultiwrite'], desired, { formattingOptions }))
  if (!updated.endsWith('\n')) updated += eol
  const contents = Buffer.from(bom + updated)
  parseConfiguration(contents)
  result.changed = true
  if (dryRun) return result
  result.backupPath = await saveConfiguration(file, before, contents)
  result.installed = action === 'install'
  result.conflict = false
  return result
}
