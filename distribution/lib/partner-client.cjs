'use strict';
/** Thin connector transport only. The hosted analytical service remains proprietary. */
const BASE = 'https://dwsoffshorepartners.com/api/v1';
const ORIGIN = 'https://dwsoffshorepartners.com';
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const OPERATIONS = Object.freeze({
  account:{method:'GET',path:'/me',fields:[]},
  usage:{method:'GET',path:'/usage',fields:[]},
  capabilities:{method:'GET',path:'/capabilities',fields:[]},
  listCases:{method:'GET',path:'/cases',fields:['cursor','limit']},
  getCase:{method:'GET',path:'/cases/{caseId}',fields:['caseId']},
  getBrief:{method:'GET',path:'/cases/{caseId}/brief',fields:['caseId']},
  getFindings:{method:'GET',path:'/cases/{caseId}/findings',fields:['caseId','cursor','snapshot','pageToken','limit']},
  getExport:{method:'GET',path:'/reports/{reportId}/export',fields:['reportId']},
  createUploadLink:{method:'POST',path:'/upload-links',fields:['documentForensics']},
  continueCase:{method:'POST',path:'/cases/{caseId}/continue',fields:['caseId']},
});
function identifier(value) {
  if (typeof value !== 'string' || !ID.test(value)) throw new TypeError('Invalid identifier. Use an identifier returned by Ultiwrite.');
  return value;
}
function route(operation, params={}) {
  if (!Object.hasOwn(OPERATIONS,operation)) throw new TypeError('Unsupported operation.');
  if (!params || Array.isArray(params) || typeof params !== 'object') throw new TypeError('Invalid parameters.');
  const op=OPERATIONS[operation];
  for(const k of Object.keys(params)) if(!op.fields.includes(k)) throw new TypeError('Unsupported parameter: '+k);
  let path=op.path;
  for(const key of ['caseId','reportId']) if(path.includes('{'+key+'}')) path=path.replace('{'+key+'}',identifier(params[key]));
  const qs=new URLSearchParams();
  if(operation==='listCases') {
    if(params.cursor!==undefined&&params.cursor!=='') qs.set('cursor',identifier(params.cursor));
    if(params.limit!==undefined) { if(!Number.isInteger(params.limit)||params.limit<1||params.limit>20) throw new TypeError('Invalid limit.');qs.set('limit',String(params.limit)); }
  }
  if(operation==='getFindings') {
    if(params.limit!==undefined) {if(!Number.isInteger(params.limit)||params.limit<1||params.limit>12) throw new TypeError('Invalid limit.');qs.set('limit',String(params.limit));}
    if(params.cursor!==undefined) {if(!/^\d{1,9}$/.test(String(params.cursor))) throw new TypeError('Invalid cursor.');qs.set('cursor',String(params.cursor));}
    if(params.snapshot!==undefined) {if(!/^[a-f0-9]{64}$/.test(params.snapshot)) throw new TypeError('Invalid snapshot.');qs.set('snapshot',params.snapshot);}
    if(params.pageToken!==undefined) {if(!/^[A-Za-z0-9_-]{8,2000}\.[A-Za-z0-9_-]{20,200}$/.test(params.pageToken)) throw new TypeError('Invalid page token.');qs.set('pageToken',params.pageToken);}
    if(Number(params.cursor||0)>0 && (!params.snapshot||!params.pageToken)) throw new TypeError('Nonzero cursors require the returned snapshot and page token.');
  }
  if(qs.size) path+='?'+qs.toString();
  let body;
  if(operation==='createUploadLink') {
    if(typeof params.documentForensics!=='boolean') throw new TypeError('Choose documentForensics explicitly.');
    body={documentForensics:params.documentForensics};
  }
  return {method:op.method,path,body,timeout:operation==='continueCase'?310000:20000};
}
function safeWebsite(value) {
  try {if(typeof value!=='string'||!value.startsWith(ORIGIN+'/')) return null;const u=new URL(value);return u.origin===ORIGIN&&!u.username&&!u.password?u.href:null;} catch{return null;}
}
function apiError(status,retryAfter) {
  const actions={401:'Reconnect or replace the API credential.',403:'Explicit Ultiwrite API approval or the required scope is missing.',404:'The API or requested record is unavailable for this account.',409:'The saved case has a conflicting choice.',422:'The evidence or analysis needs attention.',429:'The account request allowance or rate limit was reached.',503:'The service is temporarily unavailable.',504:'The request timed out; check the saved case before retrying.'};
  const e=new Error('Ultiwrite HTTP '+status+'. '+(actions[status]||'Check the saved case and contact support.'));
  e.status=status;e.retryAfter=Math.max(0,Math.min(86400,Number(retryAfter)||0));return e;
}
function createClient(token,fetcher=globalThis.fetch) {
  if(typeof token!=='string'||!token.trim()||/[\r\n]/.test(token)||token.length>4096) throw new TypeError('A valid server-side credential is required.');
  if(typeof fetcher!=='function') throw new TypeError('A Fetch-compatible transport is required.');
  return {async call(operation,params={}) {
    const request=route(operation,params),controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),request.timeout);timer.unref?.();
    try {
      let response;
      try { response=await fetcher(BASE+request.path,{method:request.method,redirect:'error',signal:controller.signal,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(request.body?{'Content-Type':'application/json'}:{})},...(request.body?{body:JSON.stringify(request.body)}:{})}); }
      catch {throw new Error('Ultiwrite network request failed or timed out. No success is established; check the saved case before retrying.');}
      if(!response.ok) throw apiError(response.status,response.headers.get('retry-after'));
      if(!(response.headers.get('content-type')||'').toLowerCase().includes('application/json')) throw new Error('Ultiwrite returned a non-JSON response.');
      const cap=2*1024*1024;
      if(Number(response.headers.get('content-length'))>cap) throw new Error('Ultiwrite response is too large.');
      const reader=response.body?.getReader();let length=0,chunks=[];
      if(reader) {try {while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>cap){await reader.cancel();throw new Error('Ultiwrite response is too large.');}chunks.push(value);}}finally{reader.releaseLock();}}
      const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
      let data;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('Ultiwrite returned invalid JSON.');}
      if(!data||Array.isArray(data)||typeof data!=='object') throw new Error('Ultiwrite returned an unexpected JSON shape.');
      return data;
    } finally {clearTimeout(timer);}
  }};
}
module.exports={BASE,ORIGIN,OPERATIONS,identifier,route,safeWebsite,apiError,createClient};
