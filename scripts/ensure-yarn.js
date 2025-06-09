#!/usr/bin/env node
// scripts/ensure-yarn.js
if (!process.env.npm_config_user_agent?.includes('yarn')) {
  require('child_process').execSync('sh scripts/clean-forbidden.sh', {
    stdio: 'inherit',
  });
  console.error(
    'Error: Only yarn is allowed. Please use yarn to install dependencies.'
  );
  process.exit(1);
}
