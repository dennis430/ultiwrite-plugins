#!/usr/bin/env node
// Thin provider example. All investigation operations remain in the canonical MCP service.
import { readFile } from 'node:fs/promises'

const provider = process.argv[2] ?? 'openai'
if (!['openai', 'xai'].includes(provider)) throw new Error('Choose openai or xai.')
const key = process.env[provider === 'openai' ? 'OPENAI_API_KEY' : 'XAI_API_KEY']
const token = process.env.ULTIWRITE_OAUTH_ACCESS_TOKEN
const model = process.env.ULTIWRITE_MODEL
if (!key || !token || !model) throw new Error('Configure the provider key, a customer-scoped Ultiwrite OAuth access token and ULTIWRITE_MODEL in this process environment.')
const catalog = JSON.parse(await readFile(new URL('../catalog.json', import.meta.url), 'utf8'))
const allowEvidence = process.env.ULTIWRITE_ALLOW_EVIDENCE === '1'
const allowed = catalog.tools.filter(tool => allowEvidence || tool.annotations.readOnlyHint).map(tool => tool.name)
const tool = { type: 'mcp', server_label: 'ultiwrite', server_url: catalog.endpoint,
  authorization: token, allowed_tools: allowed }
if (provider === 'openai') tool.require_approval = 'always'
// xAI explicitly does not implement require_approval. Evidence must be enabled only for an authorized task.
const response = await fetch(provider === 'openai' ? 'https://api.openai.com/v1/responses' : 'https://api.x.ai/v1/responses', {
  method: 'POST', redirect: 'error', signal: AbortSignal.timeout(300000),
  headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
  body: JSON.stringify({ model, input: process.env.ULTIWRITE_PROMPT ?? 'Explain the supported Ultiwrite workflow and confirm the connected account. Do not submit evidence or start a new investigation.', tools: [tool] }),
})
if (!response.ok) throw new Error(`Provider request failed (${response.status}). No completion is claimed; check saved jobs before retrying a write.`)
const result = await response.json()
for (const item of result.output ?? []) {
  if (item.type === 'mcp_approval_request') {
    process.stdout.write(`${JSON.stringify({ status: 'approval_required', responseId: result.id, approvalRequestId: item.id, tool: item.name })}\n`)
  }
  for (const content of item.content ?? []) if (content.type === 'output_text') process.stdout.write(`${content.text}\n`)
}
if (result.output_text) process.stdout.write(`${result.output_text}\n`)
