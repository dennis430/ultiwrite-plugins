#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const options = {
  '--registration': 'Ultiwrite',
  '--named-credential': 'Ultiwrite',
  '--external-credential': 'UltiwriteOAuth',
  '--permission-set': 'Ultiwrite_Perm_Set',
  '--identity-provider': 'UltiwriteIdentity'
};
const args = process.argv.slice(2);
if (args.includes('--help')) {
  process.stdout.write('Usage: node scripts/retrieve-registration.mjs --org AUTHENTICATED_ORG_ALIAS [--registration NAME] [--named-credential NAME] [--external-credential NAME] [--permission-set NAME] [--identity-provider NAME]\nRetrieves configured connection metadata; does not deploy, create a package, promote or publish.\n');
  process.exit(0);
}
for (let i = 0; i < args.length; i += 2) {
  if (!(args[i] in options || args[i] === '--org') || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Unknown or missing option; use --help.');
  options[args[i]] = args[i + 1];
}
if (!options['--org']) throw new Error('An authenticated --org alias is required.');
for (const [key, value] of Object.entries(options)) {
  if (key !== '--org' && !/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) throw new Error(`Invalid metadata developer name for ${key}`);
}
const command = ['project', 'retrieve', 'start', '--target-org', options['--org']];
for (const [type, key] of [
  ['ExternalServiceRegistration', '--registration'],
  ['NamedCredential', '--named-credential'],
  ['ExternalCredential', '--external-credential'],
  ['PermissionSet', '--permission-set'],
  ['ExternalAuthIdentityProvider', '--identity-provider']
]) command.push('--metadata', `${type}:${options[key]}`);
const result = spawnSync('sf', command, { cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit', shell: false });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
process.stdout.write('Retrieved metadata. Run node scripts/validate-registration.mjs and review the files before committing or packaging.\n');
