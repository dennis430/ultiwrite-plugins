#!/usr/bin/env node
// Validate exactly the Git source candidate, including new non-ignored files.
// Installed dependencies and local tenant environments are not distribution.
// Tracked files are always included, even if an ignore rule matches them.
import { spawnSync } from 'node:child_process'
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const inventory = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
})
if (inventory.error) throw inventory.error
if (inventory.status !== 0) throw new Error(`Cannot read Git source inventory: ${inventory.stderr.trim()}`)
const files = [...new Set(inventory.stdout.split('\0').filter(Boolean))].sort()
if (!files.length) throw new Error('The Git source inventory is empty')
const exported = mkdtempSync(join(tmpdir(), 'ultiwrite-public-source-'))
try {
  for (const relative of files) {
    const source = resolve(root, relative)
    if (!source.startsWith(resolve(root) + sep)) throw new Error(`Unsafe source path: ${relative}`)
    if (!lstatSync(source).isFile()) throw new Error(`Public source must be a regular file: ${relative}`)
    const destination = join(exported, relative)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
  }
  const result = spawnSync(process.execPath, [join(root, 'scripts/validate-public-plugins.mjs'), exported], {
    cwd: root, stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Public source validation failed (${result.status})`)
  console.log(`Validated ${files.length} source files from Git's tracked and non-ignored candidate inventory.`)
} finally {
  rmSync(exported, { recursive: true, force: true })
}
