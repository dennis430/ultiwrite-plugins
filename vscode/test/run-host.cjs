const path = require('node:path');
const { runTests } = require('@vscode/test-electron');
runTests({
  version: process.env.ULTIWRITE_TEST_VSCODE_VERSION || '1.102.3',
  extensionDevelopmentPath: path.resolve(__dirname, '..'),
  extensionTestsPath: path.resolve(__dirname, 'host-suite.cjs'),
  launchArgs: ['--disable-extensions', '--disable-workspace-trust', '--no-sandbox', '--disable-gpu', '--skip-welcome', '--skip-release-notes'],
}).catch(error => { console.error(error.message); process.exitCode = 1; });
