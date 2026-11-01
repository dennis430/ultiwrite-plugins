#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { lstat, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url))
const REGISTRY = 'https://registry.npmjs.org/'
export const PACKED_FILES = Object.freeze([
  'package.json', 'README.md', 'INSTALL.md', 'LICENSE', 'NOTICE',
  'cli/README.md', 'cli/bin/ultiwrite.mjs', 'cli/lib/config.mjs', 'cli/lib/codex.mjs',
])
const PACKAGE_FILES = PACKED_FILES.filter(file => file !== 'package.json').sort()

export function validatePackage(pkg) {
  assert.equal(pkg.name, '@ultiwrite/cli', 'This launcher only publishes @ultiwrite/cli from its repository')
  assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Invalid package version')
  assert.deepEqual(pkg.bin, { ultiwrite: 'cli/bin/ultiwrite.mjs' }, 'Unexpected executable mapping')
  assert.ok(Array.isArray(pkg.files), 'Missing package file allowlist')
  assert.deepEqual([...pkg.files].sort(), PACKAGE_FILES, 'The package file allowlist changed; review it before publishing')
  assert.deepEqual(pkg.dependencies, { 'jsonc-parser': '3.3.1' }, 'Unexpected dependency; review the release first')
  assert.ok(!pkg.private, 'The package must be public')
  assert.equal(pkg.publishConfig?.access, 'public', 'Expected public package access')
  assert.equal(pkg.publishConfig?.registry, REGISTRY, 'Unexpected publishing registry')
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack', 'postpack', 'prepublish']) {
    assert.ok(!Object.hasOwn(pkg.scripts || {}, hook), `Unexpected lifecycle hook: ${hook}`)
  }
  for (const kind of ['devDependencies', 'optionalDependencies', 'peerDependencies', 'bundledDependencies', 'bundleDependencies']) {
    assert.ok(!pkg[kind] || Object.keys(pkg[kind]).length === 0, `Unexpected ${kind}; review the release first`)
  }
}

export function validateArchive(entries, pkg) {
  assert.ok(Array.isArray(entries) && entries.length === 1, 'npm must produce exactly one package')
  const archive = entries[0]
  assert.equal(archive.name, pkg.name, 'Packed package identity changed')
  assert.equal(archive.version, pkg.version, 'Packed version changed')
  assert.equal(archive.filename, `ultiwrite-cli-${pkg.version}.tgz`, 'Unexpected tarball filename')
  assert.ok(Array.isArray(archive.files), 'npm did not return its packed file manifest')
  assert.deepEqual(archive.files.map(file => file.path).sort(), [...PACKED_FILES].sort(), 'Tarball contains unexpected or missing files; nothing was published')
  assert.match(archive.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/, 'Missing tarball integrity')
  return archive
}

export function parseOptions(args) {
  if (args.length === 0) return { dryRun: false }
  if (args.length === 1 && args[0] === '--dry-run') return { dryRun: true }
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { help: true }
  throw new Error('Usage: node scripts/publish-cli.mjs [--dry-run]. No directory or package argument is accepted.')
}

