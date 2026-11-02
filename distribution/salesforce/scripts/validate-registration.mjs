#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = fileURLToPath(new URL('../force-app/main/default/', import.meta.url));
const failures = [];
const groups = {};
for (const folder of ['externalCredentials', 'externalServiceRegistrations', 'namedCredentials', 'permissionsets', 'externalAuthIdentityProviders']) {
  try {
    const names = (await readdir(path.join(base, folder))).filter(name => name.endsWith('-meta.xml'));
    if (!names.length) throw new Error('empty');
    groups[folder] = [];
    for (const name of names) groups[folder].push({ name, text: await readFile(path.join(base, folder, name), 'utf8') });
  } catch {
    failures.push(`Missing retrieved ${folder} metadata. Configure and retrieve the real org connection first.`);
  }
}
for (const files of Object.values(groups)) for (const file of files) {
  if (/<(?:accessToken|refreshToken|consumerSecret|clientSecret|password)>[^<\s][^<]*<\//i.test(file.text)) failures.push(`${file.name}: contains a credential value; exclude credentials from source.`);
  if (/["'](?:accessToken|refreshToken|consumerSecret|clientSecret|password)["']\s*:\s*["'][^"']+/i.test(file.text)) failures.push(`${file.name}: contains an embedded JSON credential value; exclude credentials from source.`);
  for (const block of file.text.matchAll(/<(?:externalCredentialParameters|externalAuthIdentityProviderParameters)>([\s\S]*?)<\/(?:externalCredentialParameters|externalAuthIdentityProviderParameters)>/g)) {
    if (/<(?:parameterName|parameterType)>(?:accessToken|refreshToken|consumerSecret|clientSecret|password)<\//i.test(block[1]) && /<parameterValue>[^<\s][^<]*<\/parameterValue>/.test(block[1])) failures.push(`${file.name}: contains an embedded credential parameter value; exclude credentials from source.`);
  }
  if (/YOUR_[A-Z_]+|REPLACE_ME|\{MCP_SERVER|\{NAMESPACE\}/.test(file.text)) failures.push(`${file.name}: contains unresolved template fields.`);
}
for (const file of groups.externalCredentials ?? []) {
  if (!/<authenticationProtocol>OAuth<\/authenticationProtocol>/.test(file.text)) failures.push(`${file.name}: expected OAuth authentication, not no-auth/custom bypass.`);
  if (!file.text.includes('PerUserPrincipal')) failures.push(`${file.name}: expected per-user principal for account isolation.`);
  if (/NoAuthentication|ClientCredentials/.test(file.text)) failures.push(`${file.name}: incompatible shared/no-auth flow for this release.`);
}
for (const file of groups.externalServiceRegistrations ?? []) {
  if (!/<registrationProviderType>ModelContextProtocol<\/registrationProviderType>/.test(file.text) || !/<schemaType>ModelContextProtocol<\/schemaType>/.test(file.text)) failures.push(`${file.name}: expected MCP registration and schema types.`);
  if (/<status>Incomplete<\/status>/.test(file.text)) failures.push(`${file.name}: registration is still incomplete.`);
}
for (const file of groups.namedCredentials ?? []) {
  if (!file.text.includes('https://mcp.dwsoffshorepartners.com/mcp')) failures.push(`${file.name}: unexpected MCP endpoint.`);
  if (/<generateAuthorizationHeader>false<\/generateAuthorizationHeader>/.test(file.text)) failures.push(`${file.name}: authorization header generation is disabled.`);
}
const allPermissions = (groups.permissionsets ?? []).map(file => file.text).join('\n');
if (groups.permissionsets && !allPermissions.includes('externalCredentialPrincipalAccesses')) failures.push('Permission set does not grant external credential principal access.');
if (failures.length) {
  process.stderr.write(`${failures.map(message => `BLOCKED: ${message}`).join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('Retrieved registration passed local source checks. This is not a Salesforce deployment, OAuth exchange, managed-package validation or security-review result.\n');
