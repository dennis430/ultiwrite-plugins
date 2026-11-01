import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, Server } from 'node:http';
import { once } from 'node:events';
import { Fetcher, JsonObject, MCP_PATH, ORIGIN, SCOPES, ServiceError, readResponse, safeServiceUrl, signalFor } from './service';

const SECRET_KEY = 'ultiwrite.oauth.session.v1';
export interface SecretStore { get(key: string): PromiseLike<string | undefined>; store(key: string, value: string): PromiseLike<void>; delete(key: string): PromiseLike<void>; }
export interface Session { accessToken: string; refreshToken?: string; clientId: string; expiresAt: number; issuer: string; scopes: string[]; }
interface Discovery { authorization: string; token: string; registration: string; revoke: string; }

function matches(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class AuthController {
  private pending?: Promise<Session>;
  private renewing?: Promise<Session>;
  private discovery?: Discovery;
  private timer?: NodeJS.Timeout;
  private disposed = false;
  private generation = 0;
  private writes: Promise<void> = Promise.resolve();
  private controller?: AbortController;
  constructor(private readonly secrets: SecretStore, private readonly openBrowser: (url: string) => PromiseLike<boolean>, private readonly changed: () => void = () => {}, private readonly fetcher: Fetcher = fetch, readonly origin = ORIGIN) {}

  async saved(): Promise<Session | undefined> {
    const generation = this.generation;
    const raw = await this.secrets.get(SECRET_KEY);
    // SecretStorage reads can resolve after a disconnect/account switch. Never
    // hand a stale snapshot back to the native MCP definition provider.
    if (generation !== this.generation) return this.saved();
    if (!raw) return undefined;
    try {
      const value = JSON.parse(raw);
      if (value.issuer !== this.origin || typeof value.accessToken !== 'string' || !value.accessToken || typeof value.clientId !== 'string' || !value.clientId || !Number.isFinite(value.expiresAt) || !Array.isArray(value.scopes)) throw new Error();
      return value;
    } catch {
      await this.mutate(async () => { if (generation === this.generation) await this.secrets.delete(SECRET_KEY); });
      return generation === this.generation ? undefined : this.saved();
    }
  }

  private assertGeneration(generation: number): void {
    if (this.disposed || generation !== this.generation) throw new ServiceError('The Ultiwrite connection changed. Retry with the current account.');
  }

  private async json(url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<JsonObject> {
    safeServiceUrl(url, this.origin);
    const response = await this.fetcher(url, { ...init, redirect: 'error', signal: signalFor(signal) });
    if (!response.ok) { await response.body?.cancel(); throw new ServiceError(`Ultiwrite sign-in was refused (${response.status}). Try connecting again.`, response.status); }
    try { return JSON.parse(await readResponse(response, 128 * 1024)); } catch { throw new ServiceError('Ultiwrite returned an invalid sign-in response.'); }
  }

  private async discover(signal?: AbortSignal): Promise<Discovery> {
    if (this.discovery) return this.discovery;
    const [resource, auth] = await Promise.all([
      this.json(this.origin + '/.well-known/oauth-protected-resource', {}, signal),
      this.json(this.origin + '/.well-known/oauth-authorization-server', {}, signal),
    ]);
    if (resource.resource !== this.origin + MCP_PATH || auth.issuer !== this.origin || !auth.code_challenge_methods_supported?.includes('S256')) throw new ServiceError('The Ultiwrite OAuth metadata does not match the expected service.');
    const endpoint = (value: unknown) => safeServiceUrl(value, this.origin).href;
    this.discovery = { authorization: endpoint(auth.authorization_endpoint), token: endpoint(auth.token_endpoint), registration: endpoint(auth.registration_endpoint), revoke: endpoint(auth.revocation_endpoint ?? this.origin + '/api/integrations/ultiwrite/oauth/revoke') };
    return this.discovery;
  }

  private mutate<T>(action: () => Promise<T>): Promise<T> {
    const next = this.writes.then(action, action);
    this.writes = next.then(() => {}, () => {});
    return next;
  }

  private persist(value: Session, generation: number): Promise<Session> {
    return this.mutate(async () => {
      if (this.disposed || generation !== this.generation) throw new ServiceError('The Ultiwrite connection was closed.');
      await this.secrets.store(SECRET_KEY, JSON.stringify(value));
      if (generation !== this.generation) { await this.secrets.delete(SECRET_KEY); throw new ServiceError('The Ultiwrite connection was closed.'); }
      this.armRefresh(value);
      this.changed();
      return value;
    });
  }

  private armRefresh(value: Session): void {
    clearTimeout(this.timer);
    if (!value.refreshToken || this.disposed) return;
    const delay = Math.max(30_000, value.expiresAt - Date.now() - 90_000);
    this.timer = setTimeout(() => { void this.refresh().catch(() => { this.changed(); }); }, Math.min(delay, 2_147_000_000));
    this.timer.unref();
  }

  async resume(): Promise<void> { const value = await this.saved(); if (value) this.armRefresh(value); }

  async token(signal?: AbortSignal, forceRefresh = false): Promise<string> {
    const generation = this.generation;
    signal?.throwIfAborted();
    const value = await this.saved();
    this.assertGeneration(generation); signal?.throwIfAborted();
    const session = !value ? await this.signIn(signal) : forceRefresh || value.expiresAt < Date.now() + 60_000 ? await this.refresh(signal) : value;
    this.assertGeneration(generation); signal?.throwIfAborted();
    return session.accessToken;
  }

  signIn(signal?: AbortSignal): Promise<Session> {
    if (!this.pending) this.pending = this.login(signal).finally(() => { this.pending = undefined; });
    return this.pending;
  }

  private async login(signal?: AbortSignal): Promise<Session> {
    const generation = this.generation;
    this.controller = new AbortController();
    const active = signal ? AbortSignal.any([signal, this.controller.signal, AbortSignal.timeout(300_000)]) : AbortSignal.any([this.controller.signal, AbortSignal.timeout(300_000)]);
    const discovery = await this.discover(active);
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    let accept!: (code: string) => void;
    let reject!: (error: Error) => void;
    const codeReceived = new Promise<string>((resolve, fail) => { accept = resolve; reject = fail; });
    void codeReceived.catch(() => {});
    const server: Server = createServer((req, res) => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (req.method !== 'GET' || url.pathname !== '/callback' || !matches(url.searchParams.get('state') ?? '', state)) { res.writeHead(400); res.end('Invalid sign-in callback.'); return; }
      if (url.searchParams.get('error')) { res.writeHead(400); res.end('Sign-in was declined. Return to VS Code to reconnect.'); reject(new ServiceError('Sign-in was declined. You can reconnect at any time.')); return; }
      if (url.searchParams.get('iss') !== this.origin || !url.searchParams.get('code')) { res.writeHead(400); res.end('Invalid sign-in issuer.'); reject(new ServiceError('The sign-in response did not come from Ultiwrite.')); return; }
      res.end('Ultiwrite sign-in received. Return to VS Code.');
      accept(url.searchParams.get('code')!);
    });
    const abort = () => { reject(new ServiceError('Sign-in was cancelled or timed out. Select Connect to try again.')); server.closeAllConnections(); server.close(); };
    active.addEventListener('abort', abort, { once: true });
    try {
      server.listen(0, '127.0.0.1');
      await once(server, 'listening', { signal: active });
      const address = server.address();
      if (!address || typeof address === 'string') throw new ServiceError('A local sign-in callback could not be started.');
      const redirect = `http://127.0.0.1:${address.port}/callback`;
      const client = await this.json(discovery.registration, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ application_type: 'native', client_name: 'Ultiwrite for VS Code', token_endpoint_auth_method: 'none', redirect_uris: [redirect] }) }, active);
      if (typeof client.client_id !== 'string' || !client.client_id) throw new ServiceError('Client registration did not complete.');
      const authorize = new URL(discovery.authorization);
      for (const [key, value] of Object.entries({ response_type: 'code', client_id: client.client_id, redirect_uri: redirect, code_challenge: challenge, code_challenge_method: 'S256', state, scope: SCOPES.join(' '), resource: this.origin + MCP_PATH })) authorize.searchParams.set(key, value);
      if (!await this.openBrowser(authorize.href)) throw new ServiceError('The sign-in browser could not be opened. Select Connect to retry.');
      const code = await codeReceived;
      active.throwIfAborted();
      const data = await this.json(discovery.token, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: client.client_id, code_verifier: verifier, resource: this.origin + MCP_PATH }).toString() }, active);
      return this.persist(this.sessionFrom(data, client.client_id), generation);
    } finally {
      active.removeEventListener('abort', abort);
      server.closeAllConnections(); server.close();
      this.controller = undefined;
    }
  }

  private sessionFrom(data: JsonObject, clientId: string, previous?: Session): Session {
    if (typeof data.access_token !== 'string' || !data.access_token || (data.token_type && String(data.token_type).toLowerCase() !== 'bearer')) throw new ServiceError('Ultiwrite did not issue a usable access token.');
    const lifetime = Number(data.expires_in ?? 3600);
    if (!Number.isFinite(lifetime) || lifetime <= 0 || lifetime > 31_536_000) throw new ServiceError('Ultiwrite returned an invalid token expiry.');
    const scopes = typeof data.scope === 'string' ? data.scope.split(' ').filter(Boolean) : previous?.scopes ?? [...SCOPES];
    return { issuer: this.origin, clientId, accessToken: data.access_token, refreshToken: typeof data.refresh_token === 'string' ? data.refresh_token : previous?.refreshToken, expiresAt: Date.now() + lifetime * 1000, scopes };
  }

  private refresh(signal?: AbortSignal): Promise<Session> {
    if (!this.renewing) this.renewing = (async () => {
      const generation = this.generation;
      const previous = await this.saved();
      this.assertGeneration(generation);
      if (!previous?.refreshToken) throw new ServiceError('Your connection expired. Select Reconnect Ultiwrite.');
      const endpoints = await this.discover(signal);
      try {
        const data = await this.json(endpoints.token, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: previous.refreshToken, client_id: previous.clientId, resource: this.origin + MCP_PATH }).toString() }, signal);
        return this.persist(this.sessionFrom(data, previous.clientId, previous), generation);
      } catch (error) {
        if (error instanceof ServiceError && [400, 401, 403].includes(error.status ?? 0) && generation === this.generation) {
          await this.mutate(async () => { if (generation === this.generation) await this.secrets.delete(SECRET_KEY); });
          clearTimeout(this.timer); this.changed();
        }
        throw new ServiceError('Your connection could not be refreshed. Select Reconnect Ultiwrite.');
      }
    })().finally(() => { this.renewing = undefined; });
    return this.renewing;
  }

  async disconnect(revoke = true): Promise<void> {
    this.generation++;
    this.controller?.abort(); clearTimeout(this.timer);
    const value = await this.saved();
    await this.mutate(async () => { await this.secrets.delete(SECRET_KEY); });
    await this.pending?.catch(() => {});
    this.changed();
    if (revoke && value) {
      try {
        const response = await this.fetcher(this.origin + '/api/integrations/ultiwrite/oauth/revoke', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000), headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: value.refreshToken ?? value.accessToken, client_id: value.clientId }).toString() });
        await response.body?.cancel();
      } catch { /* Local disconnection is authoritative; dashboard can revoke other sessions. */ }
    }
  }

  dispose(): void { this.disposed = true; this.controller?.abort(); clearTimeout(this.timer); }
}
