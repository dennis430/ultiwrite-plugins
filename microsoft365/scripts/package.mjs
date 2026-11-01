import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { root, environmentName, loadEnvironment, renderManifests, jsonBytes, writeArchive, main } from './lib.mjs';
import { validateManifests, validateIcons, validateLifecycle } from './validation.mjs';
main(async () => {
  const name = environmentName();
  const manifests = await renderManifests(await loadEnvironment(name));
  await validateManifests(manifests);
  await validateIcons();
  await validateLifecycle();
  const entries = {
    'manifest.json': jsonBytes(manifests.app),
    'declarativeAgent.json': jsonBytes(manifests.agent),
    'ai-plugin.json': jsonBytes(manifests.plugin),
    'color.png': await readFile(join(root, 'appPackage/color.png')),
    'outline.png': await readFile(join(root, 'appPackage/outline.png')),
  };
  const inventory = await writeArchive(`ultiwrite-m365-${name}-${manifests.app.version}.zip`, entries, 'tenant-configured-app-package');
  console.log(`Built dist/${inventory.file}\nSHA-256 ${inventory.sha256}\nRun Microsoft's authenticated package validation and the reviewer scenarios before submitting. This command does not publish.`);
});
