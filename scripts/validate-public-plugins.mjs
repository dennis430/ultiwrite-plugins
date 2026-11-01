#!/usr/bin/env node
// Preserve the original checks verbatim for legacy packages and scan all new source too.
import { mkdtempSync, cpSync, readdirSync, statSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(process.argv[2]??process.cwd());
const legacy=['cursor','claude','chatgpt','grokbot','client','scripts','.github','.cursor-plugin','.claude-plugin','README.md','LICENSE','NOTICE','INSTALL.md','server.draft.json','.gitignore','RELEASE_MANIFEST.json','release'];
const added=['distribution','docs','server.json','glama.json','gemini-extension.json','GEMINI.md','.antigravity-plugin','mcp_config.json','skills','VERIFY.cmd','VERIFY.sh'];
const allowed=new Set([...legacy,...added]);
const forbidden=[['engine','dwsoffshorepartners','com'].join('.'),'DATABASE'+'_URL','client'+'_secret','client'+'Secret"','NEXTAUTH'+'_SECRET','-----BEGIN'+' ','AK'+'IA','gh'+'p_','github'+'_pat_','postgres'+'://','postgresql'+'://','mongodb'+'://','mongodb+srv'+'://'];
const errors=[];let count=0;
function walk(dir,parts=[]){for(const n of readdirSync(dir)){if(n==='.git'||n==='node_modules'||n==='__pycache__'||(parts.length===0&&n==='dist'))continue;const p=join(dir,n),rel=[...parts,n].join('/');if(!allowed.has(rel.split('/')[0]))errors.push('Unexpected top-level source: '+rel);if(n.startsWith('.env')||/\.(pem|key|p12|env)$/i.test(n))errors.push('Forbidden file: '+rel);if(statSync(p).isDirectory()){walk(p,[...parts,n]);continue;}count++;if(/(^|\/)(migrations|prisma|ios|app|lib)\//i.test(rel)&&!rel.startsWith('client/lib/')&&rel!=='distribution/lib/partner-client.cjs')errors.push('Forbidden implementation tree: '+rel);if(/\.(png|zip)$/i.test(n))continue;const t=readFileSync(p,'utf8');if(forbidden.some(s=>t.includes(s)))errors.push('Forbidden material: '+rel);}}
walk(root);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const prior=join(root,'.github/validate-legacy-tree.mjs');
if(!existsSync(prior)){console.error('Full-repository legacy validator is required. This source overlay is not the complete repository.');process.exit(1);}
const temp=mkdtempSync(join(tmpdir(),'ultiwrite-legacy-'));
try{for(const n of legacy)if(existsSync(join(root,n)))cpSync(join(root,n),join(temp,n),{recursive:true,filter:p=>!p.split(/[\\/]/).some(s=>['node_modules','.git','__pycache__'].includes(s))});const r=spawnSync(process.execPath,[prior,temp],{stdio:'inherit'});if(r.status!==0)process.exitCode=r.status||1;else console.log(`Full source security/structure checks passed (${count} source files); original package validator retained unchanged.`);}finally{rmSync(temp,{recursive:true,force:true});}
