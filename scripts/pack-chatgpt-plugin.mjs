#!/usr/bin/env node
// Build/check only the public ChatGPT package. Never publishes or rewrites another host archive.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'chatgpt')
const out = join(root, 'release')
const files = ['LICENSE', 'README.md', 'assets/logo.png', 'mcp.json', 'plugin.json', 'skills/ultiwrite-read/SKILL.md'].sort()
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const all = []
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else all.push(relative(source, path).replaceAll('\\', '/'))
  }
}
walk(source)
assert.deepEqual(all.sort(), files, 'ChatGPT archive must match the six-file public allowlist')
const manifest = JSON.parse(readFileSync(join(source, 'plugin.json'), 'utf8'))
assert.equal(manifest.name, 'ultiwrite')
assert.equal(manifest.version, '0.7.2')
const mcp = JSON.parse(readFileSync(join(source, 'mcp.json'), 'utf8'))
const endpoint = 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp'
assert.deepEqual(mcp.mcpServers, { ultiwrite: { type: 'streamable-http', url: endpoint } }, 'Preserve the server identity and omit unsupported per-server fields')
const filename = `ultiwrite-chatgpt-plugin-${manifest.version}.zip`
const args = process.argv.slice(2)
assert(args.every(arg => arg === '--check'), 'Usage: node scripts/pack-chatgpt-plugin.mjs [--check]')
const scratch = mkdtempSync(join(tmpdir(), 'ultiwrite-chatgpt-package-'))
try {
  const dest = join(scratch, filename)
  const python = `import pathlib, zipfile, json, sys
src = pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2], 'w', compression=zipfile.ZIP_STORED) as archive:
    for name in json.loads(sys.argv[3]):
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 29, 0, 0, 0))
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (src / name).read_bytes())
`
  const packed = spawnSync('python3', ['-c', python, source, dest, JSON.stringify(files)], { encoding: 'utf8' })
  if (packed.status !== 0) throw new Error(packed.stderr || 'ChatGPT packaging failed')
  const archive = readFileSync(dest)
  const digest = hash(archive)
  if (args.includes('--check')) {
    assert(readFileSync(join(out, filename)).equals(archive), 'ChatGPT archive differs from source')
    assert(readFileSync(join(out, 'SHA256SUMS.txt'), 'utf8').includes(`${digest}  ${filename}\n`), 'ChatGPT checksum differs')
  } else {
    mkdirSync(out, { recursive: true })
    writeFileSync(join(out, filename), archive)
    const inventoryPath = join(out, 'INVENTORY.json')
    const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'))
    inventory.chatgpt = { version: manifest.version, mcp_url: endpoint }
    inventory.packages = inventory.packages.filter(pack => pack.file !== `release/${filename}`)
    inventory.packages.push({ file: `release/${filename}`, version: manifest.version, mcp_url: endpoint,
      sha256: digest, bytes: archive.length, members: files.map(name => {
        const member = readFileSync(join(source, name))
        return { name, sha256: hash(member), bytes: member.length }
      }) })
    writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + '\n')
    writeFileSync(join(out, 'SHA256SUMS.txt'), inventory.packages.map(pack => `${pack.sha256}  ${pack.file.split('/').pop()}`).join('\n') + '\n')
  }
  process.stdout.write(`${args.includes('--check') ? 'verified' : 'built'} ${filename}: ${files.length} files, ${archive.length} bytes, sha256 ${digest}\n`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
