import type { ICredentialType, INodeProperties, IAuthenticateGeneric, ICredentialTestRequest } from 'n8n-workflow';
export class UltiwriteApi implements ICredentialType {
 name='ultiwriteApi';displayName='Ultiwrite API';documentationUrl='https://dwsoffshorepartners.com/docs/api';
 properties:INodeProperties[]=[{displayName:'API Key',name:'apiKey',type:'string',typeOptions:{password:true},default:'',required:true,description:'Requires explicit Ultiwrite API approval. Create a key in Dashboard > API access.'}];
 authenticate:IAuthenticateGeneric={type:'generic',properties:{headers:{Authorization:'=Bearer {{$credentials.apiKey}}'}}};
 test:ICredentialTestRequest={request:{baseURL:'https://dwsoffshorepartners.com/api/v1',url:'/me',method:'GET'}};
}
