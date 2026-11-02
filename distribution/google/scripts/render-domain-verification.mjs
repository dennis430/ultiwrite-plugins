#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--input', '--output'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
    throw new Error('Usage: node render-domain-verification.mjs --input GOOGLE_TOKEN_JSON --output PUBLIC_PATH/.well-known/google-connected-apps');
  }
  if (options[args[i]]) throw new Error(`Duplicate option: ${args[i]}`);
  options[args[i]] = args[i + 1];
}
if (!options['--input'] || !options['--output']) throw new Error('Both --input and --output are required. Use the token document downloaded from Google Connected Console.');
const document = JSON.parse(await readFile(options['--input'], 'utf8'));
const tokens = document.verification_tokens;
if (!Array.isArray(tokens) || !tokens.length || tokens.some(token =>
  typeof token !== 'string' || !token.trim() || token !== token.trim() || /[\u0000-\u0020<>]/u.test(token) || /YOUR_VERIFICATION_TOKEN|REPLACE_ME|PLACEHOLDER/i.test(token)
)) throw new Error('Expected a nonempty verification_tokens array containing the exact console-issued tokens.');
const target = path.resolve(options['--output']);
if (path.basename(target) !== 'google-connected-apps' || path.basename(path.dirname(target)) !== '.well-known') {
  throw new Error('Output must be named .well-known/google-connected-apps, with no .json extension.');
}
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify({ verification_tokens: [...new Set(tokens)] }, null, 2)}\n`, { flag: 'wx' });
process.stdout.write(`Created ${target}. Serve it over HTTPS with HTTP 200 and no redirect.\n`);
