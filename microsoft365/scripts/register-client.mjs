import { environmentName, loadEnvironment, saveEnvironment, discovery, service, publicRegistrationRequest, checkRegistrationResult, ensureClientId, assert, main } from './lib.mjs';
main(async () => {
  const name = environmentName();
  const values = await loadEnvironment(name);
  if (values.ULTIWRITE_MCP_CLIENT_ID) {
    ensureClientId(values);
    console.log(`A public client is already configured for ${name}; no new registration was made.`);
    return;
  }
  await discovery();
  const response = await fetch(service.registration, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(publicRegistrationRequest()),
  });
  assert(response.ok, `Public client registration returned HTTP ${response.status}. Confirm the exact Teams OAuth callback has been enabled on the deployed service; do not retry by weakening the redirect restriction.`);
  const id = checkRegistrationResult(await response.json());
  await saveEnvironment(name, { ...values, ULTIWRITE_MCP_CLIENT_ID: id });
  console.log(`Registered the public client and saved its ID in local ${name} configuration. No user tokens were requested. Next: npm run provision -- --env ${name}`);
});
