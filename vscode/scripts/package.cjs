// Build with the official publisher tool, then normalize ZIP metadata for reproducible bytes.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const cwd = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const archive = path.join(cwd, 'dist', `ultiwrite-${pkg.version}.vsix`);
fs.mkdirSync(path.dirname(archive), { recursive: true });
const vsce = path.join(path.dirname(require.resolve('@vscode/vsce/package.json')), 'vsce');
const result = spawnSync(process.execPath, [vsce, 'package', '--no-dependencies', '--out', archive], { cwd, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const bytes = fs.readFileSync(archive);
let end = bytes.length - 22;
for (; end >= Math.max(0, bytes.length - 65557); end--) if (bytes.readUInt32LE(end) === 0x06054b50) break;
if (end < 0) throw new Error('Invalid ZIP end record');
const stamp = 1767225600; // 2026-01-01 UTC, metadata only.
const date = ((2026 - 1980) << 9) | (1 << 5) | 1;
function extras(offset, length) {
  const limit = offset + length;
  while (offset + 4 <= limit) {
    const tag = bytes.readUInt16LE(offset); const size = bytes.readUInt16LE(offset + 2); const data = offset + 4;
    if (data + size > limit) throw new Error('Invalid ZIP extra field');
    if (tag === 0x5455 && size >= 5) { for (let position = data + 1; position + 4 <= data + size; position += 4) bytes.writeUInt32LE(stamp, position); }
    offset = data + size;
  }
}
let central = bytes.readUInt32LE(end + 16);
for (let entry = 0; entry < bytes.readUInt16LE(end + 10); entry++) {
  if (bytes.readUInt32LE(central) !== 0x02014b50) throw new Error('Invalid ZIP central record');
  bytes.writeUInt16LE(0, central + 12); bytes.writeUInt16LE(date, central + 14);
  const name = bytes.readUInt16LE(central + 28), extra = bytes.readUInt16LE(central + 30), comment = bytes.readUInt16LE(central + 32);
  extras(central + 46 + name, extra);
  const local = bytes.readUInt32LE(central + 42);
  if (bytes.readUInt32LE(local) !== 0x04034b50) throw new Error('Invalid ZIP local record');
  bytes.writeUInt16LE(0, local + 10); bytes.writeUInt16LE(date, local + 12);
  extras(local + 30 + bytes.readUInt16LE(local + 26), bytes.readUInt16LE(local + 28));
  central += 46 + name + extra + comment;
}
fs.writeFileSync(archive, bytes);
console.log(`Reproducible VSIX: ${archive}`);
