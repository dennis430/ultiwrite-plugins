#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--namespace' || !/^[A-Za-z][A-Za-z0-9]{0,14}$/.test(args[1])) {
  throw new Error('Usage: node scripts/set-namespace.mjs --namespace OWNED_NAMESPACE (1–15 alphanumeric characters; first is a letter)');
}
const target = fileURLToPath(new URL('../sfdx-project.json', import.meta.url));
const project = JSON.parse(await readFile(target, 'utf8'));
project.namespace = args[1];
await writeFile(target, `${JSON.stringify(project, null, 2)}\n`);
process.stdout.write('Namespace set locally. This does not register a namespace or verify ownership in Salesforce.\n');
