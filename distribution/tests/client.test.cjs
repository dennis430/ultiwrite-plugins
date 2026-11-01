const test = require('node:test');
const assert = require('node:assert/strict');
const {createClient, route, safeWebsite, OPERATIONS} = require('../lib/partner-client.cjs');
const token='unit-test-token-never-a-real-key';
test('known operations only',()=>assert.throws(()=>route('arbitrary',{}),/operation/i));
for (const id of ['../me','a/b','%2fme','a?x=1','https://evil.test', '', 'x'.repeat(81)]) {
 test('reject hostile case id '+id,()=>assert.throws(()=>route('getCase',{caseId:id}),/identifier/i));
}
test('case identifier valid',()=>assert.equal(route('getCase',{caseId:'ev_123'}).path,'/cases/ev_123'));
test('pagination preserves explicit cursor',()=>assert.match(route('listCases',{cursor:'ev_next',limit:20}).path,/cursor=ev_next/));
test('pagination rejects out of bounds',()=>assert.throws(()=>route('listCases',{limit:21}),/limit/i));
test('upload has explicit forensics choice',()=>assert.deepEqual(route('createUploadLink',{documentForensics:false}).body,{documentForensics:false}));
test('reject forged tenant argument',()=>assert.throws(()=>route('getCase',{caseId:'ev_123',organizationId:'other'}),/parameter/i));
for(const url of ['https://evil.test/r','http://dwsoffshorepartners.com/r','https://dwsoffshorepartners.com.evil.test/r','https://u:p@dwsoffshorepartners.com/r','//evil.test/r']){
 test('refuse outbound report URL '+url,()=>assert.equal(safeWebsite(url),null));
}
test('permit canonical report link',()=>assert.equal(safeWebsite('https://dwsoffshorepartners.com/reports/r1'),'https://dwsoffshorepartners.com/reports/r1'));
test('missing token stops before network',()=>assert.throws(()=>createClient(''),/credential/i));
test('no automatic calls on initialization',()=>{let calls=0;createClient(token,async()=>{calls++;});assert.equal(calls,0);});
test('fixed host header and redirect refusal',async()=>{
 let seen; const c=createClient(token,async(url,options)=>{seen={url,options};return new Response('{"organizationId":"test"}',{status:200,headers:{'content-type':'application/json'}});});
 await c.call('account');assert.equal(seen.url,'https://dwsoffshorepartners.com/api/v1/me');assert.equal(seen.options.redirect,'error');assert.equal(seen.options.headers.Authorization,'Bearer '+token);
});
test('safe error does not expose response secrets',async()=>{
 const c=createClient(token,async()=>new Response(JSON.stringify({error:{message:token}}),{status:401}));
 await assert.rejects(c.call('account'),e=>e.status===401&&!e.message.includes(token));
});
test('429 provides retry signal without blind retries',async()=>{
 let n=0;const c=createClient(token,async()=>{n++;return new Response('{}',{status:429,headers:{'retry-after':'60'}});});
 await assert.rejects(c.call('usage'),e=>e.retryAfter===60);assert.equal(n,1);
});
test('HTML responses rejected',async()=>{
 const c=createClient(token,async()=>new Response('<html>login</html>',{status:200,headers:{'content-type':'text/html'}}));await assert.rejects(c.call('account'),/JSON/i);
});
test('invalid JSON rejected',async()=>{
 const c=createClient(token,async()=>new Response('{',{status:200,headers:{'content-type':'application/json'}}));await assert.rejects(c.call('account'),/JSON/i);
});
test('oversized response rejected',async()=>{const c=createClient(token,async()=>new Response('x',{headers:{'content-type':'application/json','content-length':'99999999'}}));await assert.rejects(c.call('account'),/large/i);});
test('network errors redact details',async()=>{const c=createClient(token,async()=>{throw new Error(token)});await assert.rejects(c.call('account'),e=>!e.message.includes(token));});
test('continuation is an explicit separate action',()=>assert.equal(OPERATIONS.continueCase.method,'POST'));
