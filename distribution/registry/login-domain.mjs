#!/usr/bin/env node
import { createPrivateKey } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import { spawnSync } from 'node:child_process'

const path = process.argv[2]
const method = process.argv.length === 5 && process.argv[3] === '--method' ? process.argv[4] : 'dns'
if (!path || ![3, 5].includes(process.argv.length) || !isAbsolute(path) || !['dns', 'http'].includes(method) || (process.argv.length === 5 && process.argv[3] !== '--method')) {
  console.error('Usage: node login-domain.mjs /absolute/private/publisher-key.pem [--method dns|http]')
  process.exit(2)
}
try {
  const key = createPrivateKey(readFileSync(path))
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('Expected an Ed25519 key.')
  const raw = Buffer.from(key.export({ format: 'jwk' }).d, 'base64url').toString('hex')
  // The CLI requires an argument. No shell interpolation or key logging is used.
  const result = spawnSync('mcp-publisher', ['login', method, '--domain', 'dwsoffshorepartners.com', '--private-key', raw], { stdio: 'inherit', shell: false })
  if (result.error) throw new Error('Could not run mcp-publisher. Install the official CLI and check PATH.')
  process.exit(result.status ?? 1)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
