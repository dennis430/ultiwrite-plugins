#!/usr/bin/env node
import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const target = process.argv[2]
if (!target || process.argv.length !== 3 || !isAbsolute(target)) {
  console.error('Usage: node prepare-domain.mjs /absolute/private/output-directory')
  process.exit(2)
}
const repo = realpathSync(fileURLToPath(new URL('../..', import.meta.url)))
// Resolve existing parent symlinks before enforcing the repository boundary.
let ancestor = resolve(target)
while (!existsSync(ancestor)) {
  const parent = dirname(ancestor)
  if (parent === ancestor) {
    console.error('The output drive or root is unavailable. Choose an existing local drive.')
    process.exit(2)
  }
  ancestor = parent
}
const physical = resolve(realpathSync(ancestor), relative(ancestor, resolve(target)))
const rel = relative(repo, physical)
if (!rel || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel))) {
  console.error('Choose a private output directory outside this repository.')
  process.exit(2)
}
if (existsSync(target)) {
  console.error('Output already exists. Refusing to overwrite ownership material.')
  process.exit(2)
}
mkdirSync(target, { recursive: true, mode: 0o700 })
const { privateKey, publicKey } = generateKeyPairSync('ed25519')
const jwk = publicKey.export({ format: 'jwk' })
const proof = `v=MCPv1; k=ed25519; p=${Buffer.from(jwk.x, 'base64url').toString('base64')}`
writeFileSync(join(target, 'publisher-key.pem'), privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600, flag: 'wx' })
writeFileSync(join(target, '.gitignore'), '*\n', { mode: 0o600, flag: 'wx' })
writeFileSync(join(target, 'dns-record.txt'), `Host: @\nType: TXT\nValue: ${proof}\n`, { flag: 'wx' })
writeFileSync(join(target, 'mcp-registry-auth'), `${proof}\n`, { flag: 'wx' })
console.log(`Created private ownership material in ${target}. Add the public value in dns-record.txt to the domain's apex TXT records. No network changes were made.`)
