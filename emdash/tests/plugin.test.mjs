import test from 'node:test';
import assert from 'node:assert/strict';
import plugin, { safeId, safeWebsiteUrl, validUpload, requestApi } from '../src/plugin.ts';
const SECRET = ['ultiwrite', 'live', 'TEST_ONLY_NOT_A_CREDENTIAL'].join('_');
function fixture(data = {}, status = 200, configured = true) {
  const store = new Map(configured ? [['apiKey', SECRET]] : []);
  const calls = [];
  const ctx = { settings: {get: async k => store.get(k) ?? null, set: async(k,v)=>store.set(k,v), delete: async k=>store.delete(k)},
    http: { fetch: async (url, init) => { calls.push({url,init}); return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}); } } };
  return {ctx,store,calls};
}
const invoke = (f, input, method='POST') => plugin.routes.admin.handler({input,request:{method,url:'https://cms.example/_emdash/api/plugins/ultiwrite/admin',headers:{}}},f.ctx);
const action = (name,value) => ({type:'block_action',action_id:name,...(value === undefined?{}:{value})});

test('one private POST route; no hooks or MCP exposure',()=>{
 assert.deepEqual(Object.keys(plugin.routes),['admin']); assert.deepEqual(plugin.routes.admin.methods,['POST']);
 assert.notEqual(plugin.routes.admin.public,true); assert.equal(plugin.routes.admin.permission,'plugins:manage'); assert.equal(plugin.hooks,undefined);
});
test('page load neither calls API nor returns a saved key',async()=>{
 const f=fixture(); const out=await invoke(f,{type:'page_load',page:'/diligence'});
 assert.equal(f.calls.length,0); assert.ok(out.blocks.length); assert.ok(!JSON.stringify(out).includes(SECRET));
});
test('GET cannot mutate settings',async()=>{
 const f=fixture(); await invoke(f,{type:'form_submit',action_id:'save_key',values:{apiKey:SECRET+'NEW'}},'GET');
 assert.equal(f.store.get('apiKey'),SECRET); assert.equal(f.calls.length,0);
});
test('empty masked key preserves existing key',async()=>{
 const f=fixture(); await invoke(f,{type:'form_submit',action_id:'save_key',values:{apiKey:''}});
 assert.equal(f.store.get('apiKey'),SECRET);
});
test('key save never echoes key, even after replacement',async()=>{
 const f=fixture(); const out=await invoke(f,{type:'form_submit',action_id:'save_key',values:{apiKey:SECRET+'NEW'}});
 assert.equal(f.store.get('apiKey'),SECRET+'NEW'); assert.ok(!JSON.stringify(out).includes(SECRET));
});
test('explicit disconnect removes only plugin credential',async()=>{
 const f=fixture(); await invoke(f,action('disconnect')); assert.equal(f.store.has('apiKey'),false);
});
test('missing key makes no outbound request',async()=>{
 const f=fixture({},200,false); const out=await invoke(f,action('cases')); assert.equal(f.calls.length,0); assert.match(JSON.stringify(out),/API key/i);
});
test('only canonical API URL and bearer header; redirects forbidden',async()=>{
 const f=fixture({ok:true}); await requestApi(f.ctx,'/me');
 assert.equal(f.calls[0].url,'https://dwsoffshorepartners.com/api/v1/me');
 assert.equal(f.calls[0].init.headers.Authorization,'Bearer '+SECRET); assert.equal(f.calls[0].init.redirect,'error');
});
test('rejects arbitrary outbound paths before fetch',async()=>{
 const f=fixture(); for(const path of ['https://evil.example','//evil.example','/../settings','/cases?limit=10&x=1','/cases/a/continue']) await assert.rejects(()=>requestApi(f.ctx,path));
 assert.equal(f.calls.length,0);
});
test('case pagination uses validated opaque cursor',async()=>{
 const f=fixture({cases:[],nextCursor:'ev_next_1'}); const out=await invoke(f,action('cases','ev_cursor_1'));
 assert.equal(f.calls[0].url,'https://dwsoffshorepartners.com/api/v1/cases?limit=10&cursor=ev_cursor_1');
 assert.match(JSON.stringify(out),/ev_next_1/);
});
test('invalid cursor does not cause fetch',async()=>{
 const f=fixture(); await invoke(f,action('cases','x&host=evil')); assert.equal(f.calls.length,0);
});
test('resource IDs reject path traversal and query syntax',()=>{
 for (const x of ['../secrets','a/b','a?x=1','', 'a'.repeat(81),null]) assert.throws(()=>safeId(x));
 assert.equal(safeId('ev_valid-123'),'ev_valid-123');
});
test('case/report lookup uses documented paths',async()=>{
 const f=fixture({state:'not_ready'}); await invoke(f,{type:'form_submit',action_id:'lookup',values:{kind:'case',id:'ev_1'}});
 assert.equal(f.calls[0].url,'https://dwsoffshorepartners.com/api/v1/cases/ev_1/brief');
});
for(const status of [401,403,404,429,503]) test(`HTTP ${status} is surfaced without raw server text`,async()=>{
 const f=fixture({error:{message:SECRET}},status); const out=await invoke(f,action('cases'));
 assert.ok(!JSON.stringify(out).includes(SECRET)); assert.match(JSON.stringify(out),new RegExp(String(status)));
});
test('host exceptions never leak secrets',async()=>{
 const f=fixture(); f.ctx.http.fetch=async()=>{throw Error(SECRET)}; const out=await invoke(f,action('cases'));assert.ok(!JSON.stringify(out).includes(SECRET));
});
test('valid signed upload requires expected host, endpoint, single use and future expiry',()=>{
 const good={url:'https://dwsoffshorepartners.com/api/integrations/ultiwrite/upload?t=TEST_SIGNATURE',expiresAt:new Date(Date.now()+120000).toISOString(),singleUse:true};
 assert.equal(validUpload(good).url,good.url);
 for(const bad of [{...good,singleUse:false},{...good,expiresAt:new Date(0).toISOString()},{...good,url:'https://evil.example/upload?t=x'},{...good,url:'https://dwsoffshorepartners.com@evil.example/upload?t=x'},{...good,url:'https://dwsoffshorepartners.com/other?t=x'},{...good,url:'https://dwsoffshorepartners.com/api/integrations/ultiwrite/upload'}]) assert.throws(()=>validUpload(bad));
});
test('upload link only created on explicit action; not persisted',async()=>{
 const f=fixture({url:'https://dwsoffshorepartners.com/api/integrations/ultiwrite/upload?t=TEST_SIGNATURE',expiresAt:new Date(Date.now()+120000).toISOString(),singleUse:true});
 const out=await invoke(f,action('upload')); assert.equal(f.calls.length,1); assert.equal(f.calls[0].init.method,'POST'); assert.deepEqual(JSON.parse(f.calls[0].init.body),{});
 assert.equal(f.store.size,1); assert.match(JSON.stringify(out),/Open secure uploader/);
});
test('expired upload does not return clickable signed link',async()=>{
 const f=fixture({url:'https://dwsoffshorepartners.com/api/integrations/ultiwrite/upload?t=TEST_SIGNATURE',expiresAt:new Date(0).toISOString(),singleUse:true});
 const out=await invoke(f,action('upload'));assert.ok(!JSON.stringify(out).includes('TEST_SIGNATURE'));
});
test('external website links are strictly limited',()=>{
 assert.equal(safeWebsiteUrl('https://dwsoffshorepartners.com/reports/r1'),'https://dwsoffshorepartners.com/reports/r1');
 for(const url of ['javascript:alert(1)','https://evil.example/reports/r1','https://dwsoffshorepartners.com.evil.example/reports/r1','https://user:secret@dwsoffshorepartners.com/reports/r1','https://dwsoffshorepartners.com/api/admin','https://dwsoffshorepartners.com/reports/r1?redirect=https://evil.example']) assert.equal(safeWebsiteUrl(url),null);
});
test('unknown or malformed interactions are rejected without side effects',async()=>{
 for(const input of [null,[],{type:'other'},action('arbitrary'),{type:'form_submit',action_id:'save_key',values:{apiKey:5}}]){
 const f=fixture();const out=await invoke(f,input);assert.equal(f.calls.length,0);assert.ok(out.blocks);assert.equal(f.store.get('apiKey'),SECRET);
 }
});
