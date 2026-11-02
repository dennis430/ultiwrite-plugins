#!/usr/bin/env node
// Structural validator for the public Ultiwrite plugin tree.
// It does not publish, deploy, or contact a marketplace.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, lstatSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = process.argv[2] ? process.argv[2] : process.cwd()
const errors = []
const fail = message => errors.push(message)
const MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const CHATGPT_MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
// Claude uses the same server through its clean host, matching its directory connector listing.
const CLAUDE_MCP_URL = 'https://mcp.dwsoffshorepartners.com/mcp'
const privateHost = ['engine', 'dwsoffshorepartners', 'com'].join('.')
const secretNeedles = [
  privateHost,
  'DATABASE' + '_URL',
  'client' + '_secret',
  'client' + 'Secret"',
  'NEXTAUTH' + '_SECRET',
  '-----BEGIN' + ' ',
  'AK' + 'IA',
  'gh' + 'p_',
  'github' + '_pat_',
  'postgres' + '://',
  'postgresql' + '://',
  'mongodb' + '://',
  'mongodb+srv' + '://',
]

const allowedTop = new Set([
  'cursor', 'claude', 'chatgpt', 'grokbot', 'client', 'scripts', '.github',
  '.cursor-plugin', '.claude-plugin', 'README.md', 'LICENSE', 'NOTICE',
  'INSTALL.md', 'server.draft.json', '.gitignore', 'RELEASE_MANIFEST.json',
  'release', 'AGENTS.md', 'POSITIONING.md', 'evals',
])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', 'coverage', '.cache', '__MACOSX', '.DS_Store', 'Thumbs.db'].includes(name) || name.endsWith('.tgz')) continue
    const path = join(dir, name)
    const rel = relative(root, path).split(sep).join('/')
    if (rel.split('/').some(part => part === '..' || part.startsWith('.env'))) fail(`forbidden path ${rel}`)
    const entry = lstatSync(path)
    if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) { fail(`nonregular release path ${rel}`); continue }
    if (entry.isDirectory()) walk(path, out)
    else out.push(rel)
  }
  return out
}

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'))
  } catch (error) {
    fail(`${rel} is not JSON: ${error.message}`)
    return null
  }
}

function pngSquareOpaque(rel) {
  const bytes = readFileSync(join(root, rel))
  const sig = bytes.subarray(0, 8).toString('hex')
  if (sig !== '89504e470d0a1a0a') { fail(`${rel} is not a PNG`); return }
  let offset = 8
  let width = 0
  let height = 0
  let color = -1
  while (offset + 8 <= bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii')
    const data = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      color = data[9]
    }
    if (type === 'tRNS') fail(`${rel} has a transparency chunk`)
    if (type === 'IEND') break
    offset += 12 + length
  }
  if (width !== height || width < 256) fail(`${rel} must be a square at least 256px`)
  if (color !== 2) fail(`${rel} must be opaque RGB PNG (color type 2), got ${color}`)
}

const files = walk(root)
if (!files.length) fail('empty tree')
for (const rel of files) {
  const top = rel.split('/')[0]
  if (!allowedTop.has(top)) fail(`unexpected top-level path ${rel}`)
  const lower = rel.toLowerCase()
  if (/(^|\/)(migrations|prisma|ios|app|lib)\//.test(lower) && !rel.startsWith('client/lib/')) {
    fail(`forbidden tree ${rel}`)
  }
  if (/\.(pem|key|p12|env)$/.test(lower)) fail(`forbidden file ${rel}`)
  if (rel.endsWith('.png') || rel.endsWith('.zip')) continue
  const text = readFileSync(join(root, rel), 'utf8')
  for (const needle of secretNeedles) {
    if (text.includes(needle)) fail(`${rel} contains forbidden material`)
  }
}

const license = readFileSync(join(root, 'LICENSE'), 'utf8')
if (!license.includes('MIT License') || !license.includes('Copyright (c) 2026 DWS Offshore Fund')) fail('root LICENSE is not the DWS MIT grant')
if (!license.includes('analytical service')) fail('root LICENSE is missing the service boundary')
const notice = readFileSync(join(root, 'NOTICE'), 'utf8')
if (!notice.includes('does not contain')) fail('NOTICE missing')

