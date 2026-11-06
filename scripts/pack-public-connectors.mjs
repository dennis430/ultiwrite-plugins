#!/usr/bin/env node
// Rebuild the current connector ZIPs from this public repository, then verify
// every current archive member against its source. Historical ZIPs remain unchanged.
// Does not publish, deploy, or submit a directory listing.
import { createHash } from 'node:crypto'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'release')
if (process.argv.slice(2).some(arg => arg !== '--check') || process.argv.slice(2).length > 1) throw new Error('Only --check is supported; this packer never publishes or submits')
const checkOnly = process.argv.includes('--check')
const VERSION = JSON.parse(readFileSync(join(root, 'chatgpt/plugin.json'), 'utf8')).version
const CURSOR_VERSION = JSON.parse(readFileSync(join(root, 'cursor/.cursor-plugin/plugin.json'), 'utf8')).version
const MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const COMPATIBILITY_MCP_URL = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
const CHATGPT_MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const TOOLS = JSON.parse(readFileSync(join(root, 'hosts/catalog.json'), 'utf8')).tools.map(tool => tool.name)
if (!TOOLS.length || new Set(TOOLS).size !== TOOLS.length) throw new Error('Canonical public tool catalog is invalid')
const CLAUDE_VERSION = JSON.parse(readFileSync(join(root, 'claude/.claude-plugin/plugin.json'), 'utf8')).version
const CLAUDE_MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const CLAUDE_ZIP = `Ultiwrite_Claude_Plugin_v${CLAUDE_VERSION}.zip`
const HOSTS_ZIP = `ultiwrite-host-adapters-${VERSION}.zip`
const CURRENT_ARCHIVES = new Set([HOSTS_ZIP, `ultiwrite-chatgpt-plugin-${VERSION}.zip`, `ultiwrite-cursor-plugin-${CURSOR_VERSION}.zip`, CLAUDE_ZIP])
const FROZEN_ARCHIVES = (existsSync(outDir) ? readdirSync(outDir) : []).filter(name => name.endsWith('.zip') && !CURRENT_ARCHIVES.has(name)).sort()
const PACKAGES = [
  { id: 'host-adapters', root: 'hosts', version: VERSION, filename: HOSTS_ZIP },
  {
    id: 'chatgpt',
    root: 'chatgpt',
    version: VERSION,
  },
  {
    id: 'cursor',
    root: 'cursor',
    version: CURSOR_VERSION,
  },
]

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeArtifact(path, content) {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content)
  if (checkOnly) {
    if (!readFileSync(path).equals(bytes)) throw new Error(`${relative(root, path)} is out of date; rebuild the release archives`)
    return
  }
  writeFileSync(path, bytes)
}

function dosTime() {
  // 2026-10-29 00:00:00 local, fixed so the archive hash does not move with the clock.
  const time = 0
  const date = ((2026 - 1980) << 9) | (10 << 5) | 29
  return { time, date }
}

function zip(entries) {
  const { time, date } = dosTime()
  const locals = []
  const centrals = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.name)
    const data = deflateRawSync(entry.bytes, { level: 9 })
    const crc = crc32(entry.bytes)
    const local = Buffer.alloc(30 + name.length)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(entry.bytes.length, 22)
    local.writeUInt16LE(name.length, 26)
    local.writeUInt16LE(0, 28)
    name.copy(local, 30)
    locals.push(local, data)
    const central = Buffer.alloc(46 + name.length)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(time, 12)
    central.writeUInt16LE(date, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(entry.bytes.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    name.copy(central, 46)
    centrals.push(central)
    offset += local.length + data.length
  }
  const centralDir = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDir.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)
  return Buffer.concat([...locals, centralDir, end])
}

