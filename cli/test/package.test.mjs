import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { copyFile, lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const expected = [
  'package.json', 'cli/bin/ultiwrite.mjs', 'cli/lib/config.mjs', 'cli/lib/codex.mjs',
  'cli/README.md', 'README.md', 'INSTALL.md', 'LICENSE', 'NOTICE',
].sort()

function npmScript() {
  const script = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    resolve(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].find(candidate => candidate && /\.[cm]?js$/.test(candidate) && existsSync(candidate))
  assert.ok(script, 'Run npm test so npm provides its absolute executable path.')
  return resolve(script)
}

test('npm package excludes private clutter and sockets while retaining exactly the public CLI files', async t => {
  // macOS TMPDIR is often too long for a Unix-domain socket path.
  const temporary = await mkdtemp(join(await realpath(process.platform === 'darwin' ? '/tmp' : tmpdir()), 'uw-pack-'))
  const fixture = join(temporary, 'source')
  const destination = join(temporary, 'packed')
  let socket
  t.after(async () => {
    if (socket?.listening) await new Promise(resolveClose => socket.close(resolveClose))
    await rm(temporary, { recursive: true, force: true, maxRetries: 3 })
  })
  await mkdir(fixture)
  await mkdir(destination)
  for (const filename of [...expected, '.npmignore']) {
    const target = join(fixture, filename)
    await mkdir(dirname(target), { recursive: true })
    await copyFile(join(root, filename), target)
  }
  const marker = 'synthetic-private-marker-DO-NOT-PACK'
  const privateFiles = [
    '.env', '.aws/credentials', 'client/extra.txt', 'cli/lib/private.mjs',
    'cli/bin/private.mjs', 'cli/test/fixture.json',
  ]
  for (const filename of privateFiles) {
    const target = join(fixture, filename)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, marker)
  }
  const npmrc = `# ${marker}\n`
  await writeFile(join(fixture, '.npmrc'), npmrc)
  const socketPath = join(fixture, '.codex', 'app-server-control', 'app-server-control.sock')
  await mkdir(dirname(socketPath), { recursive: true })
  if (process.platform === 'win32') await writeFile(socketPath, marker)
  else {
    socket = createServer()
    await new Promise((resolveListen, rejectListen) => {
      socket.once('error', rejectListen)
      socket.listen(socketPath, resolveListen)
    })
    assert.equal((await lstat(socketPath)).isSocket(), true)
  }
  const packed = spawnSync(process.execPath, [npmScript(), 'pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', destination], {
    cwd: fixture, encoding: 'utf8', shell: false, timeout: 30_000,
    env: { ...process.env, npm_config_cache: join(temporary, 'cache'), npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' },
  })
  assert.equal(packed.error, undefined, packed.error?.message)
  assert.equal(packed.status, 0, packed.stderr)
  const archives = JSON.parse(packed.stdout)
  assert.equal(archives.length, 1)
  assert.equal(archives[0].name, '@ultiwrite/cli')
  assert.deepEqual(archives[0].files.map(file => file.path).sort(), expected)
  assert.doesNotMatch(packed.stdout + packed.stderr, new RegExp(marker))
  for (const filename of privateFiles) assert.equal(await readFile(join(fixture, filename), 'utf8'), marker)
  assert.equal(await readFile(join(fixture, '.npmrc'), 'utf8'), npmrc)
  if (process.platform === 'win32') assert.equal(await readFile(socketPath, 'utf8'), marker)
  else assert.equal((await lstat(socketPath)).isSocket(), true)
  assert.equal((await lstat(join(destination, archives[0].filename))).isFile(), true)
})
