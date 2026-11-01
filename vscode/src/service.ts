import { open, stat } from 'node:fs/promises';
import { basename } from 'node:path';

export const ORIGIN = 'https://dwsoffshorepartners.com';
export const MCP_PATH = '/api/integrations/ultiwrite/mcp';
export const MCP_URL = ORIGIN + MCP_PATH;
export const SCOPES = ['ultiwrite:read', 'ultiwrite:evidence'] as const;
export const TOOL_NAMES = ['ultiwrite_account_get', 'ultiwrite_capabilities_get', 'ultiwrite_cases_list', 'ultiwrite_case_status', 'ultiwrite_coherence_get', 'ultiwrite_findings_get', 'ultiwrite_report_export', 'ultiwrite_evidence_submit'] as const;
export type ToolName = typeof TOOL_NAMES[number];
export type JsonObject = Record<string, any>;
export type Fetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;
export type TokenGetter = (signal?: AbortSignal, refresh?: boolean) => Promise<string>;
export const READ_TIMEOUT_MS = 45_000;
export const ANALYSIS_TIMEOUT_MS = 300_000;

export class ServiceError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = 'ServiceError'; }
}

export function signalFor(signal?: AbortSignal, milliseconds = READ_TIMEOUT_MS): AbortSignal {
  return signal ? AbortSignal.any([signal, AbortSignal.timeout(milliseconds)]) : AbortSignal.timeout(milliseconds);
}

export async function readResponse(response: Response, maxBytes = 16 * 1024 * 1024): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ServiceError('The response is too large to display here. Open the saved report in your dashboard.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString('utf8');
}

export function parseRpc(text: string, contentType: string, id: number): JsonObject {
  let data: JsonObject | undefined;
  try {
    if (contentType.includes('text/event-stream')) {
      for (const event of text.replace(/\r\n/g, '\n').split('\n\n')) {
        const content = event.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!content) continue;
        const candidate = JSON.parse(content);
        if (candidate.id === id) data = candidate;
      }
    } else data = JSON.parse(text);
  } catch { throw new ServiceError('Ultiwrite returned an unreadable response. Check the case in your dashboard before retrying.'); }
  if (!data || data.id !== id || data.jsonrpc !== '2.0') throw new ServiceError('Ultiwrite returned an unexpected response. No result is assumed.');
  if (data.error) throw new ServiceError('Ultiwrite could not complete that request. Check account permissions and the saved case before retrying.');
  if (!data.result || typeof data.result !== 'object') throw new ServiceError('Ultiwrite did not return a result.');
  return data.result;
}

export function toolPayload(result: JsonObject): JsonObject {
  if (result.structuredContent && typeof result.structuredContent === 'object') return result.structuredContent;
  for (const part of result.content ?? []) {
    if (part.type !== 'text' || typeof part.text !== 'string') continue;
    try { const parsed = JSON.parse(part.text); if (parsed && typeof parsed === 'object') return parsed; } catch { /* Some tools return plain descriptive text. */ }
  }
  return { text: (result.content ?? []).filter((part: JsonObject) => part.type === 'text').map((part: JsonObject) => part.text).join('\n') };
}

export function safeServiceUrl(value: unknown, origin = ORIGIN): URL {
  if (typeof value !== 'string') throw new ServiceError('Ultiwrite did not return a usable link.');
  let url: URL;
  try { url = new URL(value); } catch { throw new ServiceError('Ultiwrite returned an invalid link.'); }
  if (url.origin !== origin || url.username || url.password || url.protocol !== new URL(origin).protocol) throw new ServiceError('The returned link is outside Ultiwrite. It was not opened.');
  return url;
}

export function safeUploadLink(value: unknown, origin = ORIGIN): URL {
  const url = safeServiceUrl(value, origin);
  if (url.pathname !== '/api/integrations/ultiwrite/upload' || !url.searchParams.get('t') || url.hash) throw new ServiceError('Ultiwrite did not return a valid upload handoff.');
  return url;
}

