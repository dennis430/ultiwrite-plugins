#!/usr/bin/env node
// Build locally. No marketplace upload, registry publication, tenant provisioning,
// GitHub Actions, service deployment, or production investigation is performed.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const release = resolve(root, 'release')
const skipInstall = process.argv.includes('--skip-install')
const schemasAt = process.argv.indexOf('--schemas')
if (schemasAt >= 0 && !process.argv[schemasAt + 1]) throw new Error('--schemas needs a directory')

function run(command, args, cwd = root, shell = false) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status})`)
}
function npm(directory, args) {
  // All npm arguments below are fixed literals. Paths are passed as cwd, never
  // interpolated into a shell command. Windows requires cmd for npm.cmd.
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, resolve(root, directory), process.platform === 'win32')
}

if (!skipInstall) for (const directory of ['vscode', 'microsoft365', 'registry']) npm(directory, ['ci', '--ignore-scripts', '--no-audit', '--no-fund'])
npm('vscode', ['test'])
npm('vscode', ['run', 'package'])
npm('microsoft365', ['run', 'check'])
npm('microsoft365', ['run', 'build'])
run(process.execPath, ['registry/validate.mjs', ...(schemasAt < 0 ? [] : ['--schemas', resolve(process.argv[schemasAt + 1])])])
run(process.execPath, ['scripts/validate-microsoft-distribution.mjs'])
run(process.execPath, ['scripts/pack-public-connectors.mjs', '--check'])

const { deterministicZip } = await import('../microsoft365/scripts/lib.mjs')
const version = JSON.parse(readFileSync(resolve(root, 'copilot/plugin.json'))).version
mkdirSync(release, { recursive: true })
const pluginEntries = Object.fromEntries(['plugin.json', 'mcp.json', 'README.md', 'LICENSE'].map(file => [file, readFileSync(resolve(root, 'copilot', file))]))
const copilotName = `ultiwrite-copilot-plugin-${version}.zip`
writeFileSync(resolve(release, copilotName), deterministicZip(pluginEntries))
const vscodeName = `ultiwrite-vscode-${version}.vsix`
copyFileSync(resolve(root, 'vscode/dist', `ultiwrite-${version}.vsix`), resolve(release, vscodeName))
const m365Name = `ultiwrite-m365-source-${version}.zip`
copyFileSync(resolve(root, 'microsoft365/dist', m365Name), resolve(release, m365Name))
const names = [vscodeName, m365Name, copilotName]
const checksums = names.map(name => `${createHash('sha256').update(readFileSync(resolve(release, name))).digest('hex')}  ${name}`).join('\n') + '\n'
writeFileSync(resolve(release, 'MICROSOFT_SHA256SUMS.txt'), checksums)
const verification = readFileSync(resolve(release, 'MICROSOFT_VERIFICATION.json'))
const bundle = Object.fromEntries(names.map(name => [name, readFileSync(resolve(release, name))]))
Object.assign(bundle, {
  'SHA256SUMS.txt': Buffer.from(checksums),
  'MICROSOFT_VERIFICATION.json': verification,
  'DISTRIBUTION.md': readFileSync(resolve(root, 'DISTRIBUTION.md')),
  'registry/server.json': readFileSync(resolve(root, 'registry/server.json')),
  'registry/README.md': readFileSync(resolve(root, 'registry/README.md')),
})
writeFileSync(resolve(release, `Ultiwrite_Microsoft_Distribution_${version}.zip`), deterministicZip(bundle))
run(process.execPath, ['scripts/validate-public-source.mjs'])
console.log(`Built ${names.join(', ')} and the combined handoff. These are review candidates; no external publication occurred.`)
