import Ajv from 'ajv';
import AjvDraft04 from 'ajv-draft-04';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { root, require, readJson, assert, renderManifests, sourceFixture, service, sha256 } from './lib.mjs';

const toolkitRoot = dirname(require.resolve('@microsoft/m365agentstoolkit-cli/package.json'));
export async function validateSchema(data, schemaPath, draft04 = true) {
  const schema = await readJson(join(toolkitRoot, schemaPath));
  const validator = draft04 ? new AjvDraft04({ strict: false, allErrors: true }) : new Ajv({ strict: false, allErrors: true });
  addFormats(validator);
  const valid = validator.compile(schema);
  assert(valid(data), `Official schema validation failed for ${schemaPath}: ${JSON.stringify(valid.errors)}`);
}
export async function validateManifests({ app, agent, plugin }) {
  await validateSchema(app, 'json-schemas/teams/v1.29/MicrosoftTeams.schema.json');
  await validateSchema(agent, 'json-schemas/copilot/declarative-agent/v1.6/schema.json');
  await validateSchema(plugin, 'json-schemas/copilot/plugin/v2.4/schema.json');
  const pkg = await readJson(join(root, 'package.json'));
  assert(app.version === pkg.version, 'Application/package version mismatch.');
  assert(app.copilotAgents.declarativeAgents.length === 1 && app.copilotAgents.declarativeAgents[0].file === 'declarativeAgent.json', 'Broken declarative agent reference.');
  assert(agent.actions.length === 1 && agent.actions[0].file === 'ai-plugin.json', 'Broken plugin reference.');
  assert(app.icons.color === 'color.png' && app.icons.outline === 'outline.png', 'Unexpected icon references.');
  assert(!app.permissions && !app.webApplicationInfo && !app.bots && !app.staticTabs, 'Unexpected app capability: review permissions before expanding this thin connector.');
  assert(!agent.capabilities, 'This agent should use only its configured remote MCP action.');
  assert(plugin.functions.length === 0 && plugin.runtimes.length === 1, 'Dynamic tool discovery should have no pinned tool definitions.');
  const runtime = plugin.runtimes[0];
  assert(runtime.type === 'RemoteMCPServer' && runtime.spec.url === service.resource && runtime.run_for_functions.length === 1 && runtime.run_for_functions[0] === '*', 'MCP dynamic runtime contract changed.');
  assert(runtime.auth.type === 'OAuthPluginVault' && runtime.auth.reference_id, 'Missing OAuth token-store reference.');
  assert(!Object.hasOwn(runtime.spec, 'mcp_tool_description'), 'Dynamic discovery must not contain a static tool manifest.');
  assert(agent.instructions.length > 3000 && !agent.instructions.includes('$[file('), 'Instructions were not compiled.');
  for (const marker of ['documentForensics', 'attachment_not_transferred', 'same snapshot', 'savedDecision', 'linkedReportId', 'uploadLink', 'data']) {
    assert(agent.instructions.includes(marker), `Missing critical workflow instruction: ${marker}.`);
  }
}
export async function validateLifecycle() {
  const primary = await readFile(join(root, 'm365agents.yml'), 'utf8');
  const local = await readFile(join(root, 'm365agents.local.yml'), 'utf8');
  assert(primary === local, 'Local and remote lifecycle must use the same public PKCE configuration.');
  const lifecycle = parse(primary);
  await validateSchema(lifecycle, 'resource/yaml-schema/v1.13/yaml.schema.json', false);
  assert(!lifecycle.publish, 'Publication must be a separate reviewed action.');
  const oauth = lifecycle.provision.find(step => step.uses === 'oauth/register');
  assert(oauth && oauth.with.isPKCEEnabled === true && oauth.with.identityProvider === 'Custom' && oauth.with.tokenExchangeMethodType === 'PostRequestBody', 'Static public PKCE OAuth provisioning is required.');
  assert(oauth.with.applicableToApps === 'AnyApp' && oauth.with.targetAudience === 'AnyTenant', 'Microsoft OAuth token-store audience must support the distributed agent.');
  assert(oauth.with.authorizationUrl === service.authorization && oauth.with.tokenUrl === service.token && oauth.with.baseUrl === service.resource, 'OAuth lifecycle endpoint mismatch.');
  assert(oauth.with.scope === service.scopes.join(','), 'Toolkit scopes must use comma-separated values.');
  assert(Object.keys(oauth.with).every(key => !/secret/i.test(key)), 'Public client lifecycle cannot carry credential fields.');
  assert(lifecycle.provision.some(step => step.uses === 'teamsApp/extendToM365' && step.with.scope === 'personal'), 'Missing personal Microsoft 365 extension step.');
}
export async function validateIcons() {
  const provenance = await readJson(join(root, 'assets/provenance.json'));
  assert(sha256(await readFile(join(root, provenance.bundledSource))) === provenance.sourceSha256, 'Approved logo source hash changed.');
  for (const [file, expected] of Object.entries(provenance.outputs)) {
    const bytes = await readFile(join(root, file));
    assert(sha256(bytes) === expected.sha256, `Icon hash mismatch for ${file}. Run npm run icons after a reviewed source change.`);
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert(info.width === expected.dimensions[0] && info.height === expected.dimensions[1], `Wrong icon dimensions: ${file}.`);
    let opaque = 0, transparent = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 255) opaque++;
      if (data[i + 3] === 0) transparent++;
      if (file.endsWith('outline.png') && data[i + 3] > 0) assert(data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255, 'Outline must be white wherever visible.');
    }
    if (file.endsWith('color.png')) assert(opaque === info.width * info.height, 'Color icon must be fully opaque.');
    else assert(opaque > 0 && transparent > 0, 'Outline must contain a visible white mark and transparent background.');
  }
}
export async function validateCertificationTemplate() {
  const template = await readJson(join(root, 'certification/manifest.template.json'));
  assert(template.id === '${{CERTIFICATION_APP_ID}}', 'Certification draft must retain its unprovisioned app ID.');
  const auth = template.agentConnectors[0].toolSource.remoteMcpServer.authorization;
  assert(auth.type === 'AzureKeyVault' && auth.referenceId === '${{CERTIFICATION_KEY_VAULT_URI}}', 'Certification draft must retain its unprovisioned vault URI.');
  template.id = sourceFixture.TEAMS_APP_ID;
  auth.referenceId = 'https://source-schema-validation-only.vault.azure.net/';
  await validateSchema(template, 'json-schemas/teams/v1.29/MicrosoftTeams.schema.json');
  // Referenced mcptools.json is intentionally not fabricated: this is shape validation only.
}
export async function validateSource() {
  await validateManifests(await renderManifests(sourceFixture, { sourceOnly: true }));
  await validateLifecycle();
  await validateIcons();
  await validateCertificationTemplate();
}
