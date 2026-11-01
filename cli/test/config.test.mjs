import test from 'node:test'
import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'jsonc-parser'
import { configureClient, MCP_URL, resolveConfigPath } from '../lib/config.mjs'

async function fixture(t) {
  const root = await mkdtemp(path.join(await realpath(os.tmpdir()), 'ultiwrite-config-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const file = path.join(root, 'settings.json')
  return { root, file, options: { client: 'cursor', configPath: file } }
}

test('install creates a restricted config and repeat install does not rewrite it', async t => {
  const { file, options } = await fixture(t)
  const installed = await configureClient(options)
  assert.equal(installed.changed, true)
  assert.equal(installed.installed, true)
  assert.equal(installed.backupPath, undefined)
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), { mcpServers: { ultiwrite: { url: MCP_URL } } })
  if (process.platform !== 'win32') assert.equal((await stat(file)).mode & 0o777, 0o600)
  const before = await stat(file)
  const again = await configureClient(options)
  assert.equal(again.changed, false)
  assert.equal(again.backupPath, undefined)
  assert.equal((await stat(file)).mtimeMs, before.mtimeMs)
})

test('JSONC comments, other connections, BOM, CRLF, and exact backup bytes survive', async t => {
  const { file, options } = await fixture(t)
  const original = '\uFEFF{\r\n\t// keep my settings\r\n\t"theme": "dark",\r\n\t"mcpServers": {\r\n\t\t"other": {"command": "node", "env": {"TOKEN": "preserve-secret"}},\r\n\t},\r\n}\r\n'
  await writeFile(file, original, { mode: 0o640 })
  if (process.platform !== 'win32') await chmod(file, 0o640)
  const result = await configureClient(options)
  const output = await readFile(file, 'utf8')
  assert.equal(output[0], '\uFEFF')
  assert.match(output, /\/\/ keep my settings/)
  assert.equal(output.replaceAll('\r\n', '').includes('\n'), false)
  const parsed = parse(output.slice(1))
  assert.equal(parsed.theme, 'dark')
  assert.deepEqual(parsed.mcpServers.other, { command: 'node', env: { TOKEN: 'preserve-secret' } })
  assert.equal(parsed.mcpServers.ultiwrite.url, MCP_URL)
  assert.equal(await readFile(result.backupPath, 'utf8'), original)
  assert.equal(JSON.stringify(result).includes('preserve-secret'), false)
  if (process.platform !== 'win32') {
    assert.equal((await stat(result.backupPath)).mode & 0o777, 0o600)
    assert.equal((await stat(file)).mode & 0o777, 0o640)
  }
})

test('dry-run does not create directories or change files', async t => {
  const { root, file, options } = await fixture(t)
  const target = path.join(root, 'new-directory', 'mcp.json')
  const dryNew = await configureClient({ ...options, configPath: target, dryRun: true })
  assert.equal(dryNew.changed, true)
  assert.equal(dryNew.installed, false)
  assert.deepEqual(await readdir(root), [])
  await writeFile(file, '{ "mcpServers": {} }\n')
  const before = await readFile(file)
  const dryExisting = await configureClient({ ...options, dryRun: true })
  assert.equal(dryExisting.changed, true)
  assert.deepEqual(await readFile(file), before)
  assert.deepEqual(await readdir(root), ['settings.json'])
})

test('refuses malformed, ambiguous, or non-object configurations without changing bytes', async t => {
  const { file, options } = await fixture(t)
  for (const original of ['{"token":"sensitive",broken}', '[]', '{} {}', '', '{"mcpServers":[]}', '{"mcpServers":null}', '{"mcpServers":{},"mcpServers":{}}', '{"else":{"a":1,"a":2}}']) {
    await writeFile(file, original)
    await assert.rejects(configureClient(options), error => {
      assert.equal(error.message.includes('sensitive'), false)
      return true
    })
    assert.equal(await readFile(file, 'utf8'), original)
  }
  assert.deepEqual(await readdir(path.dirname(file)), ['settings.json'])
})

