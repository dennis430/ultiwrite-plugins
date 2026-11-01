import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, realpath, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const bin = fileURLToPath(new URL('../bin/ultiwrite.mjs', import.meta.url))
const run = (args, cwd) => spawnSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8', timeout: 10000 })
async function fixture(t) {
  const folder = await realpath(await mkdtemp(join(tmpdir(), 'ultiwrite-command-')))
  t.after(() => rm(folder, { recursive: true, force: true }))
  return folder
}

test('help, version and client inventory run without touching settings', async t => {
  const folder = await fixture(t)
  assert.match(run([], folder).stdout, /Usage: ultiwrite/)
  assert.equal(run(['--version'], folder).stdout.trim(), '0.1.0')
  const result = run(['clients', '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  const clients = JSON.parse(result.stdout)
  assert.ok(clients.some(client => client.id === 'cursor'))
  assert.ok(clients.some(client => client.id === 'claude-desktop' && client.hosted))
  assert.deepEqual(await readdir(folder), [])
})

test('complete command journey preserves unrelated secrets without printing them', async t => {
  const folder = await fixture(t)
  const file = join(folder, 'profile with spaces.json')
  const original = '{\n  // keep this comment\n  "mcpServers": {"other": {"url": "https://example.test", "headers": {"Authorization": "synthetic-private-value"}}}\n}\n'
  await writeFile(file, original)
  let result = run(['install', 'cursor', '--config', file, '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).installed, true)
  assert.equal(JSON.parse(result.stdout).changed, true)
  assert.doesNotMatch(result.stdout + result.stderr, /synthetic-private-value/)
  const installed = await readFile(file, 'utf8')
  assert.match(installed, /keep this comment/)
  assert.match(installed, /synthetic-private-value/)
  result = run(['status', 'cursor', '--config', file, '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).installed, true)
  result = run(['install', 'cursor', '--config', file, '--json'], folder)
  assert.equal(JSON.parse(result.stdout).changed, false)
  assert.equal(await readFile(file, 'utf8'), installed)
  result = run(['uninstall', 'cursor', '--config', file, '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).installed, false)
  assert.match(await readFile(file, 'utf8'), /synthetic-private-value/)
  assert.equal(run(['status', 'cursor', '--config', file], folder).status, 1)
})

test('project install and claude alias use the correct configuration shapes', async t => {
  const folder = await fixture(t)
  let result = run(['install', 'claude', '--scope', 'project', '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(await readFile(join(folder, '.mcp.json'), 'utf8')), {
    mcpServers: { ultiwrite: { type: 'http', url: 'https://mcp.dwsoffshorepartners.com/mcp' } },
  })
  result = run(['install', 'vscode', '--scope', 'project', '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(await readFile(join(folder, '.vscode', 'mcp.json'), 'utf8')).servers.ultiwrite.type, 'http')
})

test('dry run creates neither directories nor files', async t => {
  const folder = await fixture(t)
  const result = run(['install', 'cursor', '--scope', 'project', '--dry-run', '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  const value = JSON.parse(result.stdout)
  assert.equal(value.dryRun, true)
  assert.equal(value.changed, true)
  assert.equal(value.installed, false)
  assert.deepEqual(await readdir(folder), [])
})

test('unsupported or ambiguous flags fail before any mutation', async t => {
  const folder = await fixture(t)
  for (const args of [
    ['install'], ['install', 'missing'], ['install', 'cursor', '--all'],
    ['install', 'cursor', '--scope', 'other'], ['install', 'cursor', '--config'],
    ['install', 'codex', '--scope', 'project'], ['install', 'cursor', '--offline'],
    ['status', 'cursor', '--force'], ['install', 'cursor', '--force', '--force'],
    ['doctor', '--scope', 'user'], ['clients', 'cursor'],
    ['install', 'chatgpt', '--config', 'anything.json'],
  ]) {
    const result = run(args, folder)
    assert.equal(result.status, 2, `${args.join(' ')}: ${result.stderr}`)
  }
  for (const client of ['cline', 'windsurf']) assert.equal(run(['install', client], folder).status, 1)
  assert.deepEqual(await readdir(folder), [])
})

test('hosted client commands provide honest setup instructions with no configuration claim', async t => {
  const folder = await fixture(t)
  for (const client of ['chatgpt', 'claude-desktop', 'grok']) {
    for (const command of ['install', 'status', 'uninstall']) {
      const result = run([command, client, '--json'], folder)
      assert.equal(result.status, 0, result.stderr)
      const value = JSON.parse(result.stdout)
      assert.equal(value.installed, null)
      assert.equal(value.changed, false)
      assert.equal(value.managedBy, 'host-account')
    }
  }
  assert.deepEqual(await readdir(folder), [])
})

test('offline doctor states that neither connectivity nor account authorization was checked', async t => {
  const folder = await fixture(t)
  const result = run(['doctor', '--offline', '--json'], folder)
  assert.equal(result.status, 0, result.stderr)
  const value = JSON.parse(result.stdout)
  assert.equal(value.endpoint, 'https://mcp.dwsoffshorepartners.com/mcp')
  assert.equal(value.checked, false)
  assert.equal(value.authenticated, false)
  assert.equal(Object.hasOwn(value, 'ok'), false)
  assert.deepEqual(await readdir(folder), [])
})
