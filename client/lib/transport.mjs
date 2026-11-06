/** Decode complete SSE events, forwarding notifications immediately and ending at our response. */
export async function readRpcResponse(response, id, notify = () => {}) {
  const matches = value => value?.jsonrpc === '2.0' && value.id === id && ('result' in value || 'error' in value)
  if (!(response.headers.get('content-type') ?? '').includes('text/event-stream')) {
    const value = await response.json()
    if (!matches(value)) throw new Error('Ultiwrite returned an invalid protocol response.')
    return value
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', data = [], bytes = 0
  const event = () => {
    if (!data.length) return null
    const value = JSON.parse(data.join('\n'))
    data = []; bytes = 0
    if (matches(value)) return value
    if (value?.jsonrpc === '2.0' && value.id === undefined && typeof value.method === 'string') notify(value)
    return null
  }
  try {
    for (;;) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      if (buffer.length + bytes > 2 * 1024 * 1024) throw new Error('Ultiwrite returned an oversized stream event.')
      let at
      // CRLF, LF and CR are all valid SSE line endings, including split CRLF chunks.
      while ((at = buffer.search(/[\r\n]/)) >= 0) {
        if (buffer[at] === '\r' && at === buffer.length - 1 && !done) break
        const line = buffer.slice(0, at)
        const width = buffer[at] === '\r' && buffer[at + 1] === '\n' ? 2 : 1
        buffer = buffer.slice(at + width)
        if (!line) { const result = event(); if (result) return result }
        else if (line.startsWith('data:')) { const part = line.slice(5).replace(/^ /, ''); data.push(part); bytes += part.length }
      }
      if (done) throw new Error('Ultiwrite stream ended before the matching response. Check the saved job before retrying a write.')
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

export function requestHeaders(message, { version, sessionId } = {}) {
  const modern = message.params?._meta?.['io.modelcontextprotocol/protocolVersion']
  const headers = {}
  if (modern || version) headers['mcp-protocol-version'] = modern || version
  if (sessionId && !modern) headers['mcp-session-id'] = sessionId
  if (modern) {
    headers['mcp-method'] = message.method
    const name = message.method === 'resources/read' ? message.params?.uri
      : ['tools/call', 'prompts/get'].includes(message.method) ? message.params?.name : undefined
    if (typeof name === 'string') headers['mcp-name'] = /^[\x20-\x7e]*$/.test(name) && name.trim() === name && !(name.startsWith('=?base64?') && name.endsWith('?='))
      ? name : `=?base64?${Buffer.from(name).toString('base64')}?=`
  }
  return headers
}
