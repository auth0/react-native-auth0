#!/usr/bin/env node

/**
 * Documentation Version Management Script
 *
 * Enforces our documentation versioning policy:
 * - Maximum of 2 major version lines at any time
 * - Stable cycle: Latest major + Previous major
 * - Pre-release cycle: Latest major + New pre-release (removes old previous major or current pre-release)
 */

const fs = require('fs');
const path = require('path');
const semver = require('semver');

const DOCS_DIR = './docs';
const VERSIONS_FILE = path.join(DOCS_DIR, 'versions.json');

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  return require('../package.json').version;
}

/**
 * Get all existing version directories
 */
function getExistingVersions() {
  if (!fs.existsSync(DOCS_DIR)) return [];

  return fs
    .readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && semver.valid(entry.name.replace(/^v/, ''))
    )
    .map((entry) => entry.name.replace(/^v/, ''))
    .sort(semver.rcompare);
}

/**
 * Determine which versions to keep based on our policy
 */
function getVersionsToKeep(currentVersion, existingVersions) {
  const allVersions = [...new Set([currentVersion, ...existingVersions])].sort(
    semver.rcompare
  );
  const isCurrentPrerelease = semver.prerelease(currentVersion);

  if (isCurrentPrerelease) {
    // Scenario B: Pre-release - Keep latest stable major + current pre-release major
    const currentMajor = semver.major(currentVersion);
    const stableVersions = allVersions.filter((v) => !semver.prerelease(v));
    const latestStableMajor = stableVersions.find(
      (v) => semver.major(v) < currentMajor
    );

    return [currentVersion, latestStableMajor].filter(Boolean);
  } else {
    // Scenario A: Stable - Keep latest 2 major versions (stable only)
    const stableVersions = allVersions.filter((v) => !semver.prerelease(v));
    const majorVersions = [...new Set(stableVersions.map(semver.major))].slice(
      0,
      2
    );

    return majorVersions.map((major) =>
      stableVersions.find((v) => semver.major(v) === major)
    );
  }
}

/**
 * Clean up old version directories
 */
function cleanupOldVersions(versionsToKeep, existingVersions) {
  const toRemove = existingVersions.filter((v) => !versionsToKeep.includes(v));

  toRemove.forEach((version) => {
    const versionDir = path.join(DOCS_DIR, `v${version}`);
    if (fs.existsSync(versionDir)) {
      console.log(`🗑️  Removing old documentation: v${version}`);
      fs.rmSync(versionDir, { recursive: true, force: true });
    }
  });
}

/**
 * Update versions.json for TypeDoc plugin
 */
function updateVersionsFile(versionsToKeep) {
  const versionsConfig = {
    versions: versionsToKeep.map((version) => ({
      version,
      name: `v${version}`,
      path: `v${version}`,
    })),
  };

  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versionsConfig, null, 2));
  console.log(
    `📝 Updated versions.json with ${versionsToKeep.length} versions`
  );

  // Update version.js with the correct versions
  const versionJsPath = path.join(DOCS_DIR, 'versions.js');
  const versionContent = `'use strict';
  export const DOC_VERSIONS = [${versionsToKeep
    .map((v) => `'v${v}'`)
    .join(', ')}];
  `;
  fs.writeFileSync(versionJsPath, versionContent);
  console.log(
    `📝 Updated version.js with versions: ${versionsToKeep
      .map((v) => `v${v}`)
      .join(', ')}`
  );
  // Update index.html to redirect to the latest version
  const indexPath = path.join(DOCS_DIR, 'index.html');
  const latestVersion = versionsToKeep[0];
  const indexContent = `
    <meta http-equiv="refresh" content="0; url=v${latestVersion}/" />`;
  fs.writeFileSync(indexPath, indexContent);
  console.log(`📝 Updated index.html to redirect to v${latestVersion}`);
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Managing documentation versions...');

  const currentVersion = getCurrentVersion();
  const isPrerelease = semver.prerelease(currentVersion)
    ? 'pre-release'
    : 'stable';
  console.log(`📦 Current version: ${currentVersion} (${isPrerelease})`);

  const existingVersions = getExistingVersions();
  console.log(
    `📚 Found ${existingVersions.length} existing documentation versions`
  );

  const versionsToKeep = getVersionsToKeep(currentVersion, existingVersions);
  console.log(`✅ Keeping ${versionsToKeep.length} versions:`, versionsToKeep);

  cleanupOldVersions(versionsToKeep, existingVersions);
  updateVersionsFile(versionsToKeep);

  console.log('✨ Documentation version management complete!');
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  getExistingVersions,
  getVersionsToKeep,
  cleanupOldVersions,
  updateVersionsFile,
};