function readZip(archive) {
  const endAt = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  if (endAt < 0) throw new Error('not a ZIP')
  const count = archive.readUInt16LE(endAt + 10)
  let at = archive.readUInt32LE(endAt + 16)
  const members = []
  for (let i = 0; i < count; i += 1) {
    if (archive.readUInt32LE(at) !== 0x02014b50) throw new Error('bad central directory')
    const method = archive.readUInt16LE(at + 10)
    const size = archive.readUInt32LE(at + 20)
    const nameLength = archive.readUInt16LE(at + 28)
    const extraLength = archive.readUInt16LE(at + 30)
    const commentLength = archive.readUInt16LE(at + 32)
    const localAt = archive.readUInt32LE(at + 42)
    const name = archive.subarray(at + 46, at + 46 + nameLength).toString('utf8')
    const dataAt = localAt + 30 + archive.readUInt16LE(localAt + 26) + archive.readUInt16LE(localAt + 28)
    const raw = archive.subarray(dataAt, dataAt + size)
    if (method !== 0 && method !== 8) throw new Error(`${name} uses unsupported method ${method}`)
    members.push({ name, bytes: method === 0 ? Buffer.from(raw) : inflateRawSync(raw) })
    at += 46 + nameLength + extraLength + commentLength
  }
  return members
}

function assertTools(text, where) {
  const missing = TOOLS.filter(tool => !text.includes(tool))
  if (missing.length) throw new Error(`${where} is missing tools: ${missing.join(', ')}`)
}

const validated = spawnSync(process.execPath, [join(root, 'scripts/validate-public-plugins.mjs'), root], { encoding: 'utf8' })
if (validated.status !== 0) throw new Error(validated.stderr || validated.stdout || 'Public package validation failed')

const skillText = ['chatgpt/skills/ultiwrite-read/SKILL.md', 'claude/skills/ultiwrite/SKILL.md', 'cursor/skills/ultiwrite/SKILL.md', 'grokbot/TOOLS.md']
  .map(path => readFileSync(join(root, path), 'utf8')).join('\n')
assertTools(skillText, 'connector skills and Grok tool dossier')

const chatgptMcp = JSON.parse(readFileSync(join(root, 'chatgpt/mcp.json'), 'utf8'))
const server = chatgptMcp.mcpServers.ultiwrite
if (server.url !== CHATGPT_MCP_URL || server.type !== 'streamable-http') throw new Error('ChatGPT MCP URL drifted')
if (JSON.stringify(Object.keys(server).sort()) !== JSON.stringify(['type', 'url'])) throw new Error('ChatGPT portable server must retain parser-safe transport and URL only; OAuth uses service discovery')

