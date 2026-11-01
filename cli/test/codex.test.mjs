import test from 'node:test'
import assert from 'node:assert/strict'
import { CODEX_MCP_URL, configureCodex, resolveCodexInvocation } from '../lib/codex.mjs'

const owned = (overrides = {}) => ({ name: 'ultiwrite', enabled: true, transport: { type: 'streamable_http', url: CODEX_MCP_URL }, auth_status: 'not_logged_in', ...overrides })

function nativeMock(entries = [], { mutationCode = 0, mutate = true, inspectCode = 0 } = {}) {
  const calls = []
  const run = async (args, options) => {
    calls.push({ args, options })
    if (args[1] === 'list') return { code: inspectCode, stdout: JSON.stringify(entries) }
    if (mutate && args[1] === 'add') entries = [...entries, owned()]
    if (mutate && args[1] === 'remove') entries = entries.filter(entry => entry.name !== 'ultiwrite')
    return { code: mutationCode, stdout: 'Private native output must never be forwarded.' }
  }
  return { run, calls }
}

test('Codex installation invokes native argv and verifies the saved entry', async () => {
  const native = nativeMock()
  const progress = []
  const result = await configureCodex({ run: native.run, onProgress: value => progress.push(value) })
  assert.equal(result.changed, true)
  assert.equal(result.installed, true)
  assert.equal(result.authentication, 'not_logged_in')
  assert.deepEqual(native.calls.map(call => call.args), [
    ['mcp', 'list', '--json'],
    ['mcp', 'add', 'ultiwrite', '--url', CODEX_MCP_URL],
    ['mcp', 'list', '--json'],
  ])
  assert.equal(native.calls[1].options.timeoutMs, 30_000)
  assert.equal(progress.length, 1)
})

test('Codex dry-run only inspects and reports the exact planned command', async () => {
  const native = nativeMock()
  const result = await configureCodex({ run: native.run, dryRun: true })
  assert.equal(result.changed, false)
  assert.equal(result.installed, false)
  assert.equal(result.wouldChange, true)
  assert.equal(native.calls.length, 1)
  assert.deepEqual(result.command, ['codex', 'mcp', 'add', 'ultiwrite', '--url', CODEX_MCP_URL])
})

