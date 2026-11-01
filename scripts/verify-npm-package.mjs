#!/usr/bin/env node
// Exercise the tarball consumers install, without touching real client settings.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const runFile = promisify(execFile);

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const temporary = mkdtempSync(join(realpathSync(tmpdir()), 'ultiwrite package check '));
const consumer = join(temporary, 'clean project');
const cache = join(temporary, 'npm cache');
mkdirSync(consumer);

// npm run provides this on all supported operating systems. Known Node layouts
// also allow a direct `node scripts/verify-npm-package.mjs` invocation.
const npmScript = [
  process.env.npm_execpath,
  join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  resolve(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
].find(path => path && /\.[cm]?js$/.test(path) && existsSync(path));

async function npm(args, cwd = consumer) {
  if (!npmScript && process.platform === 'win32') {
    throw new Error('Run this check with npm run test:package so npm provides its cross-platform executable path.');
  }
  try {
    const child = await runFile(npmScript ? process.execPath : 'npm', npmScript ? [npmScript, ...args] : args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    timeout: 120_000,
    maxBuffer: 8 * 1024 * 1024,
    env: {
      ...process.env,
      npm_config_cache: cache,
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_update_notifier: 'false',
    },
    });
    return child.stdout.trim();
  } catch (error) {
    throw new Error(`npm ${args[0]} failed: ${error.message}\n${error.stdout ?? ''}${error.stderr ?? ''}`);
  }
}

function cli(...args) {
  return npm(['exec', '--offline', '--yes=false', '--', 'ultiwrite', ...args]);
}

try {
  const packed = JSON.parse(await npm(['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root));
  assert.equal(packed.length, 1, 'Expected one root npm package');
  const archive = packed[0];
  assert.equal(archive.name, '@ultiwrite/cli');
  assert.equal(archive.version, pkg.version);
  const allowedFiles = new Set(['package.json', 'README.md', 'INSTALL.md', 'LICENSE', 'NOTICE', 'cli/README.md', 'cli/bin/ultiwrite.mjs', 'cli/lib/config.mjs', 'cli/lib/codex.mjs']);
  const paths = archive.files.map(file => file.path);
  for (const path of paths) {
    assert.ok(allowedFiles.has(path), `Unexpected packed file: ${path}`);
  }
  assert.equal(paths.length, allowedFiles.size, 'Package must contain exactly the reviewed files');
  for (const path of allowedFiles) {
    assert.ok(paths.includes(path), `Missing packed file: ${path}`);
  }
  assert.equal(pkg.bin.ultiwrite, 'cli/bin/ultiwrite.mjs');
  assert.ok(readFileSync(join(root, pkg.bin.ultiwrite), 'utf8').startsWith('#!/usr/bin/env node\n'), 'CLI needs a portable node shebang');

  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'ultiwrite-install-smoke', private: true, version: '1.0.0' }));
  await npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', join(temporary, archive.filename)]);

  assert.equal(await cli('--version'), pkg.version, 'Installed bin version mismatch');
  assert.match(await cli('--help'), /ultiwrite/i, 'Installed help must identify Ultiwrite');
  const configPath = join(consumer, 'config with spaces', 'mcp.json');
  mkdirSync(dirname(configPath));
  const before = '{\n  "mcpServers": { "existing": { "url": "https://example.com/mcp" } },\n  "otherSetting": true\n}\n';
  writeFileSync(configPath, before);
  await cli('install', 'cursor', '--scope', 'project', '--config', configPath, '--dry-run');
  assert.equal(readFileSync(configPath, 'utf8'), before, 'Dry run changed configuration');
  await cli('install', 'cursor', '--scope', 'project', '--config', configPath);
  const after = readFileSync(configPath, 'utf8');
  const config = JSON.parse(after);
  assert.equal(config.mcpServers.ultiwrite.url, 'https://mcp.dwsoffshorepartners.com/mcp');
  assert.equal(config.mcpServers.existing.url, 'https://example.com/mcp');
  assert.equal(config.otherSetting, true);
  await cli('install', 'cursor', '--scope', 'project', '--config', configPath);
  assert.equal(readFileSync(configPath, 'utf8'), after, 'Repeat installation should be a no-op');
  await cli('status', 'cursor', '--scope', 'project', '--config', configPath);
  await cli('uninstall', 'cursor', '--scope', 'project', '--config', configPath);
  const removed = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.ok(!Object.hasOwn(removed.mcpServers, 'ultiwrite'), 'Uninstall retained the Ultiwrite entry');
  assert.equal(removed.mcpServers.existing.url, 'https://example.com/mcp');
  assert.equal(removed.otherSetting, true);
  await cli('doctor', '--offline');
  console.log(`Packed ${archive.name}@${archive.version}: ${paths.length} allowed files; isolated npm execution, install, dry-run, repeat install, status, removal, and offline doctor passed.`);
} finally {
  rmSync(temporary, { recursive: true, force: true, maxRetries: 3 });
}
