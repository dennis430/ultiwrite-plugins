/** Ultiwrite's thin EmDash connector. No engine implementation or customer data. */
type JsonObject = Record<string, unknown>;
type Block = Record<string, unknown>;
type View = { blocks: Block[]; toast?: { message: string; type: 'success' | 'error' } };
interface Context {
  settings: { get(key: string): Promise<unknown>; set(key: string, value: unknown): Promise<void>; delete(key: string): Promise<boolean> };
  http?: { fetch(url: string, init?: RequestInit): Promise<Response> };
}
interface RouteContext { input: unknown; request: { method: string } }
const ORIGIN = 'https://dwsoffshorepartners.com';
const API = `${ORIGIN}/api/v1`;
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const KEY = /^ultiwrite_live_[A-Za-z0-9_-]{8,2000}$/;
class UserError extends Error {}
function record(value: unknown): value is JsonObject { return !!value && typeof value === 'object' && !Array.isArray(value); }
export function safeId(value: unknown): string {
  if (typeof value !== 'string' || !ID.test(value)) throw new UserError('Use a valid case or report ID from Ultiwrite.');
  return value;
}
export function safeWebsiteUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    if (u.origin !== ORIGIN || u.username || u.password || u.search || u.hash) return null;
    if (!/^\/(?:reports|report|uploads)\/[A-Za-z0-9_-]{1,80}\/?$/.test(u.pathname)) return null;
    return u.href;
  } catch { return null; }
}
export function validUpload(data: unknown): {url: string; expiresAt: string} {
  if (!record(data) || typeof data.url !== 'string' || typeof data.expiresAt !== 'string' || data.singleUse !== true)
    throw new UserError('Ultiwrite did not return a valid single-use upload link. Use the dashboard instead.');
  let u: URL;
  try { u = new URL(data.url); } catch { throw new UserError('The upload link was invalid.'); }
  const expires = Date.parse(data.expiresAt);
  if (u.origin !== ORIGIN || u.username || u.password || u.hash || u.pathname !== '/api/integrations/ultiwrite/upload' || !u.searchParams.get('t') || [...u.searchParams.keys()].some(k => k !== 't'))
    throw new UserError('The upload link did not match the trusted Ultiwrite uploader.');
  if (!Number.isFinite(expires) || expires <= Date.now() + 15000)
    throw new UserError('The upload link is already expired or too close to expiry. Generate a fresh link or use the dashboard.');
  return {url: u.href, expiresAt: data.expiresAt};
}
function apiError(status: number): string {
  const help: Record<number,string> = {
    401: 'The API key is invalid, expired, or revoked. Replace it in Connection settings.',
    403: 'This account needs explicit Ultiwrite API approval or the required API scope. Request access from Ultiwrite.',
    404: 'The resource was not found in this account, or the Partner API is not enabled on the server.',
    429: 'The account API request allowance or rate limit has been reached. Retry later; no automatic retry was sent.',
    503: 'The Ultiwrite API is temporarily unavailable. Try again later.',
  };
  return `Ultiwrite HTTP ${status}. ${help[status] ?? 'The request did not succeed. Open Ultiwrite or contact support.'}`;
}
export async function requestApi(ctx: Context, path: string, method = 'GET'): Promise<JsonObject> {
  const isRead = /^\/(?:me|usage|capabilities)$/.test(path) || /^\/cases\?limit=10(?:&cursor=[A-Za-z0-9_-]{1,80})?$/.test(path) || /^\/(?:cases|reports)\/[A-Za-z0-9_-]{1,80}\/brief$/.test(path) || /^\/reports\/[A-Za-z0-9_-]{1,80}\/export$/.test(path);
  if (!((method === 'GET' && isRead) || (method === 'POST' && path === '/upload-links'))) throw new UserError('Unsupported API operation.');
  const key = await ctx.settings.get('apiKey');
  if (typeof key !== 'string' || !KEY.test(key)) throw new UserError('Add an approved Ultiwrite API key in Connection settings first.');
  if (!ctx.http) throw new UserError('Grant the plugin its declared Ultiwrite network permission.');
  let response: Response;
  try {
    response = await ctx.http.fetch(`${API}${path}`, {
      method, redirect: 'error', headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', ...(method === 'POST' ? {'Content-Type':'application/json'} : {}) },
      ...(method === 'POST' ? {body:'{}'} : {}),
    });
  } catch { throw new UserError('Unable to reach Ultiwrite. No redirect was followed. Try again or open the dashboard.'); }
  if (!response.ok) throw new UserError(apiError(response.status));
  const text = await response.text();
  if (text.length > 256000) throw new UserError('The API response was too large for the EmDash panel. Open the full report in Ultiwrite.');
  let data: unknown;
  try { data = JSON.parse(text.split(key).join('[redacted]')); } catch { throw new UserError('Ultiwrite returned an invalid JSON response.'); }
  if (!record(data)) throw new UserError('Ultiwrite returned an unexpected response.');
  return data;
}
const link = (label: string, url: string): Block => ({type:'link',label,target:{kind:'external',url}});
const button = (label: string, action_id: string, value?: unknown): Block => ({type:'button',label,action_id,...(value === undefined ? {} : {value})});
function shell(extra: Block[] = []): View {
  return {blocks:[
    {type:'header',text:'Ultiwrite | Asymmetric diligence'},
    {type:'context',text:'Investigative intelligence for businesses, counterparties, acquisitions, financing and portfolios. Nothing is submitted automatically.'},
    {type:'actions',elements:[link('Open Ultiwrite',`${ORIGIN}/dashboard`),link('Request API access',`${ORIGIN}/settings/api`),link('API documentation',`${ORIGIN}/docs/api`)]},
    {type:'actions',elements:[button('Connection settings','settings'),button('Check account and usage','account'),button('Browse cases','cases'),button('Create secure upload link','upload')]},
    {type:'form',block_id:'lookup',fields:[{type:'select',action_id:'kind',label:'Find a Decision Brief by',options:[{label:'Case ID',value:'case'},{label:'Report ID',value:'report'}],initial_value:'case'},{type:'text_input',action_id:'id',label:'Case or report ID'}],submit:{label:'Read Decision Brief',action_id:'lookup'}},
    ...extra,
    {type:'context',text:'API requests use the connected account’s request allowance. Uploading evidence and starting analysis uses its analysis allowance. Report downloads require Ultiwrite sign-in. Workflow status is not a diligence conclusion.'},
  ]};
}
function jsonBlocks(title: string, data: unknown): Block[] {
  const json = JSON.stringify(data,null,2);
  const truncated = json.length > 24000;
  return [{type:'header',text:title},{type:'code',language:'jsonc',code:json.slice(0,24000)},...(truncated ? [{type:'context',text:'Display truncated at 24,000 characters. This is not the complete report; open Ultiwrite for all evidence and limitations.'}] : [])];
}
async function settings(ctx: Context): Promise<View> {
  const configured = Boolean(await ctx.settings.get('apiKey'));
  return shell([
    {type:'header',text:'Connection settings'},
    {type:'context',text:'Use a dashboard-created ultiwrite_live_ key for an explicitly API-approved account. This is an administrator-shared connection, not a Bluesky publishing credential. EmDash encrypts this secret using its configured encryption key.'},
    {type:'form',block_id:'connection',fields:[{type:'secret_input',action_id:'apiKey',label:'Ultiwrite API key',has_value:configured}],submit:{label:'Save connection',action_id:'save_key'}},
    {type:'actions',elements:[{...button('Disconnect','disconnect'),style:'danger',confirm:{title:'Disconnect Ultiwrite?',text:'Remove the stored key from this plugin. This does not revoke the key in Ultiwrite.',confirm:'Disconnect',deny:'Cancel'}}]},
  ]);
}
function reportLinks(data: unknown): Block[] {
  const urls = new Set<string>();
  function scan(v: unknown, depth = 0) {
    if (depth > 8 || urls.size >= 8) return;
    const url = safeWebsiteUrl(v); if(url) urls.add(url);
    else if (Array.isArray(v)) v.slice(0,100).forEach(x=>scan(x,depth+1));
    else if(record(v)) Object.values(v).slice(0,100).forEach(x=>scan(x,depth+1));
  }
  scan(data);
  return urls.size ? [{type:'actions',elements:[...urls].map((u,i)=>link(`Open in Ultiwrite${i ? ` (${i+1})` : ''}`,u))}] : [];
}
async function handle(route: RouteContext, ctx: Context): Promise<View> {
  try {
    if (route.request.method !== 'POST') throw new UserError('POST is required. No action was performed.');
    const input = route.input;
    if (!record(input)) throw new UserError('Invalid plugin interaction.');
    if (input.type === 'page_load') {
      if (input.page !== '/diligence' && input.page !== '/settings') throw new UserError('Unknown plugin page.');
      return input.page === '/settings' ? await settings(ctx) : shell();
    }
    if (input.type === 'form_submit' && input.action_id === 'save_key') {
      if (!record(input.values)) throw new UserError('Invalid connection settings.');
      const value = input.values.apiKey;
      if (value !== undefined && typeof value !== 'string') throw new UserError('The API key must be text.');
      if (typeof value === 'string' && value.trim()) {
        const key = value.trim();
        if (!KEY.test(key)) throw new UserError('Use a dashboard-created Ultiwrite API key, not a Bluesky password or OAuth token.');
        await ctx.settings.set('apiKey',key);
      }
      return {...await settings(ctx),toast:{type:'success',message:'Connection settings saved. Use Check account and usage to verify access.'}};
    }
    if (input.type === 'form_submit' && input.action_id === 'lookup') {
      if (!record(input.values) || !['case','report'].includes(String(input.values.kind))) throw new UserError('Choose case or report.');
      const id = safeId(input.values.id);
      const kind = input.values.kind === 'case' ? 'cases' : 'reports';
      const brief = await requestApi(ctx,`/${kind}/${id}/brief`);
      const extra = [...jsonBlocks('Saved Decision Brief',brief),...reportLinks(brief)];
      if (kind === 'reports') {
        try { const delivery = await requestApi(ctx,`/reports/${id}/export`);extra.push(...reportLinks(delivery)); }
        catch { extra.push({type:'context',text:'Delivery options could not be loaded. The saved brief above is unchanged; open Ultiwrite for downloads.'}); }
      }
      return shell(extra);
    }
    if (input.type !== 'block_action' || typeof input.action_id !== 'string') throw new UserError('Invalid plugin interaction.');
    switch (input.action_id) {
      case 'settings': return await settings(ctx);
      case 'disconnect':
        await ctx.settings.delete('apiKey');
        return {...await settings(ctx),toast:{type:'success',message:'Disconnected. Revoke the key in Ultiwrite to invalidate other copies.'}};
      case 'account': {
        const account = await requestApi(ctx,'/me');
        const usage = await requestApi(ctx,'/usage');
        return shell([...jsonBlocks('Authorized account',account),...jsonBlocks('Current account usage',usage)]);
      }
      case 'cases': {
        const cursor = input.value === undefined || input.value === null ? null : safeId(input.value);
        const data = await requestApi(ctx,`/cases?limit=10${cursor ? `&cursor=${cursor}` : ''}`);
        const next = data.nextCursor == null ? null : safeId(data.nextCursor);
        return shell([...jsonBlocks('Cases and released reports — this page',data),...reportLinks(data),...(next ? [{type:'actions',elements:[button('Next page','cases',next)]}] : [])]);
      }
      case 'upload': {
        const upload = validUpload(await requestApi(ctx,'/upload-links','POST'));
        return shell([{type:'header',text:'Your secure upload link'},
          {type:'context',text:`Single-use link expires ${upload.expiresAt}. Do not share it publicly. Files go directly to Ultiwrite; this plugin does not receive or retain them.`},
          {type:'actions',elements:[link('Open secure uploader',upload.url)]}]);
      }
      default: throw new UserError('Unknown action. No operation was performed.');
    }
  } catch (error) {
    const message = error instanceof UserError ? error.message : 'The connection could not be used. Check the EmDash encryption configuration and try again. No credentials are shown.';
    return {...shell([{type:'banner',variant:'error',title:'Action not completed',description:message}]),toast:{type:'error',message}};
  }
}
const plugin = { routes: { admin: { methods:['POST'], permission:'plugins:manage', handler:handle } } };
export default plugin;
