#!/usr/bin/env node
// scripts/ensure-yarn.js
const fs = require('fs');
const path = require('path');

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  }
}

function deleteDirectory(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.rmSync(directoryPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${directoryPath}`);
  }
}

if (!process.env.npm_config_user_agent?.includes('yarn')) {
  // Clean forbidden files and directories
  deleteFile(path.join(__dirname, '../package-lock.json'));
  deleteFile(path.join(__dirname, '../pnpm-lock.yaml'));
  deleteDirectory(path.join(__dirname, '../node_modules'));

  const examplePath = path.join(__dirname, '../example');
  deleteFile(path.join(examplePath, 'package-lock.json'));
  deleteFile(path.join(examplePath, 'pnpm-lock.yaml'));
  deleteDirectory(path.join(examplePath, 'node_modules'));

  console.warn('Warning: We have removed node_modules and lockfiles');
  console.error(
    'Error: This project uses Yarn. Please use "yarn install" instead of npm or pnpm to avoid dependency issues.'
  );
  process.exit(1);
}
