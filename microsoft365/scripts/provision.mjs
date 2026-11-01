import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { root, require, environmentName, loadEnvironment, ensureClientId, main } from './lib.mjs';
main(async () => {
  const name = environmentName();
  ensureClientId(await loadEnvironment(name));
  const cli = join(dirname(require.resolve('@microsoft/m365agentstoolkit-cli/package.json')), 'cli.js');
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'provision', '--env', name], { cwd: root, stdio: 'inherit', env: process.env });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
  if (result.signal) throw new Error(`Microsoft provisioning interrupted by ${result.signal}. Inspect the local environment before retrying.`);
  process.exitCode = result.code ?? 1;
});
