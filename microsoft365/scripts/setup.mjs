import { environmentName, loadEnvironment, saveEnvironment, main } from './lib.mjs';
main(async () => {
  const name = environmentName();
  const previous = await loadEnvironment(name, { optional: true });
  const values = {
    TEAMSFX_ENV: name,
    APP_NAME_SUFFIX: name === 'prod' ? '' : `-${name}`,
    TEAMS_APP_ID: '',
    ULTIWRITE_MCP_CLIENT_ID: '',
    ULTIWRITE_MCP_AUTH_ID: '',
    M365_TITLE_ID: '',
    M365_APP_ID: '',
    ...previous,
  };
  await saveEnvironment(name, values);
  console.log(`Prepared local ${name} configuration; preserved existing values. No Microsoft resource or OAuth client was created.`);
});