export function safeStorageUrl(value: unknown, origin = ORIGIN): URL {
  if (typeof value !== 'string') throw new ServiceError('The storage transfer URL is missing.');
  let url: URL;
  try { url = new URL(value); } catch { throw new ServiceError('The storage transfer URL is invalid.'); }
  const loopbackTest = new URL(origin).protocol === 'http:' && new URL(origin).hostname === '127.0.0.1' && url.origin === origin;
  if ((url.protocol !== 'https:' && !loopbackTest) || url.username || url.password || url.hash) throw new ServiceError('The storage transfer URL is not permitted.');
  // Storage is independently signed. Never forward Ultiwrite OAuth headers to it.
  return url;
}

export interface SelectedFile { path: string; name: string; size: number; contentType: string; mtimeMs: number; ino: number; }

export async function selectFiles(paths: string[]): Promise<SelectedFile[]> {
  if (!paths.length) throw new ServiceError('Select at least one file.');
  if (new Set(paths).size !== paths.length) throw new ServiceError('The selection contains a duplicate file.');
  const files = await Promise.all(paths.map(async path => {
    const value = await stat(path);
    if (!value.isFile() || !Number.isSafeInteger(value.size) || value.size <= 0) throw new ServiceError('Choose nonempty regular files. Folders are not uploaded.');
    return { path, name: basename(path), size: value.size, contentType: 'application/octet-stream', mtimeMs: value.mtimeMs, ino: value.ino };
  }));
  if (new Set(files.map(file => file.name)).size !== files.length) throw new ServiceError('Selected files must have distinct filenames. Rename duplicates before uploading.');
  return files;
}

export class ServiceClient {
  private nextId = 0;
  private sessionId?: string;
  private protocol = '2025-03-26';
  private initialized?: Promise<void>;
  private generation = 0;
  constructor(private readonly token: TokenGetter, private readonly fetcher: Fetcher = fetch, readonly origin = ORIGIN) {}

  reset(): void { this.generation++; this.initialized = undefined; this.sessionId = undefined; }

  private checkGeneration(value: number): void {
    if (value !== this.generation) throw new ServiceError('The account connection changed while the request was running. Check the current account and its cases before retrying.');
  }