const market = readJson('.cursor-plugin/marketplace.json')
if (market) {
  for (const key of Object.keys(market)) {
    if (!['name', 'owner', 'metadata', 'plugins'].includes(key)) fail(`marketplace.json has ${key}`)
  }
  if (market.name !== 'ultiwrite') fail('marketplace name')
  if (market.owner?.name !== 'DWS Offshore Fund' || market.owner.email !== 'nick@ultiwrite.co') fail('marketplace owner')
  if (!Array.isArray(market.plugins) || market.plugins.length !== 1) fail('marketplace plugins')
  const entry = market.plugins?.[0]
  if (entry && (entry.name !== 'ultiwrite' || entry.source !== 'cursor')) fail('marketplace source must be cursor')
  for (const key of Object.keys(entry ?? {})) {
    if (!['name', 'source', 'description'].includes(key)) fail(`marketplace plugin entry has ${key}`)
  }
}

const plugin = readJson('cursor/.cursor-plugin/plugin.json')
const pluginKeys = ['name', 'displayName', 'version', 'description', 'author', 'publisher', 'license', 'homepage', 'repository', 'logo', 'keywords', 'category', 'skills']
if (plugin) {
  for (const key of Object.keys(plugin)) if (!pluginKeys.includes(key)) fail(`plugin.json has ${key}`)
  if (plugin.name !== 'ultiwrite' || plugin.version !== '0.9.3' || plugin.license !== 'MIT') fail('plugin identity')
  if (plugin.author?.url || plugin.author?.name !== 'DWS Offshore Fund' || plugin.author?.email !== 'nick@ultiwrite.co') fail('plugin author')
  if (plugin.logo !== 'assets/logo.png') fail('plugin logo path')
  if ('skills' in plugin) fail('Cursor must discover every skills/ workflow; do not override discovery with a single path')
  if (plugin.repository !== 'https://github.com/dennis430/ultiwrite-plugins') fail('plugin repository')
}
pngSquareOpaque('cursor/assets/logo.png')
pngSquareOpaque('grokbot/assets/logo.png')