function npmInvocation() {
  const envPath = Object.entries(process.env).find(([key]) => key.toLowerCase() === 'path')?.[1] || ''
  const directories = [path.dirname(process.execPath), ...envPath.split(path.delimiter)].filter(dir => path.isAbsolute(dir))
  const candidates = [process.env.npm_execpath, ...directories.flatMap(dir => [
    path.join(dir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.resolve(dir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ])]
  const script = candidates.find(file => file && path.isAbsolute(file) && path.basename(file) === 'npm-cli.js' && existsSync(file))
  if (!script) throw new Error('Cannot locate npm beside Node.js. Install Node.js 22+ with npm, or run npm run release:check from this repository.')
  return { file: process.execPath, prefix: [script] }
}

function makeRunner() {
  const invocation = npmInvocation()
  return (args, { cwd, capture = false, cache }) => new Promise((resolve, reject) => {
    const child = spawn(invocation.file, [...invocation.prefix, ...args], {
      cwd, shell: false, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      env: { ...process.env, npm_config_cache: cache, npm_config_audit: 'false', npm_config_fund: 'false' },
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', chunk => { stdout += chunk; if (stdout.length > 4 * 1024 * 1024) child.kill() })
    child.stderr?.on('data', chunk => { stderr += chunk; if (stderr.length > 4 * 1024 * 1024) child.kill() })
    child.once('error', reject)
    child.once('close', code => resolve({ code, stdout, stderr }))
  })
}

const integrity = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`

export async function publishRelease({ dryRun = false, run, root = REPOSITORY_ROOT, log = console.log, interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) } = {}) {
  // This path comes from this script's location, never the caller's working directory.
  const cwd = await realpath(root)
  const manifestPath = path.join(cwd, 'package.json')
  const original = await readFile(manifestPath)
  const pkg = JSON.parse(original)
  validatePackage(pkg)
  assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'Node.js 22 or newer is required')
  const execute = run || makeRunner()
  const temporary = await mkdtemp(path.join(await realpath(tmpdir()), 'ultiwrite-release-'))
  const cache = path.join(temporary, 'npm-cache')
  async function checked(args, capture = false) {
    const result = await execute(args, { cwd, capture, cache })
    if (result.code !== 0) throw new Error(`npm ${args[0]} failed. Resolve the reported error before publishing.`)
    return result.stdout
  }
  try {
    log(`Preparing ${pkg.name}@${pkg.version} from ${cwd}`)
    await checked(['ci', '--ignore-scripts', '--no-audit', '--no-fund', `--registry=${REGISTRY}`])
    await checked(['audit', '--omit=dev', '--audit-level=high', `--registry=${REGISTRY}`])
    for (const name of ['build', 'test', 'validate', 'test:package']) {
      await checked(['run', name])
    }
    assert.ok(original.equals(await readFile(manifestPath)), 'package.json changed during validation; rerun the launcher')
    const packed = await checked(['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], true)
    const archive = validateArchive(JSON.parse(packed), pkg)
    const tarball = path.join(temporary, archive.filename)
    assert.ok((await lstat(tarball)).isFile(), 'The packed artifact is not a regular file')
    assert.equal(integrity(await readFile(tarball)), archive.integrity, 'Tarball integrity mismatch')
    log(`Verified ${PACKED_FILES.length} allowed files in ${archive.filename}`)
    if (dryRun) {
      log('Dry run passed. No npm authentication was requested and nothing was published.')
      return { published: false, dryRun: true, name: pkg.name, version: pkg.version, files: [...PACKED_FILES] }
    }
    let account = await execute(['whoami', `--registry=${REGISTRY}`], { cwd, capture: true, cache })
    if ((account.code !== 0 || !account.stdout.trim()) && interactive) {
      log('Sign in through npm with the account permitted to publish @ultiwrite/cli. Complete its browser and two-factor prompts.')
      const login = await execute(['login', `--registry=${REGISTRY}`], { cwd, capture: false, cache })
      if (login.code === 0) account = await execute(['whoami', `--registry=${REGISTRY}`], { cwd, capture: true, cache })
    }
    if (account.code !== 0 || !account.stdout.trim()) {
      throw new Error(`npm authentication is not ready. Run npm login --registry=${REGISTRY}, complete sign-in with the account allowed to publish @ultiwrite/cli, then rerun PUBLISH.cmd or npm run release. No package was published.`)
    }
    assert.equal(integrity(await readFile(tarball)), archive.integrity, 'Tarball changed before publication')
    // All release checks already ran. Publish exactly the inspected tarball.
    await checked(['publish', tarball, '--access', 'public', `--registry=${REGISTRY}`, '--ignore-scripts'])
    log(`Published ${pkg.name}@${pkg.version}. Verify with npx @ultiwrite/cli@${pkg.version} --version.`)
    return { published: true, name: pkg.name, version: pkg.version, files: [...PACKED_FILES] }
  } finally {
    await rm(temporary, { recursive: true, force: true, maxRetries: 3 })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseOptions(process.argv.slice(2))
    if (options.help) console.log('Usage: node scripts/publish-cli.mjs [--dry-run]\nAlways uses this repository; --dry-run validates without authentication or publication.')
    else await publishRelease(options)
  } catch (error) {
    console.error(`Release stopped: ${error.message}`)
    process.exitCode = 1
  }
}