test('existing clean and legacy Ultiwrite entries preserve native settings and grants', async () => {
  for (const url of [CODEX_MCP_URL, 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp']) {
    const native = nativeMock([owned({ transport: { type: 'streamable_http', url, http_headers: { Authorization: 'private-marker' } } })])
    const result = await configureCodex({ run: native.run, force: true })
    assert.equal(result.changed, false)
    assert.equal(result.installed, true)
    assert.equal(native.calls.length, 1)
    assert.doesNotMatch(JSON.stringify(result), /private-marker|http_headers|Authorization/)
  }
})

test('status output redacts configuration fields and unknown auth strings', async () => {
  const native = nativeMock([owned({ auth_status: 'secret-marker', transport: { type: 'streamable_http', url: CODEX_MCP_URL, bearer_token_env_var: 'private-marker' } })])
  const result = await configureCodex({ run: native.run, action: 'status' })
  assert.equal(result.authentication, 'unknown')
  assert.doesNotMatch(JSON.stringify(result), /secret-marker|private-marker|bearer_token_env_var/)
  assert.equal(native.calls.length, 1)
})

test('disabled existing entry is reported without silently resetting options', async () => {
  const native = nativeMock([owned({ enabled: false })])
  const result = await configureCodex({ run: native.run })
  assert.equal(result.installed, true)
  assert.equal(result.enabled, false)
  assert.match(result.nextSteps[0], /disabled/)
  assert.equal(native.calls.length, 1)
})

test('same-name third-party entry is protected even with force', async () => {
  for (const action of ['install', 'uninstall']) {
    const native = nativeMock([owned({ transport: { type: 'streamable_http', url: 'https://unrelated.example/mcp?secret-marker' } })])
    await assert.rejects(configureCodex({ run: native.run, action, force: true }), error => {
      assert.match(error.message, /different Codex MCP entry/)
      assert.doesNotMatch(error.message, /unrelated|secret-marker/)
      return true
    })
    assert.equal(native.calls.length, 1)
  }
})

test('status distinguishes a conflicting entry without printing its content', async () => {
  const native = nativeMock([owned({ transport: { type: 'stdio', command: 'private-marker' } })])
  const result = await configureCodex({ run: native.run, action: 'status' })
  assert.equal(result.conflict, true)
  assert.equal(result.present, true)
  assert.equal(result.installed, false)
  assert.doesNotMatch(JSON.stringify(result), /private-marker/)
})

test('uninstall uses native remove and verifies absence; missing entry is a no-op', async () => {
  const native = nativeMock([owned()])
  const result = await configureCodex({ run: native.run, action: 'uninstall' })
  assert.equal(result.changed, true)
  assert.equal(result.installed, false)
  assert.deepEqual(native.calls[1].args, ['mcp', 'remove', 'ultiwrite'])
  const absent = nativeMock()
  assert.equal((await configureCodex({ run: absent.run, action: 'uninstall' })).changed, false)
  assert.equal(absent.calls.length, 1)
})

test('OAuth failure after native config save reports configuration separately', async () => {
  const native = nativeMock([], { mutationCode: 1 })
  const result = await configureCodex({ run: native.run })
  assert.equal(result.installed, true)
  assert.equal(result.changed, true)
  assert.equal(result.loginPending, true)
  assert.match(result.nextSteps.join(' '), /codex mcp login ultiwrite/)
})

test('native command success without a saved entry is not reported as installed', async () => {
  const native = nativeMock([], { mutate: false })
  await assert.rejects(configureCodex({ run: native.run }), /did not confirm installation/)
})

test('failed inspection never falls through to a mutating command or leaks native output', async () => {
  const native = nativeMock([], { inspectCode: 1 })
  await assert.rejects(configureCodex({ run: native.run }), /Could not inspect/)
  assert.equal(native.calls.length, 1)
  await assert.rejects(configureCodex({ run: async () => { throw new Error('private-marker') } }), error => {
    assert.doesNotMatch(error.message, /private-marker/)
    return true
  })
})

test('malformed, duplicate and unsupported native output fail before any write', async () => {
  for (const stdout of ['private-marker', '{}', '[{}]', JSON.stringify([owned(), owned()]), JSON.stringify([owned({ enabled: 'true' })])]) {
    let calls = 0
    await assert.rejects(configureCodex({ run: async () => { calls++; return { code: 0, stdout } } }), error => {
      assert.doesNotMatch(error.message, /private-marker/)
      return true
    })
    assert.equal(calls, 1)
  }
})

test('project scope and arbitrary config paths are rejected before subprocesses', async () => {
  const native = nativeMock()
  await assert.rejects(configureCodex({ run: native.run, scope: 'project' }), /native user configuration/)
  await assert.rejects(configureCodex({ run: native.run, configPath: '/tmp/config.toml' }), /native user configuration/)
  assert.equal(native.calls.length, 0)
})

test('POSIX resolver uses absolute PATH entries and never current-directory commands', async () => {
  const attempted = []
  const result = await resolveCodexInvocation({ platform: 'linux', env: { PATH: ':relative:/opt/bin' }, canAccess: async path => { attempted.push(path); return true } })
  assert.deepEqual(result, { file: '/opt/bin/codex', prefix: [] })
  assert.deepEqual(attempted, ['/opt/bin/codex'])
})

test('Windows npm shim launches verified package JS through Node without a shell', async () => {
  const prefix = 'C:\\Program Files\\nodejs'
  const script = `${prefix}\\node_modules\\@openai\\codex\\bin\\codex.js`
  const files = new Set([`${prefix}\\codex.cmd`, script])
  const result = await resolveCodexInvocation({
    platform: 'win32', env: { Path: `"${prefix}"` }, nodePath: 'C:\\node.exe',
    canAccess: async path => files.has(path),
    readText: async () => JSON.stringify({ name: '@openai/codex', bin: { codex: './bin/codex.js' } }),
  })
  assert.deepEqual(result, { file: 'C:\\node.exe', prefix: [script] })
})

test('Windows native executable is preferred and unsupported shims fail safely', async () => {
  const result = await resolveCodexInvocation({ platform: 'win32', env: { PATH: 'C:\\bin' }, canAccess: async path => path.endsWith('codex.exe') })
  assert.deepEqual(result, { file: 'C:\\bin\\codex.exe', prefix: [] })
  for (const metadata of [{ name: 'other-package', bin: './bin/codex.js' }, { name: '@openai/codex', bin: '../../injected.js' }]) {
    await assert.rejects(resolveCodexInvocation({
      platform: 'win32', env: { Path: 'C:\\bin' },
      canAccess: async path => !/\.(exe|com)$/.test(path),
      readText: async () => JSON.stringify(metadata),
    }), error => error.code === 'CODEX_NOT_FOUND')
  }
})

test('missing CLI produces an actionable installation error', async () => {
  await assert.rejects(resolveCodexInvocation({ env: { PATH: '' } }), error => {
    assert.equal(error.code, 'CODEX_NOT_FOUND')
    assert.match(error.message, /npm install -g @openai\/codex/)
    return true
  })
})
