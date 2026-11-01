import { validateSource } from './validation.mjs';
import { main } from './lib.mjs';
main(async () => {
  await validateSource();
  console.log('Source validation passed: official Microsoft app 1.29, agent 1.6, plugin 2.4 and Toolkit 1.13 schemas; static PKCE lifecycle; references; approved icon exports.');
  console.log('Synthetic IDs were used only in memory for schema validation. No tenant app, OAuth token-store registration, installed user journey, or marketplace approval is implied.');
});