test('refuses invalid UTF-8 and keeps the original bytes', async t => {
  const { file, options } = await fixture(t)
  const original = Buffer.from([123, 34, 255, 34, 58, 49, 125])
  await writeFile(file, original)
  await assert.rejects(configureClient(options), /UTF-8/)
  assert.deepEqual(await readFile(file), original)
})

test('existing same-name connection is a conflict until explicit force', async t => {
  const { file, options } = await fixture(t)
  const original = JSON.stringify({ mcpServers: { ultiwrite: { url: 'https://other.example/mcp', headers: { Authorization: 'a-secret' } }, other: { command: 'preserve' } } })
  await writeFile(file, original)
  const status = await configureClient({ ...options, action: 'status' })
  assert.equal(status.installed, false)
  assert.equal(status.conflict, true)
  assert.equal(JSON.stringify(status).includes('a-secret'), false)
  await assert.rejects(configureClient(options), /--force/)
  await assert.rejects(configureClient({ ...options, action: 'uninstall' }), /--force/)
  assert.equal(await readFile(file, 'utf8'), original)
  const forced = await configureClient({ ...options, force: true })
  assert.equal(forced.installed, true)
  assert.equal(await readFile(forced.backupPath, 'utf8'), original)
  const parsed = JSON.parse(await readFile(file, 'utf8'))
  assert.deepEqual(parsed.mcpServers.ultiwrite, { url: MCP_URL })
  assert.deepEqual(parsed.mcpServers.other, { command: 'preserve' })
})

test('a command connection cannot masquerade as the hosted endpoint', async t => {
  const { file, options } = await fixture(t)
  await writeFile(file, JSON.stringify({ mcpServers: { ultiwrite: { url: MCP_URL, command: 'something-else' } } }))
  await assert.rejects(configureClient(options), /unrelated entry/)
})

