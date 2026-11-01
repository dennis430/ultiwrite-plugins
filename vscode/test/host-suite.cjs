const assert = require('node:assert/strict');
const vscode = require('vscode');
exports.run = async function () {
  const extension = vscode.extensions.all.find(value => value.packageJSON.name === 'ultiwrite');
  assert.ok(extension, 'VS Code must load the packaged extension');
  const api = await extension.activate();
  assert.equal(api.providerId, 'ultiwrite.mcp');
  const commands = await vscode.commands.getCommands(true);
  for (const name of ['connect', 'reconnect', 'switchAccount', 'disconnect', 'analyzeFiles', 'listCases', 'checkStatus', 'openReport', 'account', 'dashboard', 'help']) {
    assert.ok(commands.includes('ultiwrite.' + name), 'missing command: ' + name);
  }
  assert.equal(typeof vscode.lm.registerMcpServerDefinitionProvider, 'function');
  console.log('PASS actual VS Code extension activation, stable MCP provider API and 11 command registrations');
};
