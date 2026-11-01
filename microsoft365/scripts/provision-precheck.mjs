import { ensureClientId, environmentName, loadEnvironment, main } from './lib.mjs';
main(async () => {
  const name = environmentName(['--env', process.env.TEAMSFX_ENV || 'dev']);
  const values = { ...await loadEnvironment(name, { optional: true }), ...process.env };
  ensureClientId(values);
  console.log('Public client is configured. Provisioning will create or update Microsoft app and OAuth token-store resources.');
});
