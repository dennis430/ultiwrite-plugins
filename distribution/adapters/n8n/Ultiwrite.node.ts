import type { IExecuteFunctions, IDataObject, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
const BASE = 'https://dwsoffshorepartners.com/api/v1';
const id = (v: unknown): string => { if(typeof v!=='string'||! /^[A-Za-z0-9_-]{1,80}$/.test(v)) throw new Error('Invalid Ultiwrite identifier.');return v; };
export class Ultiwrite implements INodeType {
 description: INodeTypeDescription = {
  displayName:'Ultiwrite',name:'ultiwrite',group:['transform'],version:1,
  description:'Asymmetric diligence and investigative intelligence: secure evidence intake and saved investigation results',
  defaults:{name:'Ultiwrite'},inputs:['main' as NodeConnectionType],outputs:['main' as NodeConnectionType],
  credentials:[{name:'ultiwriteApi',required:true}],
  properties:[
   {displayName:'Operation',name:'operation',type:'options',noDataExpression:true,default:'account',options:[
    {name:'Get Account',value:'account',action:'Get the authorized account'},
    {name:'Get Usage',value:'usage',action:'Get account usage'},
    {name:'List Cases Page',value:'listCases',action:'List a page of cases'},
    {name:'Get Case',value:'getCase',action:'Get case status'},
    {name:'Get Decision Brief',value:'getBrief',action:'Get a saved decision brief'},
    {name:'Get Report Delivery Options',value:'getExport',action:'Get report delivery options'},
    {name:'Create Secure Upload Link',value:'createUploadLink',action:'Create a secure upload link'},
    {name:'Continue Saved Case',value:'continueCase',action:'Continue a saved case'},
   ]},
   {displayName:'Case ID',name:'caseId',type:'string',default:'',required:true,displayOptions:{show:{operation:['getCase','getBrief','continueCase']}},description:'Identifier returned by this account. Continue only when the saved case offers a continuation.'},
   {displayName:'Report ID',name:'reportId',type:'string',default:'',required:true,displayOptions:{show:{operation:['getExport']}}},
   {displayName:'Cursor',name:'cursor',type:'string',default:'',displayOptions:{show:{operation:['listCases']}},description:'Use the returned nextCursor. A page is not the entire case list.'},
   {displayName:'Limit',name:'limit',type:'number',default:10,typeOptions:{minValue:1,maxValue:20},displayOptions:{show:{operation:['listCases']}}},
   {displayName:'Request Document Forensics',name:'documentForensics',type:'boolean',default:false,displayOptions:{show:{operation:['createUploadLink']}},description:'Whether to request the optional document-forensics examination; account entitlements still apply'},
  ],
 };
 async execute(this:IExecuteFunctions):Promise<INodeExecutionData[][]> {
  const output:INodeExecutionData[]=[];
  for(let i=0;i<this.getInputData().length;i++) {
   try {
    const op=this.getNodeParameter('operation',i) as string;
    let path:string; let method:'GET'|'POST'='GET';let body:IDataObject|undefined;
    switch(op) {
     case 'account':path='/me';break;
     case 'usage':path='/usage';break;
     case 'listCases': {
      const limit=Number(this.getNodeParameter('limit',i,10));if(!Number.isInteger(limit)||limit<1||limit>20)throw new Error('Invalid limit.');
      path='/cases?limit='+limit;const cursor=this.getNodeParameter('cursor',i,'');if(cursor)path+='&cursor='+id(cursor);break;
     }
     case 'getCase':case 'getBrief':case 'continueCase':path='/cases/'+id(this.getNodeParameter('caseId',i))+(op==='getBrief'?'/brief':op==='continueCase'?'/continue':'');if(op==='continueCase')method='POST';break;
     case 'getExport':path='/reports/'+id(this.getNodeParameter('reportId',i))+'/export';break;
     case 'createUploadLink': {
      const choice=this.getNodeParameter('documentForensics',i,false);if(typeof choice!=='boolean')throw new Error('Invalid forensics choice.');
      path='/upload-links';method='POST';body={documentForensics:choice};break;
     }
     default:throw new Error('Unsupported operation.');
    }
    const data=await this.helpers.httpRequestWithAuthentication.call(this,'ultiwriteApi',{url:BASE+path,method,headers:{Accept:'application/json'},json:true,disableFollowRedirect:true,timeout:op==='continueCase'?310000:20000,...(body?{body}:{})});
    if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Unexpected response.');
    output.push({json:data as IDataObject,pairedItem:{item:i}});
   } catch {
    const message='Ultiwrite request failed. Check API approval, quota and the saved case before retrying. No completed report is established by this error.';
    if(this.continueOnFail())output.push({json:{error:message},pairedItem:{item:i}});else throw new Error(message);
   }
  }
  return [output];
 }
}
