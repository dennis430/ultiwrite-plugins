#!/usr/bin/env node
// Rebuild the three public connector ZIPs from this repository.
// Does not publish, deploy, or submit a directory listing.
import { createHash } from 'node:crypto'
import { deflateRawSync } from 'node:zlib'
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'release')
const VERSION = '0.7.1'
const MCP_URL = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
const TOOLS = [
  'ultiwrite_account_get',
  'ultiwrite_capabilities_get',
  'ultiwrite_cases_list',
  'ultiwrite_case_status',
  'ultiwrite_coherence_get',
  'ultiwrite_evidence_submit',
  'ultiwrite_findings_get',
  'ultiwrite_report_export',
]
const PACKAGES = [
  {
    id: 'chatgpt',
    root: 'chatgpt',
    files: ['assets/logo.png', 'mcp.json', 'plugin.json', 'README.md', 'skills/ultiwrite-read/SKILL.md'],
  },
  {
    id: 'claude',
    root: 'claude',
    files: ['.claude-plugin/plugin.json', '.mcp.json', 'LICENSE', 'README.md', 'SUBMISSION.md', 'assets/logo.png', 'skills/ultiwrite/SKILL.md'],
  },
  {
    id: 'cursor',
    root: 'cursor',
    files: ['.cursor-plugin/plugin.json', 'LICENSE', 'README.md', 'assets/logo.png', 'mcp.json', 'skills/ultiwrite/SKILL.md'],
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

function assertTools(text, where) {
  const missing = TOOLS.filter(tool => !text.includes(tool))
  if (missing.length) throw new Error(`${where} is missing tools: ${missing.join(', ')}`)
}

const skillText = ['chatgpt/skills/ultiwrite-read/SKILL.md', 'claude/skills/ultiwrite/SKILL.md', 'cursor/skills/ultiwrite/SKILL.md', 'grokbot/TOOLS.md']
  .map(path => readFileSync(join(root, path), 'utf8')).join('\n')
assertTools(skillText, 'connector skills and Grok tool dossier')

const chatgptMcp = JSON.parse(readFileSync(join(root, 'chatgpt/mcp.json'), 'utf8'))
const server = chatgptMcp.mcpServers.ultiwrite
if (server.url !== MCP_URL || server.type !== 'streamable-http') throw new Error('ChatGPT MCP URL drifted')
const auth = server.extensions['com.openai'].auth
for (const [key, path] of [['authorizationUrl', '/api/integrations/ultiwrite/oauth/authorize'], ['tokenUrl', '/api/integrations/ultiwrite/oauth/token'], ['registrationUrl', '/api/integrations/ultiwrite/oauth/register']]) {
  if (auth[key] !== `https://dwsoffshorepartners.com${path}`) throw new Error(`${key} drifted`)
}
if (auth.client.mode !== 'dcr') throw new Error('ChatGPT client mode drifted')
if (JSON.stringify(auth.defaultScopes) !== JSON.stringify(['ultiwrite:read', 'ultiwrite:evidence'])) throw new Error('scopes drifted')

mkdirSync(outDir, { recursive: true })
const inventory = []
for (const pack of PACKAGES) {
  const entries = pack.files.map(name => {
    const bytes = readFileSync(join(root, pack.root, name))
    return { name, bytes }
  })
  const archive = zip(entries)
  const filename = `ultiwrite-${pack.id}-plugin-${VERSION}.zip`
  writeFileSync(join(outDir, filename), archive)
  inventory.push({
    file: `release/${filename}`,
    sha256: createHash('sha256').update(archive).digest('hex'),
    bytes: archive.length,
    members: entries.map(entry => ({
      name: entry.name,
      sha256: createHash('sha256').update(entry.bytes).digest('hex'),
      bytes: entry.bytes.length,
    })),
  })
}
const sums = inventory.map(item => `${item.sha256}  ${item.file.split('/').pop()}`).join('\n') + '\n'
writeFileSync(join(outDir, 'SHA256SUMS.txt'), sums)
writeFileSync(join(outDir, 'INVENTORY.json'), JSON.stringify({
  version: VERSION,
  mcp_url: MCP_URL,
  tools: TOOLS,
  oauth: {
    authorization_endpoint: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize',
    token_endpoint: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token',
    registration_endpoint: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/register',
    code_challenge_method: 'S256',
    scopes: ['ultiwrite:read', 'ultiwrite:evidence'],
  },
  packages: inventory,
  not: ['installed integration', 'directory approval', 'npm publication', 'production deployment'],
}, null, 2) + '\n')
process.stdout.write(`packed ${inventory.length} archives into release/\n`)

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(relative(root, path).split(sep).join('/'))
  }
  return out
}
void walk
