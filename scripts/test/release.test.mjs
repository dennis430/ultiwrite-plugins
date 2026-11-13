import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { after, before, test } from 'node:test'

const root = fileURLToPath(new URL('../..', import.meta.url))
const execute = promisify(execFile)
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const digest = async path => createHash('sha256').update(await readFile(path)).digest('hex')
let scratch
let fixture
let frozen

async function pack(...args) {
  return execute(process.execPath, [join(fixture, 'scripts/pack-public-connectors.mjs'), ...args], {
    cwd: scratch, encoding: 'utf8', maxBuffer: 1024 * 1024,
  })
}

before(async () => {
  scratch = await mkdtemp(join(await realpath(tmpdir()), 'ultiwrite-release-test-'))
  fixture = join(scratch, 'public-tree')
  await cp(root, fixture, { recursive: true, filter: path => !['.git', 'node_modules', 'dist', 'coverage', '.cache'].includes(basename(path)) })
  // Fresh canonical exports have no historical ZIPs. Seed one inside the test
  // fixture so preservation is still exercised before a public-repo merge.
  await pack()
  await cp(join(fixture, 'release/ultiwrite-chatgpt-plugin-0.10.0.zip'), join(fixture, 'release/ultiwrite-chatgpt-plugin-0.0.0.zip'))
  const hostVersion = (await readJson(join(fixture, 'hosts/matrix.json'))).packageVersion
  const currentArchives = new Set([`ultiwrite-host-adapters-${hostVersion}.zip`,
    'ultiwrite-chatgpt-plugin-0.10.0.zip', 'ultiwrite-cursor-plugin-0.10.0.zip', 'Ultiwrite_Claude_Plugin_v0.10.0.zip'])
  frozen = new Map(await Promise.all((await readdir(join(fixture, 'release')))
    .filter(name => name.endsWith('.zip') && !currentArchives.has(name))
    .map(async name => [name, await digest(join(fixture, 'release', name))])))
})
after(async () => { if (scratch) await rm(scratch, { recursive: true, force: true }) })

test('combined release preserves ChatGPT identity, prompts, artwork and all plugin identities and the host bundle', async () => {
  const plugin = await readJson(join(root, 'chatgpt/plugin.json'))
  assert.equal(plugin.name, 'ultiwrite')
  assert.equal(plugin.version, '0.10.0')
  const openai = plugin.extensions['com.openai']
  assert.equal(openai.interface.category, 'Business & Operations')
  assert.ok(openai.interface.shortDescription.length <= 30)
  assert.deepEqual(openai.interface.defaultPrompt, [
    'What can Ultiwrite establish about my commercial evidence, and how do I start an analysis?',
    'Submit these files to Ultiwrite for Commercial Diligence.',
    'Show my latest diligence report and how I can download it.',
  ])
  assert.equal(openai.review.test_cases.positive.length, 5)
  assert.equal(openai.review.test_cases.negative.length, 3)
  assert.equal(openai.onboardingSkill, './skills/connect-account/SKILL.md')
  assert.deepEqual((await readJson(join(root, 'chatgpt/mcp.json'))).mcpServers, {
    ultiwrite: { type: 'streamable-http', url: 'https://mcp.dwsoffshorepartners.com/mcp' },
  })
  assert.equal(await digest(join(root, 'chatgpt/assets/logo.png')), 'cc0a3c229347e47a154a00c9e6dfa774c0e1f07ee9fc063935af5bc4897f4b18')
  for (const [host, manifest] of [['claude', '.claude-plugin'], ['cursor', '.cursor-plugin']]) {
    assert.equal((await readJson(join(root, host, manifest, 'plugin.json'))).version, '0.10.0')
  }
})

