import { join } from 'node:path';
import { root, readJson, sourceEntries, writeArchive, main } from './lib.mjs';
import { validateSource } from './validation.mjs';
main(async () => {
  await validateSource();
  const { version } = await readJson(join(root, 'package.json'));
  const inventory = await writeArchive(`ultiwrite-m365-source-${version}.zip`, await sourceEntries(), 'source-kit-not-installable');
  console.log(`Built dist/${inventory.file}\nSHA-256 ${inventory.sha256}\n${inventory.members.length} source files. This source kit must be provisioned before an installable Microsoft app can be produced.`);
});
