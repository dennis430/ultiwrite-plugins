const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error('Node.js 22.13 or newer is required. Install a current Node LTS release, then reopen this launcher.');
  process.exit(1);
}
console.log(`Node ${process.versions.node}; publisher: ultiwrite.co; package: ultiwrite@0.1.0`);
