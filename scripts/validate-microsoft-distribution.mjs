#!/usr/bin/env node
// Cross-package release contract. Official schema and host validation are recorded separately.
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.')
const read = file => JSON.parse(readFileSync(resolve(root, file), 'utf8'))
const endpoint = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
const plugin = read('copilot/plugin.json')
const mcp = read('copilot/mcp.json')
const market = read('.github/plugin/marketplace.json')
const registry = read('registry/server.json')

assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json')
assert.equal(plugin.name, 'ultiwrite')
assert.equal(plugin.license, 'MIT')
assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json')
assert.deepEqual(mcp.mcpServers, { ultiwrite: { type: 'streamable-http', url: endpoint } })
assert.equal(market.name, 'ultiwrite-copilot')
assert.equal(market.plugins.length, 1)
assert.deepEqual(market.plugins.map(({name, version, source, strict}) => ({name, version, source, strict})), [{ name: 'ultiwrite', version: plugin.version, source: './copilot', strict: true }])
assert.equal(registry.$schema, 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json')
assert.equal(registry.name, 'com.dwsoffshorepartners/ultiwrite')
assert.equal(registry.version, plugin.version)
assert.ok(registry.description.length <= 100)
assert.deepEqual(registry.remotes, [{ type: 'streamable-http', url: endpoint }])
assert.ok(!registry.packages, 'The remote-only service must not advertise an unpublished package')
assert.ok(!registry.repository, 'The connector repository is not the proprietary server source')
assert.ok(readFileSync(resolve(root, 'server.draft.json'), 'utf8').includes('NOT PUBLISHED'), 'Do not rewrite the historical registry draft as a publication claim')

for (const file of ['copilot/LICENSE', 'copilot/README.md', 'registry/README.md']) assert.ok(existsSync(resolve(root, file)), `Missing ${file}`)

if (existsSync(resolve(root, 'vscode/package.json'))) {
  const extension = read('vscode/package.json')
  assert.equal(extension.name, 'ultiwrite')
  assert.equal(extension.version, plugin.version)
  assert.equal(extension.license, 'MIT')
  assert.ok(extension.contributes?.mcpServerDefinitionProviders?.length, 'VS Code must register its MCP provider')
  assert.ok(!extension.enabledApiProposals?.length, 'Marketplace package must use stable VS Code APIs')
}

console.log('Microsoft distribution contract: PASS (portable plugin, marketplace, registry, extension identity)')
