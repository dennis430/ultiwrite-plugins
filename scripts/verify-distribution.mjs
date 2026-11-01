#!/usr/bin/env node
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const folder=join(root,'distribution/verification');mkdirSync(folder,{recursive:true});
const tests=readdirSync(join(root,'distribution/tests')).filter(n=>/\.test\.(cjs|mjs)$/.test(n)).sort().map(n=>'distribution/tests/'+n);
const results=[];
function run(name,cmd,args,optional=false){const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});const output=(r.stdout??'')+(r.stderr??'');writeFileSync(join(folder,name+'.log'),output);const status=r.error&&optional?'NOT_RUN':r.status===0?'PASS':'FAIL';results.push({name,status,command:[cmd,...args].join(' ')});console.log(name+': '+status);if(status==='FAIL'){console.error(output.slice(-4000));process.exitCode=1;}return r;}
run('javascript-tests',process.execPath,['--experimental-strip-types','--test',...tests]);
run('wordpress-syntax','php',['-l','distribution/adapters/wordpress/ultiwrite.php'],true);
run('wordpress-functions','php',['distribution/tests/wordpress.php'],true);
for(const p of ['distribution/adapters/google-workspace/Code.js','distribution/adapters/chrome/popup.js','scripts/capture-mcp-tools.mjs'])run(p.split('/').at(-1).replace(/\./g,'-')+'-syntax',process.execPath,['--check',p]);
run('generation',process.execPath,['scripts/build-distribution.mjs']);
writeFileSync(join(folder,'RESULTS.json'),JSON.stringify({checks:results,nativePlatformValidation:'NOT_RUN',authenticatedCustomerJourney:'NOT_RUN',marketplaceSubmission:'NOT_PERFORMED'},null,2)+'\n');
