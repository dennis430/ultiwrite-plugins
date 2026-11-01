#!/usr/bin/env node
// Read-only MCP initialization and paginated tool discovery. Never prints a token.
import { writeFile } from 'node:fs/promises';
const url='https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp';
const token=process.env.ULTIWRITE_MCP_ACCESS_TOKEN;
if(!token||/[\r\n]/.test(token)||!process.argv[2]){console.error('Set a short-lived MCP-audience token in ULTIWRITE_MCP_ACCESS_TOKEN locally and supply an output path. Do not commit the token.');process.exit(1);}
let session,sequence=1,protocol='2025-03-26';
async function call(method,params={},notification=false){
 const id=sequence++;const r=await fetch(url,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/json, text/event-stream','Content-Type':'application/json','MCP-Protocol-Version':protocol,...(session?{'Mcp-Session-Id':session}:{})},body:JSON.stringify({jsonrpc:'2.0',...(notification?{}:{id}),method,params}),signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error('MCP discovery failed with HTTP '+r.status+'. Check token audience and native OAuth.');
 session=r.headers.get('mcp-session-id')??session;if(notification)return;
 const raw=await r.text();if(raw.length>2_000_000)throw Error('Discovery response too large.');
 let data;if((r.headers.get('content-type')??'').includes('text/event-stream')){const events=raw.split(/\r?\n\r?\n/).map(e=>e.split(/\r?\n/).filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n')).filter(Boolean);for(const event of events){try{const item=JSON.parse(event);if(item.id===id)data=item;}catch{}}}else data=JSON.parse(raw);
 if(!data||data.id!==id||data.error||!data.result)throw Error('MCP returned no matching discovery result.');return data.result;
}
try{const init=await call('initialize',{protocolVersion:protocol,capabilities:{},clientInfo:{name:'ultiwrite-submission-preflight',version:'0.1.0'}});protocol=init.protocolVersion??protocol;await call('notifications/initialized',{},true);let cursor,tools=[],seen=new Set();for(let step=0;step<20;step++){const r=await call('tools/list',cursor?{cursor}:{});if(!Array.isArray(r.tools))throw Error('Invalid tools/list response.');tools.push(...r.tools);if(!r.nextCursor){cursor=null;break;}if(seen.has(r.nextCursor))throw Error('Repeated discovery cursor.');seen.add(r.nextCursor);cursor=r.nextCursor;}if(cursor)throw Error('Discovery pagination budget exceeded.');await writeFile(process.argv[2],JSON.stringify({protocolVersion:protocol,tools},null,2)+'\n',{mode:0o600});console.log('Saved '+tools.length+' tool definitions. No evidence submission or analysis was performed.');}catch{console.error('Discovery failed. Check the MCP token audience, endpoint and response format. No credential was printed.');process.exitCode=1;}
