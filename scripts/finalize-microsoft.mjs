#!/usr/bin/env node
// Local prerequisite checker, not Microsoft certification or schema approval.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export function finalize(template,discovery,env){
 const guid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 for(const k of ['ULTIWRITE_MS_APP_ID','ULTIWRITE_MS_CONNECTOR_ID'])if(!guid.test(env[k]??''))throw Error('Real Microsoft app and connector GUIDs are required.');
 let vault;try{vault=new URL(env.ULTIWRITE_MS_VAULT_URI);}catch{throw Error('A real vault authorization URI is required.');}
 if(vault.protocol!=='https:'||!vault.hostname.endsWith('.vault.azure.net')||vault.username||vault.password||!/^\/secrets\/[A-Za-z0-9-]+(?:\/[A-Fa-f0-9]+)?$/.test(vault.pathname)||vault.search||vault.hash)throw Error('Invalid vault authorization reference.');
 const tools=discovery.tools??discovery.result?.tools;
 if(!Array.isArray(tools)||tools.length===0)throw Error('Actual tools/list discovery is required.');
 const names=new Set();for(const t of tools){if(!/^ultiwrite_[a-z_]+$/.test(t.name??'')||names.has(t.name)||!t.inputSchema||t.inputSchema.type!=='object')throw Error('Invalid or duplicate discovered tool.');names.add(t.name);}
 const manifest=structuredClone(template);manifest.id=env.ULTIWRITE_MS_APP_ID;manifest.agentConnectors[0].id=env.ULTIWRITE_MS_CONNECTOR_ID;manifest.agentConnectors[0].toolSource.remoteMcpServer.authorization.referenceId=vault.href;
 if(JSON.stringify(manifest).includes('REQUIRED_'))throw Error('Unresolved required values.');
 return {manifest,tools:{tools},receipt:{nativeValidation:'NOT_RUN',hostAcceptance:'NOT_RUN',publication:'NOT_PERFORMED',note:'Confirm the current Microsoft tool-file schema and tenant authorization before submission.'}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const [template,tools,out]=process.argv.slice(2);if(!out)throw Error('Usage: node finalize-microsoft.mjs manifest.template.json tools.discovery.json output-directory');const r=finalize(JSON.parse(await readFile(template,'utf8')),JSON.parse(await readFile(tools,'utf8')),process.env);await mkdir(out,{recursive:true});for(const [n,v] of [['manifest.json',r.manifest],['mcptools.json',r.tools],['LOCAL_CHECK.json',r.receipt]])await writeFile(join(out,n),JSON.stringify(v,null,2)+'\n');console.log('Local prerequisites passed. Native validation, icons, tenant configuration and host acceptance are still required.');}catch(e){console.error(e.message);process.exitCode=1;}
}
