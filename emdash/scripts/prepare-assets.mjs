import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const asset = new URL('../assets/icon.png', import.meta.url);
const expected = '65b8c13d167ae05190f0957f5880449f7133f06d';
const source = 'https://raw.githubusercontent.com/dennis430/ultiwrite-plugins/a5cfcdaf915f68fe1da6fca5194e9bb6239afa44/emdash/assets/icon.png';
const fingerprint = b => createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
try {
  let bytes;
  try { bytes = await readFile(asset); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!bytes) {
    console.log('Fetching the existing Ultiwrite logo from the pinned public repository...');
    const response = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Logo download returned HTTP ${response.status}.`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 100000 || fingerprint(bytes) !== expected) throw new Error('Logo integrity check failed; no file was saved.');
    await mkdir(new URL('../assets/', import.meta.url), {recursive:true});
    await writeFile(asset, bytes, {flag:'wx'});
  }
  if (fingerprint(bytes) !== expected) throw new Error('The local logo differs from the reviewed repository asset.');
  console.log('Ultiwrite logo integrity verified.');
} catch (error) {
  console.error(`Asset preparation stopped: ${error.message}`);
  process.exitCode = 1;
}
