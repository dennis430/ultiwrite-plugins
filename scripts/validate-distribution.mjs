#!/usr/bin/env node
// Read-only structural checks for the seven-channel submission source.
import assert from 'node:assert/strict'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const distribution = join(root, 'distribution')
const load = path => JSON.parse(readFileSync(join(root, path), 'utf8'))
const profile = load('distribution/shared/profile.json')
const channels = ['registry', 'cursor', 'google', 'meta', 'microsoft', 'salesforce', 'aws']
assert.deepEqual([...profile.scope].sort(), [...channels].sort(), 'exactly the seven requested channels')
assert.deepEqual(profile.excludedChannels, ['claude', 'grok', 'chatgpt'])
assert.equal(profile.submissionStatus, 'NOT_SUBMITTED')
assert.equal(profile.hostJourneyStatus, 'NOT_RUN')
assert.equal(profile.preparedContractVersion, '0.9.2')
assert.equal(profile.mcp.url, 'https://mcp.dwsoffshorepartners.com/mcp')
assert.equal(profile.mcp.tokenEndpointAuthMethod, 'none')
for (const channel of channels) assert.ok(existsSync(join(distribution, channel, 'README.md')), `${channel} README`)
let count = 0
function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    if (['.venv', '__pycache__', 'build', 'dist', 'node_modules'].includes(name)) continue
    const path = join(dir, name)
    const stat = lstatSync(path)
    assert.ok(!stat.isSymbolicLink(), `${path}: no symlinks`)
    if (stat.isDirectory()) { walk(path); continue }
    assert.ok(stat.isFile(), 'regular source files only')
    assert.ok(!/\.(pem|key|p12|env)$/i.test(name), `${path}: no private key files`)
    assert.ok(!name.startsWith('.env'), `${path}: no environment files`)
    if (name.endsWith('.json')) JSON.parse(readFileSync(path, 'utf8'))
    if (name.endsWith('.md')) {
      const text = readFileSync(path, 'utf8')
      for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
        const link = match[1]
        if (/^[a-z][a-z\d+.-]*:|^#|^\$|^</i.test(link)) continue
        const target = resolve(dirname(path), decodeURIComponent(link.split('#')[0]))
        assert.ok(existsSync(target), `${relative(root, path)} has a missing local link: ${link}`)
      }
    }
    count++
  }
}
walk(distribution)
for (const [file, name] of [['server.json', 'com.dwsoffshorepartners/ultiwrite'], ['server.github.json', 'io.github.dennis430/ultiwrite']]) {
  const server = load(`distribution/registry/${file}`)
  assert.equal(server.name, name)
  assert.equal(server.$schema, 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json')
  assert.ok(server.description.length > 0 && server.description.length <= 100, 'registry description limit')
  assert.equal(server.version, profile.preparedPackageVersion)
  assert.deepEqual(server.remotes, [{ type: 'streamable-http', url: profile.mcp.url }])
  assert.ok(!server.packages, 'remote-only manifest has no npm publishing dependency')
}
const cursor = load('cursor/.cursor-plugin/plugin.json')
assert.equal(cursor.version, profile.preparedPackageVersion)
const links = load('distribution/cursor/install-links.json')
const uri = new URL(links.cursorUri)
assert.equal(uri.protocol, 'cursor:')
assert.deepEqual(JSON.parse(Buffer.from(uri.searchParams.get('config'), 'base64').toString()), { url: profile.mcp.url })
const ms = load('distribution/microsoft/appPackage/ai-plugin.json')
assert.equal(ms.runtimes[0].type, 'RemoteMCPServer')
assert.equal(ms.runtimes[0].auth.type, 'OAuthPluginVault')
assert.equal(ms.runtimes[0].spec.url, profile.mcp.url)
assert.deepEqual(ms.runtimes[0].run_for_functions, ['*'])
const instructions = load('distribution/microsoft/appPackage/declarativeAgent.json').instructions
assert.match(instructions, /handoffId/)
assert.match(readFileSync(join(root, 'cursor/skills/submit-evidence/SKILL.md'), 'utf8'), /handoffId: returnedHandoffId/)
console.log(`Seven-channel source validated (${count} files). Account provisioning, authenticated host journeys and marketplace approval are not asserted.`)