test('migrates the owned legacy URL while preserving user choices', async t => {
  const { file, options } = await fixture(t)
  await writeFile(file, JSON.stringify({ mcpServers: { ultiwrite: { type: 'streamableHttp', url: 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp', disabled: true, autoApprove: ['user-approved-tool'] } } }))
  const result = await configureClient({ ...options, client: 'cline' })
  assert.equal(result.changed, true)
  const entry = JSON.parse(await readFile(file, 'utf8')).mcpServers.ultiwrite
  assert.deepEqual(entry, { type: 'streamableHttp', url: MCP_URL, disabled: true, autoApprove: ['user-approved-tool'] })
})

test('uninstall removes only Ultiwrite and remains idempotent', async t => {
  const { file, options } = await fixture(t)
  await writeFile(file, '{\n // retain this\n "mcpServers": {"other": {"url": "https://other.example"}, "ultiwrite": {"url": "https://mcp.dwsoffshorepartners.com/mcp"}},\n "theme": "dark"\n}\n')
  const result = await configureClient({ ...options, action: 'uninstall' })
  assert.equal(result.changed, true)
  assert.equal(result.installed, false)
  const text = await readFile(file, 'utf8')
  assert.match(text, /retain this/)
  assert.deepEqual(parse(text), { mcpServers: { other: { url: 'https://other.example' } }, theme: 'dark' })
  assert.equal((await configureClient({ ...options, action: 'uninstall' })).changed, false)
  assert.equal((await configureClient({ ...options, action: 'status' })).installed, false)
})

test('status and uninstall on missing configurations do not create a file', async t => {
  const { root, options } = await fixture(t)
  for (const action of ['status', 'uninstall']) {
    const result = await configureClient({ ...options, action })
    assert.equal(result.installed, false)
    assert.equal(result.changed, false)
  }
  assert.deepEqual(await readdir(root), [])
})

test('client-specific transport shapes are correct', async t => {
  const { root } = await fixture(t)
  const expected = {
    'claude-code': ['mcpServers', { type: 'http', url: MCP_URL }],
    vscode: ['servers', { type: 'http', url: MCP_URL }],
    windsurf: ['mcpServers', { serverUrl: MCP_URL }],
    cline: ['mcpServers', { type: 'streamableHttp', url: MCP_URL, disabled: false, autoApprove: [] }],
  }
  for (const [client, [key, entry]] of Object.entries(expected)) {
    const configPath = path.join(root, `${client}.json`)
    await configureClient({ client, configPath })
    assert.deepEqual(JSON.parse(await readFile(configPath, 'utf8')), { [key]: { ultiwrite: entry } })
  }
})

test('symlink files and symlink ancestors are refused without touching their targets', { skip: process.platform === 'win32' }, async t => {
  const { root, file, options } = await fixture(t)
  const target = path.join(root, 'real.json')
  await writeFile(target, '{"keep":true}\n')
  await symlink(target, file)
  await assert.rejects(configureClient(options), /symbolic link/)
  assert.equal(await readFile(target, 'utf8'), '{"keep":true}\n')
  const realDir = path.join(root, 'real-directory')
  const linkDir = path.join(root, 'linked-directory')
  await mkdir(realDir)
  await symlink(realDir, linkDir)
  await assert.rejects(configureClient({ ...options, configPath: path.join(linkDir, 'new.json') }), /symbolic link/)
  assert.deepEqual(await readdir(realDir), [])
})

test('configuration path must name a regular file', async t => {
  const { root, options } = await fixture(t)
  await assert.rejects(configureClient({ ...options, configPath: root }), /regular file/)
})

test('resolves default, project, custom-profile, and platform-specific paths', () => {
  const base = { cwd: '/repo', home: '/users/test', platform: 'linux', env: {} }
  assert.equal(resolveConfigPath({ ...base, client: 'cursor' }), '/users/test/.cursor/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'cursor', scope: 'project' }), '/repo/.cursor/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'claude-code' }), '/users/test/.claude.json')
  assert.equal(resolveConfigPath({ ...base, client: 'claude-code', scope: 'project' }), '/repo/.mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode' }), '/users/test/.config/Code/User/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode', scope: 'project' }), '/repo/.vscode/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode', env: { XDG_CONFIG_HOME: '/xdg' } }), '/xdg/Code/User/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode', env: { XDG_CONFIG_HOME: 'relative-not-allowed-by-xdg' } }), '/users/test/.config/Code/User/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode', platform: 'darwin' }), '/users/test/Library/Application Support/Code/User/mcp.json')
  assert.equal(resolveConfigPath({ client: 'vscode', platform: 'win32', home: 'C:\\Users\\dennis', cwd: 'C:\\src', env: { APPDATA: 'D:\\Roaming' } }), 'D:\\Roaming\\Code\\User\\mcp.json')
  assert.equal(resolveConfigPath({ client: 'vscode', platform: 'win32', home: 'C:\\Users\\dennis', cwd: 'C:\\src', env: {} }), 'C:\\Users\\dennis\\AppData\\Roaming\\Code\\User\\mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'vscode', configPath: './custom-profile/mcp.json' }), '/repo/custom-profile/mcp.json')
  assert.equal(resolveConfigPath({ ...base, client: 'cline', configPath: 'cline.json' }), '/repo/cline.json')
  assert.throws(() => resolveConfigPath({ ...base, client: 'cline' }), /requires --config/)
  assert.throws(() => resolveConfigPath({ ...base, client: 'windsurf' }), /requires --config/)
  assert.throws(() => resolveConfigPath({ ...base, client: 'windsurf', scope: 'project', configPath: 'x.json' }), /does not support/)
  assert.throws(() => resolveConfigPath({ ...base, client: 'cursor', scope: 'wrong' }), /Scope/)
  assert.throws(() => resolveConfigPath({ ...base, client: 'cursor', configPath: '' }), /requires a file path/)
})
