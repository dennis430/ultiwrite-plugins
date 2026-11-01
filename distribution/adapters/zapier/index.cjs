'use strict';
const {BASE,route,apiError}=require('./partner-client.cjs');
async function request(z,bundle,operation,params={}) {
  const spec=route(operation,params),key=bundle.authData?.apiKey;
  if(typeof key!=='string'||!key.trim()||/[\r\n]/.test(key)||key.length>4096) throw new z.errors.ExpiredAuthError('Reconnect your Ultiwrite account.');
  let r;try {r=await z.request({url:BASE+spec.path,method:spec.method,headers:{Authorization:'Bearer '+key,Accept:'application/json'},redirect:'error',...(spec.body?{body:spec.body}:{})});}
  catch {throw new z.errors.Error('Ultiwrite could not be reached. Check the saved case before retrying.','NETWORK',503);}
  if(r.status===401) throw new z.errors.ExpiredAuthError('Replace or reconnect the Ultiwrite API credential.');
  if(r.status===429) throw new z.errors.ThrottledError('Ultiwrite request allowance or rate limit reached.',Math.max(1,Math.min(86400,Number(r.headers?.['retry-after'])||60)));
  if(r.status<200||r.status>=300) throw new z.errors.Error(apiError(r.status).message,'ULTIWRITE',r.status);
  if(!r.data||Array.isArray(r.data)||typeof r.data!=='object') throw new z.errors.Error('Unexpected Ultiwrite response.','RESPONSE',502);
  return r.data;
}
const idField=(key,label)=>({key,label,type:'string',required:true,helpText:'Use the exact identifier returned by this Ultiwrite account.'});
const action=(key,label,description,op,inputFields,params)=>({key,noun:'Investigation',display:{label,description},operation:{inputFields,perform:(z,b)=>request(z,b,op,params(b.inputData||{})),sample:{state:'not_ready',meaning:'Illustrative sample only; not a real investigation result.'}}});
module.exports={
  version:'0.1.0',platformVersion:require('zapier-platform-core').version,
  authentication:{type:'custom',fields:[{key:'apiKey',label:'Ultiwrite API key',type:'password',required:true,helpText:'Requires explicit API approval. Create a key in Dashboard > API access. Never use an MCP OAuth token or legacy provisioned key.'}],test:(z,b)=>request(z,b,'account'),connectionLabel:'Ultiwrite API account'},
  triggers:{},searches:{},
  creates:{
    create_upload_link:action('create_upload_link','Create Secure Evidence Upload Link','Create a short-lived, single-use link for an authorized person to submit evidence. The link is sensitive; do not post it publicly.','createUploadLink',[{key:'documentForensics',label:'Request Document Forensics',type:'boolean',required:true,default:'false',helpText:'Optional examination; account entitlements and analysis credits still apply.'}],p=>({documentForensics:p.documentForensics})),
    get_case:action('get_case','Get Investigation Status','Read saved case status. This does not advance processing or imply approval.','getCase',[idField('caseId','Case ID')],p=>({caseId:p.caseId})),
    get_brief:action('get_brief','Get Saved Decision Brief','Read the released Decision Brief for a known case. A not-ready response is not a negative finding.','getBrief',[idField('caseId','Case ID')],p=>({caseId:p.caseId})),
    get_export:action('get_export','Get Report Delivery Options','Retrieve available report links. Website downloads require sign-in to the same account.','getExport',[idField('reportId','Report ID')],p=>({reportId:p.reportId})),
    get_usage:action('get_usage','Get Account Usage','Read account analysis credits and API request usage. This request counts toward API usage.','usage',[],()=>({})),
  },
};
