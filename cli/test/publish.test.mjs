import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { PACKED_FILES, REPOSITORY_ROOT, parseOptions, publishRelease, validateArchive, validatePackage } from '../../scripts/publish-cli.mjs'

const baseline = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'))
const bytes = Buffer.from('isolated test tarball')
const manifest = pkg => ({
  name: pkg.name, version: pkg.version, filename: `ultiwrite-cli-${pkg.version}.tgz`,
  files: PACKED_FILES.map(file => ({ path: file })),
  integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
})

async function fixture(t, { auth = true, packExtra } = {}) {
  const root = await mkdtemp(path.join(await realpath(tmpdir()), 'ultiwrite-release-test-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await writeFile(path.join(root, 'package.json'), JSON.stringify(baseline))
  const calls = []
  let authorized = auth
  const run = async (args, options) => {
    calls.push({ args, ...options })
    assert.equal(options.cwd, root, 'npm must use the anchored repository path')
    if (args[0] === 'pack') {
      const out = args[args.indexOf('--pack-destination') + 1]
      assert.ok(!out.startsWith(`${root}${path.sep}`), 'Tarballs must be outside the repository')
      const record = manifest(baseline)
      if (packExtra) record.files.push({ path: packExtra })
      await writeFile(path.join(out, record.filename), bytes)
      return { code: 0, stdout: JSON.stringify([record]), stderr: '' }
    }
    if (args[0] === 'login') authorized = true
    if (args[0] === 'whoami') return { code: authorized ? 0 : 1, stdout: authorized ? 'authorized-publisher\n' : '', stderr: authorized ? '' : 'ENEEDAUTH secret-should-not-echo' }
    return { code: 0, stdout: '', stderr: '' }
  }
  return { root, calls, run, log: () => {}, interactive: false }
}

test('publisher accepts only its package, bin, file allowlist, and reviewed dependency', () => {
  validatePackage(baseline)
  for (const change of [
    { name: 'home-folder' }, { bin: { other: 'run.js' } }, { files: ['**/*'] },
    { dependencies: { 'react-email': '*' } }, { scripts: { ...baseline.scripts, install: 'node unexpected.js' } },
    { optionalDependencies: { extra: '*' } },
  ]) assert.throws(() => validatePackage({ ...baseline, ...change }))
})

test('archive rejects home files, sockets, missing files, and unsafe tarball paths', () => {
  validateArchive([manifest(baseline)], baseline)
  for (const extra of ['.codex/app-server-control.sock', '.npmrc', 'upload/private.pdf', '../outside']) {
    const bad = manifest(baseline)
    bad.files.push({ path: extra })
    assert.throws(() => validateArchive([bad], baseline), /unexpected or missing files/)
  }
  const missing = manifest(baseline)
  missing.files.pop()
  assert.throws(() => validateArchive([missing], baseline))
  assert.throws(() => validateArchive([{ ...manifest(baseline), filename: '../wrong.tgz' }], baseline))
})

test('dry run anchors every subprocess and never checks auth or publishes', async t => {
  const context = await fixture(t)
  assert.notEqual(context.root, process.cwd())
  assert.equal(path.resolve(REPOSITORY_ROOT), path.resolve(fileURLToPath(new URL('../../', import.meta.url))))
  const result = await publishRelease({ ...context, dryRun: true })
  assert.equal(result.published, false)
  assert.deepEqual(context.calls.map(call => call.args[0]), ['ci', 'audit', 'run', 'run', 'run', 'run', 'pack'])
  assert.deepEqual(context.calls.filter(call => call.args[0] === 'run').map(call => call.args[1]), ['build', 'test', 'validate', 'test:package'])
})

test('unverified packed content blocks authentication and publication', async t => {
  const context = await fixture(t, { packExtra: '.codex/app-server-control.sock' })
  await assert.rejects(publishRelease(context), /unexpected or missing files/)
  assert.ok(context.calls.every(call => !['whoami', 'publish'].includes(call.args[0])))
})

test('missing npm authorization gives a login action without echoing credentials', async t => {
  const context = await fixture(t, { auth: false })
  await assert.rejects(publishRelease(context), error => {
    assert.match(error.message, /npm login --registry=https:\/\/registry.npmjs.org\//)
    assert.ok(!error.message.includes('secret-should-not-echo'))
    return true
  })
  assert.ok(context.calls.every(call => call.args[0] !== 'publish'))
})

test('publishing passes only the validated absolute tarball and inherits npm interaction', async t => {
  const context = await fixture(t)
  assert.equal((await publishRelease(context)).published, true)
  const publish = context.calls.find(call => call.args[0] === 'publish')
  assert.ok(path.isAbsolute(publish.args[1]))
  assert.equal(path.basename(publish.args[1]), `ultiwrite-cli-${baseline.version}.tgz`)
  assert.deepEqual(publish.args.slice(2), ['--access', 'public', '--registry=https://registry.npmjs.org/', '--ignore-scripts'])
  assert.equal(publish.capture, false)
})

test('interactive publishing offers npm login then verifies the signed-in account', async t => {
  const context = await fixture(t, { auth: false })
  assert.equal((await publishRelease({ ...context, interactive: true })).published, true)
  assert.deepEqual(context.calls.filter(call => ['whoami', 'login', 'publish'].includes(call.args[0])).map(call => call.args[0]), ['whoami', 'login', 'whoami', 'publish'])
  assert.equal(context.calls.find(call => call.args[0] === 'login').capture, false)
})

test('the launcher accepts no caller-selected folder or package', () => {
  assert.deepEqual(parseOptions([]), { dryRun: false })
  assert.deepEqual(parseOptions(['--dry-run']), { dryRun: true })
  for (const args of [['--cwd', 'C:\\Users\\dennis'], ['.'], ['--dry-run', '--dry-run']]) assert.throws(() => parseOptions(args))
})