test('packing records exact source, refuses stale metadata claims and preserves historical archives', async () => {
  for (const name of ['node_modules', 'dist', 'coverage', '.cache']) {
    await mkdir(join(fixture, name), { recursive: true })
    await writeFile(join(fixture, name, 'generated.txt'), 'not release source')
  }
  await writeFile(join(fixture, 'test-package.tgz'), 'not release source')
  const manifestPath = join(fixture, 'RELEASE_MANIFEST.json')
  const manifest = await readJson(manifestPath)
  manifest.future_release_metadata = { retained: true }
  manifest.packages.cli = { version: 'fixture-only', published: false }
  manifest.packages.chatgpt.extra_provenance = 'retained'
  await writeFile(manifestPath, JSON.stringify(manifest))
  const result = await pack()
  assert.match(result.stdout, /packed 4 current archives/)
  const rebuilt = await readJson(manifestPath)
  assert.equal(rebuilt.future_release_metadata, undefined)
  assert.equal(rebuilt.packages.cli, undefined)
  assert.equal(rebuilt.packages.chatgpt.extra_provenance, undefined)
  assert.equal(rebuilt.packages.chatgpt.version, '0.10.0')
  assert.equal(rebuilt.packages.hosts.version, '0.11.0', 'the host bundle versions independently of released plugins')
  assert.equal(rebuilt.packages.hosts.zip, 'release/ultiwrite-host-adapters-0.11.0.zip')
  assert.ok(!rebuilt.files.some(item => /^(node_modules|dist|coverage|\.cache)\//.test(item.path) || item.path.endsWith('.tgz')))
  assert.ok(frozen.size >= 1, 'historical archive preservation must be exercised')
  for (const [name, hash] of frozen) assert.equal(await digest(join(fixture, 'release', name)), hash, name)
  assert.match((await pack('--check')).stdout, /checked 4 current archives/)
})

test('source/archive verification rejects a changed workflow', async () => {
  const path = join(fixture, 'chatgpt/skills/read-report/SKILL.md')
  const original = await readFile(path)
  try {
    await writeFile(path, Buffer.concat([original, Buffer.from('\nchanged after packing\n')]))
    await assert.rejects(pack('--check'), error => /out of date/.test(error.stderr))
  } finally { await writeFile(path, original) }
})

test('a private configuration file is rejected before the archive changes', async () => {
  const path = join(fixture, '.env.local')
  const archive = join(fixture, 'release/ultiwrite-chatgpt-plugin-0.10.0.zip')
  const beforeHash = await digest(archive)
  try {
    await writeFile(path, 'PRIVATE_FIXTURE=true\n')
    await assert.rejects(pack(), error => /forbidden.*path|Refusing a private package path/.test(error.stderr))
    assert.equal(await digest(archive), beforeHash)
  } finally { await rm(path, { force: true }) }
})

test('a source symlink cannot escape the release tree', { skip: process.platform === 'win32' }, async () => {
  const outside = join(scratch, 'outside.txt')
  const link = join(fixture, 'chatgpt/assets/outside.txt')
  try {
    await writeFile(outside, 'fixture outside the source tree')
    await symlink(outside, link)
    await assert.rejects(pack(), error => /nonregular release path|nonregular package source|must be a regular file or directory/.test(error.stderr))
  } finally { await rm(link, { force: true }) }
})


test('enterprise directory inventory rejects overclaims, escaping links and missing dependencies', async () => {
  const path = join(fixture, 'hosts/submissions/profiles.json')
  const original = await readFile(path, 'utf8')
  const validate = async () => execute(process.execPath, [join(fixture, 'scripts/validate-public-plugins.mjs'), fixture], { encoding: 'utf8' })
  for (const [mutate, expected] of [
    [value => { value.endpoint = 'https://example.com/mcp' }, /endpoint or repository/],
    [value => { value.packageVersion = '0.0.0' }, /version must match/],
    [value => { value.profiles[0].hostAcceptance = 'PASS' }, /must not claim/],
    [value => { value.profiles[0].submissionStatus = 'APPROVED' }, /must not claim/],
    [value => { value.profiles[0].guide = '../../../outside.md' }, /escaped public path/],
    [value => { value.profiles[0].externalRequirements = [] }, /real external dependencies/],
    [value => { value.profiles.pop() }, /required platform exactly once/],
  ]) {
    try {
      const changed = JSON.parse(original)
      mutate(changed)
      await writeFile(path, JSON.stringify(changed))
      await assert.rejects(validate(), error => expected.test(error.stderr), expected.toString())
    } finally { await writeFile(path, original) }
  }
  assert.match((await validate()).stdout, /public plugin tree ok/)
})
