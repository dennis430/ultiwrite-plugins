import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientConfig, credentialPath, expectedDoctor, pkce, redact } from '../lib/pure.mjs'

const bin = fileURLToPath(new URL('../bin/ultiwrite-mcp.js', import.meta.url))

const home = mkdtempSync(join(tmpdir(), 'ultiwrite-cli-'))
const offline = spawnSync(process.execPath, [bin, 'doctor', '--offline'], { encoding: 'utf8', env: { ...process.env, ULTIWRITE_HOME: home, HOME: home } })
assert.equal(offline.status, 0)
const doctor = JSON.parse(offline.stdout)
assert.equal(doctor.endpoint, expectedDoctor().endpoint)
assert.deepEqual(doctor.scopes, ['ultiwrite:read', 'ultiwrite:evidence'])
assert.equal(offline.stdout.includes('access_token'), false)

const config = spawnSync(process.execPath, [bin, 'config'], { encoding: 'utf8', env: { ...process.env, HOME: home, ULTIWRITE_HOME: home } })
assert.equal(config.status, 0)
assert.deepEqual(JSON.parse(config.stdout), clientConfig())
assert.equal(config.stdout.includes('Bearer'), false)

const codes = pkce()
assert.equal(codes.method, 'S256')
assert.notEqual(codes.verifier, codes.challenge)
assert.deepEqual(redact({ access_token: 'secret', refresh_token: 'other', ok: true }), { access_token: '[redacted]', refresh_token: '[redacted]', ok: true })

const { writeFile, mkdir, chmod } = await import('node:fs/promises')
const path = credentialPath({ ULTIWRITE_HOME: home, HOME: home })
await mkdir(join(home, '.config', 'ultiwrite'), { recursive: true })
await writeFile(path, JSON.stringify({ access_token: 'not-printed' }), { mode: 0o600 })
await chmod(path, 0o600)
assert.equal(statSync(path).mode & 0o777, 0o600)
assert.equal(readFileSync(path, 'utf8').includes('not-printed'), true)

const loggedOut = spawnSync(process.execPath, [bin, 'logout'], { encoding: 'utf8', env: { ...process.env, HOME: home, ULTIWRITE_HOME: home } })
assert.equal(loggedOut.status, 0)
assert.equal(loggedOut.stdout.includes('not-printed'), false)
assert.match(loggedOut.stderr, /removed/)
assert.throws(() => statSync(path))

console.log('ultiwrite-mcp cli tests passed')
