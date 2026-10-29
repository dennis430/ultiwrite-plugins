#!/usr/bin/env node
// Build/check only the Cursor package. Never publishes or rewrites other host packages.
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicLayout = existsSync(join(root, 'cursor/.cursor-plugin/plugin.json'))
const source = join(root, publicLayout ? 'cursor' : 'packaging/cursor-plugin')
const out = join(root, publicLayout ? 'release' : 'public/downloads')
const endpoint = 'https://mcp.dwsoffshorepartners.com/mcp'
const allowed = ['.cursor-plugin/plugin.json', 'LICENSE', 'README.md', 'assets/logo.png', 'mcp.json', 'skills/ultiwrite/SKILL.md'].sort()
const forbidden = [
  ['engine', 'dwsoffshorepartners', 'com'].join('.'), 'client' + '_secret',
  'DATABASE' + '_URL', 'NEXTAUTH' + '_SECRET', '-----BEGIN' + ' ', 'postgres' + '://',
  'gh' + 'p_', 'github' + '_pat_', 'Bearer ' + 'ey',
]
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

function collect(dir = source, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (lstatSync(path).isSymbolicLink()) throw new Error('symlinks are not distributable')
    if (lstatSync(path).isDirectory()) collect(path, files)
    else files.push(relative(source, path).replaceAll('\\', '/'))
  }
  return files.sort()
}

const files = collect()
if (JSON.stringify(files) !== JSON.stringify(allowed)) throw new Error('Cursor source differs from public six-file allowlist')
for (const file of files.filter(file => !file.endsWith('.png'))) {
  const text = readFileSync(join(source, file), 'utf8')
  if (forbidden.some(needle => text.includes(needle))) throw new Error(`${file} contains forbidden material`)
}
const manifest = JSON.parse(readFileSync(join(source, '.cursor-plugin/plugin.json'), 'utf8'))
const mcp = JSON.parse(readFileSync(join(source, 'mcp.json'), 'utf8'))
if (manifest.name !== 'ultiwrite' || manifest.version !== '0.7.2') throw new Error('Cursor identity/version drift')
if (JSON.stringify(mcp.mcpServers) !== JSON.stringify({ ultiwrite: { type: 'streamable-http', url: endpoint } })) {
  throw new Error('Cursor must configure exactly one remote Ultiwrite server with no static credentials')
}
const filename = `ultiwrite-cursor-plugin-${manifest.version}.zip`
const args = process.argv.slice(2)
if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/pack-cursor-plugin.mjs [--check]')
const scratch = mkdtempSync(join(tmpdir(), 'ultiwrite-cursor-package-'))
try {
  const dest = join(scratch, filename)
  const python = `import pathlib, zipfile, json, sys
src, dest = pathlib.Path(sys.argv[1]), sys.argv[2]
with zipfile.ZipFile(dest, 'w', compression=zipfile.ZIP_STORED) as archive:
    for name in json.loads(sys.argv[3]):
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 29, 0, 0, 0))
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (src / name).read_bytes())
`
  const result = spawnSync('python3', ['-c', python, source, dest, JSON.stringify(files)], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || 'Cursor packaging failed')
  const bytes = readFileSync(dest)
  const digest = hash(bytes)
  if (args.includes('--check')) {
    if (!readFileSync(join(out, filename)).equals(bytes)) throw new Error(`${filename} differs from source; rebuild it`)
    const sumFile = publicLayout ? 'SHA256SUMS.txt' : `ultiwrite-plugin-${manifest.version}-SHA256SUMS.txt`
    if (!readFileSync(join(out, sumFile), 'utf8').includes(`${digest}  ${filename}\n`)) throw new Error('Cursor checksum receipt differs')
  } else {
    mkdirSync(out, { recursive: true })
    writeFileSync(join(out, filename), bytes)
    if (publicLayout) {
      const inventoryPath = join(out, 'INVENTORY.json')
      const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'))
      inventory.cursor = { version: manifest.version, mcp_url: endpoint }
      inventory.packages = inventory.packages.filter(pack => pack.file !== `release/${filename}`)
      inventory.packages.push({
        file: `release/${filename}`, version: manifest.version, mcp_url: endpoint,
        sha256: digest, bytes: bytes.length,
        members: files.map(name => {
          const member = readFileSync(join(source, name))
          return { name, sha256: hash(member), bytes: member.length }
        }),
      })
      writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + '\n')
      writeFileSync(join(out, 'SHA256SUMS.txt'), inventory.packages.map(pack => `${pack.sha256}  ${pack.file.split('/').pop()}`).join('\n') + '\n')
    } else {
      const receipt = join(out, `ultiwrite-plugin-${manifest.version}-SHA256SUMS.txt`)
      const retained = existsSync(receipt) ? readFileSync(receipt, 'utf8').split('\n').filter(line => line && !line.endsWith(`  ${filename}`)) : []
      writeFileSync(receipt, [...retained, `${digest}  ${filename}`].join('\n') + '\n')
    }
  }
  process.stdout.write(`${args.includes('--check') ? 'verified' : 'built'} ${filename}: ${files.length} files, ${bytes.length} bytes, sha256 ${digest}\n`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