const mcp = readJson('cursor/mcp.json')
if (mcp) {
  if (mcp.$schema !== 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json') fail('mcp schema')
  const server = mcp.mcpServers?.ultiwrite
  if (!server || server.type !== 'streamable-http' || server.url !== MCP_URL || server.headers) fail('cursor mcp server')
  if (Object.keys(server ?? {}).some(key => !['type', 'url'].includes(key))) fail('cursor mcp extra key')
}
const grokMcp = readJson('grokbot/mcp.json')
if (grokMcp?.mcpServers?.ultiwrite?.url !== MCP_URL || grokMcp?.mcpServers?.ultiwrite?.type !== 'streamable-http') fail('grok mcp')

const skill = readFileSync(join(root, 'cursor/skills/ultiwrite/SKILL.md'), 'utf8')
if (!skill.startsWith('---\nname: ultiwrite\n')) fail('cursor skill name')
if (!/^description: .+/m.test(skill)) fail('cursor skill description')

const fields = readJson('grokbot/FIELDS.json')
if (fields) {
  if (fields.testedInGrokBot !== false || fields.hostTestStatus !== 'NOT_RUN' || fields.marketplaceSubmitted !== false) fail('grok dossier claims a host test or submission')
  if (fields.publisher !== 'DWS Offshore Fund' || fields.product !== 'Ultiwrite' || fields.category !== 'Commercial Diligence') fail('grok identity')
  if (fields.mcpUrl !== MCP_URL) fail('grok mcp url')
  for (const key of ['homepage', 'supportUrl', 'privacyUrl', 'termsUrl', 'docsUrl']) {
    if (typeof fields[key] !== 'string' || !fields[key].startsWith('https://dwsoffshorepartners.com')) fail(`grok ${key}`)
  }
}
for (const rel of ['grokbot/OAUTH.md', 'grokbot/TOOLS.md', 'grokbot/INSTALL.md', 'grokbot/TESTING.md']) {
  if (!readFileSync(join(root, rel), 'utf8').includes('NOT_RUN') && rel.endsWith('TESTING.md')) fail('testing status')
  if (!files.includes(rel)) fail(`missing ${rel}`)
}
if (!readFileSync(join(root, 'grokbot/TESTING.md'), 'utf8').includes('NOT_RUN')) fail('testing status missing')

const claude = readJson('claude/.mcp.json')
if (claude?.mcpServers?.ultiwrite?.type !== 'http' || claude?.mcpServers?.ultiwrite?.url !== CLAUDE_MCP_URL || Object.keys(claude?.mcpServers?.ultiwrite ?? {}).length !== 2) fail('claude mcp')
const claudeListing = readJson('claude/.claude-plugin/plugin.json')
if (claudeListing?.name !== 'ultiwrite' || claudeListing?.displayName !== 'Ultiwrite' || claudeListing?.icon !== './assets/logo.png' || claudeListing?.version !== '0.9.3') fail('claude directory branding')
for (const field of ['documentationUrl', 'supportUrl', 'privacyPolicyUrl', 'termsOfServiceUrl']) {
  if (typeof claudeListing?.[field] !== 'string' || !claudeListing[field].startsWith('https://dwsoffshorepartners.com/')) fail(`claude directory ${field}`)
}
const chatgptListing = readJson('chatgpt/plugin.json')
const openaiInterface = chatgptListing?.extensions?.['com.openai']?.interface
if (chatgptListing?.name !== 'ultiwrite' || chatgptListing?.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') fail('ChatGPT portable identity or schema')
if (chatgptListing?.apps || chatgptListing?.extensions?.['com.openai']?.apps || files.includes('chatgpt/.app.json')) fail('public ChatGPT package must not include private app bindings')
if (openaiInterface?.logoDark !== './assets/logo.png' || openaiInterface?.composerIconDark !== './assets/logo.png') fail('ChatGPT dark icons must use the canonical asset')
if (openaiInterface?.displayName !== 'Ultiwrite' || openaiInterface?.logo !== './assets/logo.png' || openaiInterface?.composerIcon !== './assets/logo.png' || chatgptListing?.version !== '0.9.3') fail('ChatGPT directory branding')
pngSquareOpaque('claude/assets/logo.png')
// Anthropic directory rules the CLI validator does not check (claude.com/docs/plugins/pre-submission-checklist).
const claudeFiles = files.filter(rel => rel.startsWith('claude/'))
if (claudeFiles.some(rel => rel.startsWith('claude/bin/'))) fail('claude plugin must not ship bin/')
if (claudeFiles.some(rel => /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|__MACOSX)(\/|$)/.test(rel))) fail('claude plugin contains an OS system file')
if (!claudeFiles.includes('claude/LICENSE')) fail('claude plugin LICENSE missing')
const claudeReadme = readFileSync(join(root, 'claude/README.md'), 'utf8').replace(/```[\s\S]*?```/g, ' ')
if (claudeReadme.split(/\s+/).filter(Boolean).length < 40) fail('claude README must have at least 40 words outside code blocks')
if (!/^## Privacy/m.test(claudeReadme)) fail('claude README must disclose data handling under ## Privacy')
const TOOL_NAMES = ['ultiwrite_account_get', 'ultiwrite_capabilities_get', 'ultiwrite_cases_list', 'ultiwrite_case_status', 'ultiwrite_coherence_get',
  'ultiwrite_findings_get', 'ultiwrite_report_export', 'ultiwrite_evidence_submit']
const EXPECTED_SKILLS = {
  chatgpt: ['ultiwrite-read', 'connect-account', 'submit-evidence', 'read-report', 'follow-up'],
  claude: ['ultiwrite', 'connect-account', 'submit-evidence', 'read-report', 'follow-up'],
  cursor: ['ultiwrite', 'connect-account', 'submit-evidence', 'read-report', 'follow-up'],
}
for (const [host, expected] of Object.entries(EXPECTED_SKILLS)) {
  const found = files.filter(rel => new RegExp(`^${host}/skills/[^/]+/SKILL\\.md$`).test(rel))
  const names = found.map(rel => rel.split('/')[2]).sort()
  if (JSON.stringify(names) !== JSON.stringify([...expected].sort())) fail(`${host} must package all five independently discoverable workflows`)
  for (const rel of found) {
    const text = readFileSync(join(root, rel), 'utf8')
    const front = /^---\n([\s\S]*?)\n---\n/.exec(text)
    if (!front) { fail(`${rel} has no front matter`); continue }
    if (!new RegExp(`^name: ${rel.split('/')[2]}$`, 'm').test(front[1])) fail(`${rel} name must equal its folder`)
    const description = /^description: (.+)$/m.exec(front[1])?.[1] ?? ''
    if (description.length < 40 || description.length > 1024) fail(`${rel} description length`)
    for (const tool of text.match(/ultiwrite_[a-z_]+/g) ?? []) if (!TOOL_NAMES.includes(tool)) fail(`${rel} names unknown tool ${tool}`)
    const metadataPath = rel.replace('SKILL.md', 'agents/openai.yaml')
    if (!files.includes(metadataPath)) { fail(`${metadataPath} missing`); continue }
    const metadata = readFileSync(join(root, metadataPath), 'utf8')
    // This package emits this small YAML subset; reject unrecognized policy keys
    // rather than treating an arbitrary string or an unsupported force-enable field as true.
    if (!/^policy:\n  allow_implicit_invocation: true\n$/.test(metadata.slice(metadata.indexOf('policy:')))) fail(`${metadataPath} must leave automatic invocation enabled by default`)
    for (const key of ['icon_small', 'icon_large']) {
      const encoded = new RegExp(`^  ${key}: (.+)$`, 'm').exec(metadata)?.[1]
      try {
        if (JSON.parse(encoded ?? '') !== '../../assets/logo.png') fail(`${metadataPath} ${key} must resolve to the canonical asset`)
      } catch { fail(`${metadataPath} invalid ${key}`) }
    }
    for (const key of ['display_name', 'short_description', 'default_prompt']) {
      const encoded = new RegExp(`^  ${key}: (.+)$`, 'm').exec(metadata)?.[1]
      try {
        const value = JSON.parse(encoded ?? '')
        if (typeof value !== 'string' || !value.trim()) fail(`${metadataPath} ${key} must be a nonblank string`)
        if (key === 'short_description' && (value.length < 25 || value.length > 64)) fail(`${metadataPath} description length`)
        if (key === 'default_prompt' && !value.includes(`$${rel.split('/')[2]}`)) fail(`${metadataPath} prompt must name the skill`)
      } catch { fail(`${metadataPath} invalid ${key}`) }
    }
  }
}
if (claudeListing?.defaultEnabled !== true) fail('Claude plugin defaultEnabled must be true; existing user overrides remain authoritative')
if (chatgptListing?.extensions?.['com.openai']?.onboardingSkill !== './skills/connect-account/SKILL.md') fail('ChatGPT onboarding must start with account connection')
if ((openaiInterface?.shortDescription?.length ?? 999) > 30) fail('ChatGPT subtitle exceeds 30 characters')
for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  if (!openaiInterface?.[field]?.startsWith('https://dwsoffshorepartners.com')) fail(`ChatGPT ${field}`)
}
const chatgptMcp = readJson('chatgpt/mcp.json')
const chatgptServer = chatgptMcp?.mcpServers?.ultiwrite
if (JSON.stringify(Object.keys(chatgptMcp?.mcpServers ?? {})) !== JSON.stringify(['ultiwrite'])) fail('ChatGPT must preserve the single ultiwrite server identity')
if (chatgptServer?.type !== 'streamable-http' || chatgptServer?.url !== CHATGPT_MCP_URL || chatgptServer?.headers) fail('ChatGPT MCP connection')
if (JSON.stringify(Object.keys(chatgptServer ?? {}).sort()) !== JSON.stringify(['type', 'url'])) fail('ChatGPT uses the portable parser-safe transport and URL only; OAuth is discovered from the service')
if (openaiInterface?.category !== 'Business & Operations') fail('ChatGPT must preserve the canonical listing category')
if (chatgptListing?.extensions?.['com.openai']?.review?.test_cases?.positive?.length !== 5 || chatgptListing?.extensions?.['com.openai']?.review?.test_cases?.negative?.length !== 3) fail('ChatGPT must preserve five positive and three negative review cases')
const canonicalLogoSha = 'cc0a3c229347e47a154a00c9e6dfa774c0e1f07ee9fc063935af5bc4897f4b18'
for (const host of ['chatgpt', 'claude', 'cursor', 'grokbot']) {
  const logo = readFileSync(join(root, host, 'assets/logo.png'))
  if (createHash('sha256').update(logo).digest('hex') !== canonicalLogoSha) fail(`${host} logo differs from the supplied canonical Uw image`)
}
pngSquareOpaque('chatgpt/assets/logo.png')
const pkg = readJson('client/package.json')
if (pkg?.name !== 'ultiwrite-mcp' || pkg?.version !== '0.7.1' || pkg?.license !== 'MIT') fail('client package')
if (readFileSync(join(root, 'server.draft.json'), 'utf8').includes('NOT PUBLISHED') === false) fail('registry draft must stay unpublished')

if (errors.length) {
  process.stderr.write(errors.map(item => `FAIL ${item}`).join('\n') + '\n')
  process.exit(1)
}
process.stdout.write(`public plugin tree ok (${files.length} files)\n`)
