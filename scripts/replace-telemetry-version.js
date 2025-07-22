const fs = require('fs');
const path = require('path');

const version = require('../package.json').version;
const targetFile = path.resolve(__dirname, '../src/core/utils/telemetry.ts');

let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/__SDK_VERSION__/g, version);

fs.writeFileSync(targetFile, content);
console.log(`SDK version set to ${version}`);
