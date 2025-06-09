#!/bin/sh
# scripts/clean-forbidden.sh
# Deletes forbidden lock files and node_modules in root and example/, if present.

rm -f package-lock.json pnpm-lock.yaml

rm -rf node_modules

rm -f example/package-lock.json example/pnpm-lock.yaml

rm -rf example/node_modules

echo "Cleaned up forbidden lock files and node_modules if they existed."
