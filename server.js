const fs = require('fs');
const path = require('path');

const backendEntry = path.join(__dirname, 'backend', 'server.js');

if (!fs.existsSync(backendEntry)) {
  console.error(`SmartVet backend entry file not found: ${backendEntry}`);
  process.exit(1);
}

process.chdir(path.dirname(backendEntry));
console.log(`Starting SmartVet backend from: ${process.cwd()}`);

require(backendEntry);
