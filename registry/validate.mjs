import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const root = fileURLToPath(new URL('..', import.meta.url))
const inputs = [
  ['registry/server.json', 'mcp-server.json', 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json', false],
  ['copilot/plugin.json', 'agent-plugin.json', 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', true],
  ['copilot/mcp.json', 'agent-mcp.json', 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', true],
]
const at = process.argv.indexOf('--schemas')
if (at >= 0 && !process.argv[at + 1]) throw new Error('--schemas needs a directory containing the official downloaded schemas')
const local = at < 0 ? undefined : resolve(process.argv[at + 1])

for (const [file, name, url, modern] of inputs) {
  let text
  if (local) text = await readFile(resolve(local, name), 'utf8')
  else {
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20_000) })
    if (!response.ok) throw new Error(`Official schema unavailable: ${url} (${response.status})`)
    text = await response.text()
    if (text.length > 512_000) throw new Error('Unexpectedly large schema')
  }
  const schema = JSON.parse(text)
  if (schema.$id !== url) throw new Error(`Unexpected official schema identity for ${file}`)
  const engine = new (modern ? Ajv2020 : Ajv)({ allErrors: true, strict: false })
  addFormats(engine)
  const validate = engine.compile(schema)
  const value = JSON.parse(await readFile(resolve(root, file), 'utf8'))
  if (!validate(value)) throw new Error(`${file}: ${engine.errorsText(validate.errors, { separator: '\n' })}`)
  console.log(`${file}: PASS official schema; sha256=${createHash('sha256').update(text).digest('hex')}`)
}