  private async rpc(method: string, params: JsonObject, signal?: AbortSignal, notification = false): Promise<JsonObject> {
    const generation = this.generation;
    const id = notification ? undefined : ++this.nextId;
    const body = JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), method, params });
    const send = async (renew = false) => {
      const token = await this.token(signal, renew);
      this.checkGeneration(generation);
      return this.fetcher(this.origin + MCP_PATH, {
        method: 'POST', redirect: 'error', signal: signalFor(signal, method === 'tools/call' && params.name === 'ultiwrite_evidence_submit' ? ANALYSIS_TIMEOUT_MS : READ_TIMEOUT_MS),
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': this.protocol, ...(this.sessionId ? { 'mcp-session-id': this.sessionId } : {}) }, body,
      });
    };
    let response = await send();
    if (generation !== this.generation) { await response.body?.cancel(); this.checkGeneration(generation); }
    if (response.status === 401) { await response.body?.cancel(); response = await send(true); }
    if (generation !== this.generation) { await response.body?.cancel(); this.checkGeneration(generation); }
    if (!response.ok) { await response.body?.cancel(); throw new ServiceError(`Ultiwrite refused the request (${response.status}). Reconnect or check your account access.`, response.status); }
    const session = response.headers.get('mcp-session-id');
    if (session) this.sessionId = session;
    if (notification || response.status === 202 || response.status === 204) { await response.body?.cancel(); return {}; }
    const text = await readResponse(response);
    this.checkGeneration(generation);
    return parseRpc(text, response.headers.get('content-type') ?? '', id!);
  }

  private async initialize(signal?: AbortSignal): Promise<void> {
    const generation = this.generation;
    if (!this.initialized) this.initialized = (async () => {
      const result = await this.rpc('initialize', { protocolVersion: this.protocol, capabilities: {}, clientInfo: { name: 'ultiwrite-vscode', version: '0.1.0' } }, signal);
      if (typeof result.protocolVersion === 'string') this.protocol = result.protocolVersion;
      await this.rpc('notifications/initialized', {}, signal, true);
    })().catch(error => { if (generation === this.generation) { this.initialized = undefined; this.sessionId = undefined; } throw error; });
    return this.initialized;
  }

  async call(name: ToolName, args: JsonObject = {}, signal?: AbortSignal, allowUploadHandoff = false): Promise<JsonObject> {
    const generation = this.generation;
    if (!TOOL_NAMES.includes(name)) throw new ServiceError('That tool is not exposed by the Ultiwrite connector.');
    await this.initialize(signal);
    this.checkGeneration(generation);
    const result = await this.rpc('tools/call', { name, arguments: args }, signal);
    const payload = toolPayload(result);
    if (result.isError && !(allowUploadHandoff && name === 'ultiwrite_evidence_submit' && typeof payload.uploadLink === 'string')) {
      throw new ServiceError('Ultiwrite could not complete the action. Check your permissions, allowance, and saved case in the dashboard.');
    }
    return payload;
  }

  async followCase(caseId: string, progress: (state: string) => void, signal: AbortSignal, intervalMs = 5000, durationMs = 15 * 60_000): Promise<JsonObject | undefined> {
    const deadline = Date.now() + durationMs;
    while (Date.now() < deadline) {
      signal.throwIfAborted();
      const value = await this.call('ultiwrite_case_status', { caseId }, signal);
      const state = String(value.workflowStatus ?? value.status ?? 'processing');
      progress(state);
      if (typeof value.linkedReportId === 'string' || ['failed', 'action_required', 'complete', 'completed'].includes(state)) return value;
      if (value.continuation?.tool === 'ultiwrite_evidence_submit' && value.continuation.caseId === caseId) {
        const advanced = await this.call('ultiwrite_evidence_submit', { caseId }, signal);
        if (typeof advanced.linkedReportId === 'string') return advanced;
        if (typeof advanced.reportId === 'string') return { ...advanced, linkedReportId: advanced.reportId };
      }
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, intervalMs);
        const abort = () => { clearTimeout(timeout); signal.removeEventListener('abort', abort); reject(new DOMException('Monitoring cancelled', 'AbortError')); };
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) abort();
      });
    }
    return undefined;
  }

  private async post(url: URL, data: JsonObject, signal?: AbortSignal): Promise<JsonObject> {
    const generation = this.generation;
    safeServiceUrl(url.href, this.origin);
    const response = await this.fetcher(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data), redirect: 'error', signal: signalFor(signal, url.pathname === '/api/integrations/ultiwrite/upload' ? ANALYSIS_TIMEOUT_MS : READ_TIMEOUT_MS) });
    if (generation !== this.generation) { await response.body?.cancel(); this.checkGeneration(generation); }
    if (!response.ok) { await response.body?.cancel(); throw new ServiceError(`The upload step was refused (${response.status}). Check recent cases before starting another analysis.`, response.status); }
    let value: JsonObject;
    try { value = JSON.parse(await readResponse(response)); } catch { throw new ServiceError('The upload service returned an unreadable response.'); }
    this.checkGeneration(generation);
    if (value.ok === false) throw new ServiceError('The upload service did not confirm the transfer. Check the existing case before retrying.');
    return value;
  }

  async upload(files: SelectedFile[], documentForensics: boolean | undefined, progress: (message: string) => void, signal?: AbortSignal): Promise<JsonObject> {
    signal?.throwIfAborted();
    // Omission preserves the account/server default; false is only sent for an explicit user choice.
    const option = documentForensics === undefined ? {} : { documentForensics };
    const opened = await this.call('ultiwrite_evidence_submit', option, signal, true);
    const link = safeUploadLink(opened.uploadLink, this.origin);
    const staging = (step: string) => new URL(`/api/integrations/ultiwrite/upload/staging/${step}${link.search}`, link);
    const minted = await this.post(staging('presign'), { files: files.map(({ name, size, contentType }) => ({ name, size, contentType })) }, signal);
    if (!Array.isArray(minted.files) || minted.files.length !== files.length) throw new ServiceError('The upload plan does not match the selected files.');
    const receipts: JsonObject[] = [];
    for (let index = 0; index < files.length; index++) {
      signal?.throwIfAborted();
      const file = files[index];
      const plan = minted.files[index];
      if (plan.fileName !== file.name || plan.size !== file.size || plan.contentType !== file.contentType || typeof plan.uploadId !== 'string' || !plan.uploadId || typeof plan.bindingToken !== 'string' || !plan.bindingToken || !plan.expiresAt) throw new ServiceError('The upload plan does not match the selected file metadata.');
      if (!['single', 'multipart'].includes(plan.mode)) throw new ServiceError('The server returned an unsupported upload mode.');
      const receipt = Object.fromEntries(['uploadId', 'fileName', 'size', 'contentType', 'bindingToken', 'expiresAt'].map(key => [key, plan[key]]));
      const handle = await open(file.path, 'r');
      try {
        const current = await handle.stat();
        if (!current.isFile() || current.size !== file.size || current.mtimeMs !== file.mtimeMs || current.ino !== file.ino) throw new ServiceError('A selected file changed before upload. Select the files again.');
        const put = async (value: unknown, start: number, end: number): Promise<string | null> => {
          signal?.throwIfAborted();
          const target = safeStorageUrl(value, this.origin);
          const stream = handle.createReadStream({ start, end, autoClose: false });
          try {
            const request: RequestInit & { duplex: 'half' } = { method: 'PUT', redirect: 'error', signal: signalFor(signal, 300_000), headers: { 'content-length': String(end - start + 1), 'content-type': file.contentType }, body: stream as unknown as BodyInit, duplex: 'half' };
            const response = await this.fetcher(target, request);
            await response.body?.cancel();
            if (!response.ok) throw new ServiceError('A selected file did not reach storage. No final submission was sent.');
            return response.headers.get('etag');
          } finally { if (!stream.readableEnded) stream.destroy(); }
        };
        const complete: JsonObject = { uploadRef: receipt, uploadId: plan.uploadId, expectedSize: file.size };
        if (plan.mode === 'multipart') {
          if (!Number.isSafeInteger(plan.partSize) || plan.partSize <= 0 || typeof plan.multipartId !== 'string' || !plan.multipartId) throw new ServiceError('The server returned an invalid multipart plan.');
          const count = Math.ceil(file.size / plan.partSize);
          if (count > 10_000) throw new ServiceError('The multipart plan exceeds the supported number of parts.');
          const parts = [];
          for (let partNumber = 1; partNumber <= count; partNumber++) {
            const value = await this.post(staging('parts'), { uploadRef: receipt, uploadId: plan.uploadId, multipartId: plan.multipartId, partNumbers: [partNumber] }, signal);
            const part = (value.urls ?? []).find((entry: JsonObject) => entry.partNumber === partNumber);
            const etag = await put(part?.url, (partNumber - 1) * plan.partSize, Math.min(partNumber * plan.partSize, file.size) - 1);
            if (!etag) throw new ServiceError('Storage did not confirm the uploaded part. No final submission was sent.');
            parts.push({ partNumber, etag });
          }
          Object.assign(complete, { multipartId: plan.multipartId, parts });
        } else await put(plan.uploadUrl, 0, file.size - 1);
        const after = await handle.stat();
        if (after.size !== file.size || after.mtimeMs !== file.mtimeMs) throw new ServiceError('A selected file changed during upload. No final submission was sent.');
        await this.post(staging('complete'), complete, signal);
        receipts.push(receipt);
        progress(`Uploaded ${index + 1} of ${files.length} files`);
      } finally { await handle.close(); }
    }
    signal?.throwIfAborted();
    progress('Starting the investigation');
    return this.post(new URL(`/api/integrations/ultiwrite/upload${link.search}`, link), { files: receipts, ...option }, signal);
  }
}
