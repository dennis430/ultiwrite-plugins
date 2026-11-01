/* Ultiwrite thin Workspace connector. No Drive file reading, background uploads or logging. */
var UW_ORIGIN='https://dwsoffshorepartners.com';
function uwEscape(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uwInput(e,name){var inputs=e&&e.commonEventObject&&e.commonEventObject.formInputs;var item=inputs&&inputs[name];return item&&item.stringInputs&&item.stringInputs.value&&item.stringInputs.value[0]||'';}
function uwButton(text,fn){return CardService.newTextButton().setText(text).setOnClickAction(CardService.newAction().setFunctionName(fn));}
function uwCard(title,section){return CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle(title).setSubtitle('Asymmetric diligence & investigative intelligence')).addSection(section).build();}
function uwAction(card){return CardService.newActionResponseBuilder().setNavigation(CardService.newNavigation().updateCard(card)).build();}
function uwError(){return uwCard('Action not completed',CardService.newCardSection().addWidget(CardService.newTextParagraph().setText('Check API approval, credentials, quota and the saved case. No completed analysis is established. Do not share credentials with support.')));}
function uwApi(path,method,body,key){
 if(!/^\/(me|usage|upload-links|cases\/[A-Za-z0-9_-]{1,80}(\/brief)?)$/.test(path))throw new Error('Unsupported route');
 key=key||PropertiesService.getUserProperties().getProperty('ULTIWRITE_API_KEY');
 if(!key||/[\r\n]/.test(key)||key.length>4096)throw new Error('Connect account');
 var options={method:method||'get',headers:{Authorization:'Bearer '+key,Accept:'application/json'},followRedirects: false,muteHttpExceptions:true};
 if(body){options.contentType='application/json';options.payload=JSON.stringify(body);}
 var r=UrlFetchApp.fetch(UW_ORIGIN+'/api/v1'+path,options),status=r.getResponseCode();
 if(status<200||status>=300)throw new Error('Ultiwrite HTTP '+status);
 var raw=r.getContentText();if(raw.length>2000000)throw new Error('Response too large');
 var parsed=JSON.parse(raw);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw new Error('Unexpected response');return parsed;
}
function ultiwriteHome(){
 var s=CardService.newCardSection().addWidget(CardService.newTextParagraph().setText('Your documents are the starting point, not the limits of the investigation. Access secure evidence intake and saved results without automatically sending Drive content.'));
 if(!PropertiesService.getUserProperties().getProperty('ULTIWRITE_API_KEY')){
  s.addWidget(CardService.newTextParagraph().setText('Requires explicit Ultiwrite API approval. Enter a dashboard API key below. This field is not masked: use a private screen. It is stored in this add-on\'s per-user server properties, not shared script properties.'));
  s.addWidget(CardService.newTextInput().setFieldName('apiKey').setTitle('Ultiwrite dashboard API key'));
  s.addWidget(uwButton('Verify and save connection','ultiwriteConnect'));
 }else{
  s.addWidget(uwButton('Check connected account','ultiwriteAccount')).addWidget(uwButton('Read usage','ultiwriteUsage'));
  s.addWidget(CardService.newTextParagraph().setText('Create a sensitive, short-lived upload link for your own evidence. This does not automatically read or send selected Drive files. Document forensics is not requested by this action.'));
  s.addWidget(uwButton('Create secure upload link','ultiwriteUpload'));
  s.addWidget(CardService.newTextInput().setFieldName('caseId').setTitle('Known case ID'));
  s.addWidget(uwButton('Read saved Decision Brief','ultiwriteBrief'));
  s.addWidget(uwButton('Remove saved key','ultiwriteDisconnect'));
 }
 return uwCard('Ultiwrite',s);
}
function ultiwriteConnect(e){try{var key=uwInput(e,'apiKey').trim();uwApi('/me','get',null,key);PropertiesService.getUserProperties().setProperty('ULTIWRITE_API_KEY',key);return uwAction(ultiwriteHome());}catch(_){return uwAction(uwError());}}
function ultiwriteDisconnect(){PropertiesService.getUserProperties().deleteProperty('ULTIWRITE_API_KEY');return uwAction(uwCard('Connection removed',CardService.newCardSection().addWidget(CardService.newTextParagraph().setText('The stored key was deleted from this add-on. Revoke it in Ultiwrite API access as well if it should no longer work elsewhere.'))));}
function uwResult(title,data){var raw=JSON.stringify(data,null,2);var truncated=raw.length>9000;return uwCard(title,CardService.newCardSection().addWidget(CardService.newTextParagraph().setText(uwEscape(raw.slice(0,9000)))).addWidget(CardService.newTextParagraph().setText(truncated?'Partial preview only. Read the complete report in Ultiwrite.':'Saved API output; not an approval or guarantee. A not-ready response is not negative evidence.')).addWidget(CardService.newTextButton().setText('Open Ultiwrite').setOpenLink(CardService.newOpenLink().setUrl(UW_ORIGIN+'/dashboard'))));}
function ultiwriteAccount(){try{return uwAction(uwResult('Connected account',uwApi('/me')));}catch(_){return uwAction(uwError());}}
function ultiwriteUsage(){try{return uwAction(uwResult('Account usage',uwApi('/usage')));}catch(_){return uwAction(uwError());}}
function ultiwriteBrief(e){try{var id=uwInput(e,'caseId');if(!/^[A-Za-z0-9_-]{1,80}$/.test(id))throw Error('Invalid case');return uwAction(uwResult('Saved Decision Brief',uwApi('/cases/'+id+'/brief')));}catch(_){return uwAction(uwError());}}
function ultiwriteUpload(){
 try{var data=uwApi('/upload-links','post',{documentForensics:false});
 if(typeof data.url!=='string'||!data.url.startsWith(UW_ORIGIN+'/api/integrations/ultiwrite/upload?'))throw Error('Unexpected upload URL');
 return uwAction(uwCard('Secure evidence intake',CardService.newCardSection().addWidget(CardService.newTextParagraph().setText('Open the single-use uploader now. Do not share this link publicly. Existing account limits and analysis credits apply.')).addWidget(CardService.newTextButton().setText('Open secure uploader').setOpenLink(CardService.newOpenLink().setUrl(data.url)))));
 }catch(_){return uwAction(uwError());}
}
