'use strict';
const text=document.getElementById('evidence'),status=document.getElementById('status'),save=document.getElementById('save');
text.addEventListener('input',()=>{save.disabled=!text.value.trim();});
document.getElementById('capture').addEventListener('click',async()=>{
 try {
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id||!/^https?:\/\//.test(tab.url||''))throw Error('Open a regular HTTP or HTTPS webpage first.');
  const results=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>({text:String(window.getSelection()).slice(0,100000),title:document.title,url:location.origin+location.pathname})});
  const value=results?.[0]?.result;if(!value?.text?.trim())throw Error('Select relevant text on the page first.');
  text.value=['USER-SELECTED WEB EVIDENCE','Title: '+value.title,'Source (query/fragment excluded): '+value.url,'Captured: '+new Date().toISOString(),'Provenance: browser-derived excerpt, not the original artifact.','',value.text].join('\n');
  save.disabled=false;status.textContent='Captured locally. Review and remove anything sensitive before exporting.';
 } catch(e){status.textContent=e?.message||'The browser blocked capture on this page.';}
});
save.addEventListener('click',()=>{
 if(!text.value.trim())return;
 const blob=new Blob([text.value],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='Ultiwrite-Evidence-'+new Date().toISOString().slice(0,10)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status.textContent='Evidence file saved locally. Upload it explicitly in Ultiwrite. No analysis has started.';
});
document.getElementById('open').addEventListener('click',()=>chrome.tabs.create({url:'https://dwsoffshorepartners.com/dashboard'}));