walk(root)
if (!checkOnly) mkdirSync(outDir, { recursive: true })
const inventory = []
for (const pack of PACKAGES) {
  const sourceFiles = walk(join(root, pack.root)).map(path => path.slice(pack.root.length + 1)).sort()
  const entries = sourceFiles.map(name => {
    const bytes = readFileSync(join(root, pack.root, name))
    return { name, bytes }
  })
  const archive = zip(entries)
  const filename = pack.filename ?? `ultiwrite-${pack.id}-plugin-${pack.version}.zip`
  const members = readZip(archive)
  if (JSON.stringify(members.map(member => member.name)) !== JSON.stringify(sourceFiles)) throw new Error(`${filename} member list differs from source`)
  for (const member of members) {
    if (!member.bytes.equals(readFileSync(join(root, pack.root, member.name)))) throw new Error(`${filename} ${member.name} differs from source`)
  }
  writeArtifact(join(outDir, filename), archive)
  inventory.push({
    file: `release/${filename}`,
    version: pack.version,
    sha256: createHash('sha256').update(archive).digest('hex'),
    bytes: archive.length,
    members: entries.map(entry => ({
      name: entry.name,
      sha256: createHash('sha256').update(entry.bytes).digest('hex'),
      bytes: entry.bytes.length,
    })),
  })
}
// Claude: build from the exact public source, including the recovery skill.
const claudeSource = walk(join(root, 'claude')).map(path => path.slice('claude/'.length)).sort()
const claudeArchive = zip(claudeSource.map(name => ({ name, bytes: readFileSync(join(root, 'claude', name)) })))
writeArtifact(join(outDir, CLAUDE_ZIP), claudeArchive)
const claudeMembers = readZip(claudeArchive)
const memberNames = claudeMembers.map(member => member.name).sort()
if (JSON.stringify(memberNames) !== JSON.stringify(claudeSource)) {
  throw new Error(`${CLAUDE_ZIP} members ${memberNames.join(', ')} do not match claude/ ${claudeSource.join(', ')}`)
}
for (const member of claudeMembers) {
  if (!member.bytes.equals(readFileSync(join(root, 'claude', member.name)))) throw new Error(`${CLAUDE_ZIP} ${member.name} differs from claude/`)
}
const claudeManifest = JSON.parse(readFileSync(join(root, 'claude/.claude-plugin/plugin.json'), 'utf8'))
const claudeServer = JSON.parse(readFileSync(join(root, 'claude/.mcp.json'), 'utf8')).mcpServers.ultiwrite
if (claudeManifest.version !== CLAUDE_VERSION || claudeServer.url !== CLAUDE_MCP_URL || claudeServer.type !== 'http') throw new Error('Claude manifest or MCP URL drifted')
assertTools(walk(join(root, 'claude/skills')).map(path => readFileSync(join(root, path), 'utf8')).join('\n'), 'Claude skills')
inventory.push({
  file: `release/${CLAUDE_ZIP}`,
  version: CLAUDE_VERSION,
  mcp_url: CLAUDE_MCP_URL,
  built_by: 'scripts/pack-public-connectors.mjs: sorted entries, deflate level 9, fixed 2026-10-29 timestamps',
  sha256: createHash('sha256').update(claudeArchive).digest('hex'),
  bytes: claudeArchive.length,
  members: claudeMembers.map(member => ({
    name: member.name,
    sha256: createHash('sha256').update(member.bytes).digest('hex'),
    bytes: member.bytes.length,
  })),
})
for (const name of FROZEN_ARCHIVES) {
  const frozen = readFileSync(join(outDir, name))
  inventory.push({
    file: `release/${name}`,
    version: name.match(/(?:_v|-)(\d+\.\d+\.\d+)\.zip$/)?.[1],
    status: 'historical archive; kept so existing links keep working; not rebuilt',
    sha256: createHash('sha256').update(frozen).digest('hex'),
    bytes: frozen.length,
    members: readZip(frozen).map(member => ({
      name: member.name,
      sha256: createHash('sha256').update(member.bytes).digest('hex'),
      bytes: member.bytes.length,
    })),
  })
}
const sums = inventory.map(item => `${item.sha256}  ${item.file.split('/').pop()}`).join('\n') + '\n'
writeArtifact(join(outDir, 'SHA256SUMS.txt'), sums)
writeArtifact(join(outDir, 'INVENTORY.json'), JSON.stringify({
  version: VERSION,
  mcp_url: CHATGPT_MCP_URL,
  compatibility_mcp_url: COMPATIBILITY_MCP_URL,
  chatgpt: { version: VERSION, mcp_url: CHATGPT_MCP_URL },
  claude: { version: CLAUDE_VERSION, mcp_url: CLAUDE_MCP_URL },
  cursor: { version: CURSOR_VERSION, mcp_url: MCP_URL },
  tools: TOOLS,
  oauth: {
    source: 'expected canonical metadata; clients follow live service discovery',
    issuer: 'https://mcp.dwsoffshorepartners.com',
    protected_resource_metadata: 'https://mcp.dwsoffshorepartners.com/.well-known/oauth-protected-resource/mcp',
    authorization_server_metadata: 'https://mcp.dwsoffshorepartners.com/.well-known/oauth-authorization-server',
    authorization_endpoint: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize',
    token_endpoint: 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token',
    registration_endpoint: 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register',
    code_challenge_method: 'S256',
    scopes: ['ultiwrite:read', 'ultiwrite:evidence'],
  },
  packages: inventory,
  not: ['installed integration', 'directory approval', 'npm publication', 'production deployment'],
}, null, 2) + '\n')
const downloadTable = ['| Archive | SHA-256 |', '| --- | --- |', ...inventory.filter(item => !item.file.endsWith(HOSTS_ZIP)).slice(0, 3).map(item => {
  const name = item.file.split('/').pop()
  return `| [\`${name}\`](https://github.com/dennis430/ultiwrite-plugins/raw/main/${item.file}) | \`${item.sha256}\` |`
})].join('\n')
const readmePath = join(root, 'README.md')
const readme = readFileSync(readmePath, 'utf8')
const downloadsPattern = /<!-- CURRENT_DOWNLOADS_START -->[\s\S]*?<!-- CURRENT_DOWNLOADS_END -->/
if (!downloadsPattern.test(readme)) throw new Error('README current download markers missing')
writeArtifact(readmePath, readme.replace(downloadsPattern, `<!-- CURRENT_DOWNLOADS_START -->\n${downloadTable}\n<!-- CURRENT_DOWNLOADS_END -->`))
const manifestPath = join(root, 'RELEASE_MANIFEST.json')
const priorManifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}
const releaseManifest = {
  product: 'Ultiwrite',
  distribution: 'plugin-only',
  version: VERSION,
  publisher: 'DWS Offshore Fund',
  source_repository: 'dennis430/merchant-risk-app',
  source_base_commit: process.env.ULTIWRITE_SOURCE_SHA || priorManifest.source_base_commit || priorManifest.source_commit || null,
  public_source_base_commit: priorManifest.public_source_base_commit || null,
  package_status: 'PREPARED',
  host_evaluation_status: 'NOT_RUN',
  directory_publication_status: 'NOT_VERIFIED_BY_THIS_EXPORT',
  mcp_urls: Object.fromEntries([
    ['chatgpt', 'chatgpt/mcp.json'], ['claude', 'claude/.mcp.json'],
    ['cursor', 'cursor/mcp.json'], ['grokbot', 'grokbot/mcp.json'],
  ].map(([host, file]) => [host, JSON.parse(readFileSync(join(root, file), 'utf8')).mcpServers.ultiwrite.url])),
  mcp_url: CHATGPT_MCP_URL,
  compatibility_mcp_url: COMPATIBILITY_MCP_URL,
  packages: {
    hosts: { version: VERSION, zip: `release/${HOSTS_ZIP}`, status: 'prepared; host acceptance skipped by owner' },
    chatgpt: { version: VERSION, zip: `release/ultiwrite-chatgpt-plugin-${VERSION}.zip`, mcp_url: CHATGPT_MCP_URL },
    cursor: { version: CURSOR_VERSION, zip: `release/ultiwrite-cursor-plugin-${CURSOR_VERSION}.zip` },
    claude: { version: CLAUDE_VERSION, zip: `release/${CLAUDE_ZIP}`, mcp_url: CLAUDE_MCP_URL },
    grokbot: { version: JSON.parse(readFileSync(join(root, 'grokbot/FIELDS.json'), 'utf8')).version, status: 'submission dossier; host test not run' },
    client: { version: JSON.parse(readFileSync(join(root, 'client/package.json'), 'utf8')).version, status: 'prepared local adapter; npm publication not claimed' },
  },
  note: 'SHA-256 of every file except this manifest. Historical archives are preserved. Built source does not establish directory upload, review, installed-host acceptance or server deployment.',
  files: walk(root).filter(path => path !== 'RELEASE_MANIFEST.json').sort().map(path => ({ path, sha256: createHash('sha256').update(readFileSync(join(root, path))).digest('hex') })),
}
writeArtifact(join(root, 'RELEASE_MANIFEST.json'), JSON.stringify(releaseManifest, null, 2) + '\n')
process.stdout.write(`${checkOnly ? 'checked' : 'packed'} ${PACKAGES.length + 1} current archives, verified ${CLAUDE_ZIP}, recorded ${inventory.length} archives in release/\n`)

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', 'coverage', '.cache', '__MACOSX', '.DS_Store', 'Thumbs.db'].includes(name) || name.endsWith('.tgz')) continue
    if (name.startsWith('.env') || ['.npmrc', '.netrc', '.ssh', '.aws', '.codex'].includes(name) || /\.(pem|key|p12)$/i.test(name)) throw new Error('Refusing a private package path')
    const path = join(dir, name)
    const stat = lstatSync(path)
    if (stat.isSymbolicLink() || !stat.isFile() && !stat.isDirectory()) throw new Error('Refusing a nonregular package source')
    if (stat.isDirectory()) walk(path, out)
    else out.push(relative(root, path).split(sep).join('/'))
  }
  return out
}
