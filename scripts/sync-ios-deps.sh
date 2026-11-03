#!/bin/bash

# Copies the Auth0 native dependency versions pinned in spm/Package.swift into
# A0Auth0.podspec. Package.swift is the source of truth: Dependabot (swift
# ecosystem) bumps it, and this script propagates the new version to the podspec.
#
# Run from the repository root.

set -euo pipefail

repo_path=$(git rev-parse --show-toplevel)

if [ "$repo_path" != "$PWD" ]; then
    echo 'This script must be run from the repository root'
    exit 1
fi

package_swift='spm/Package.swift'
podspec='A0Auth0.podspec'

# Swift package URL suffix as it appears in Package.swift and in the podspec's
# spm_dependency calls (`url: 'https://github.com/auth0/<name>'`).
packages=('Auth0.swift' 'JWTDecode.swift' 'SimpleKeychain')

for name in "${packages[@]}"; do
    # Match the quoted URL so Auth0.swift cannot match a longer URL.
    line=$(grep -F "github.com/auth0/${name}\"" "$package_swift" || true)
    version=$(printf '%s\n' "$line" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || true)

    if [ -z "$version" ]; then
        echo "::error::Could not find a version for '$name' in $package_swift"
        exit 1
    fi

    NAME="$name" VER="$version" perl -i -pe \
        's/(github\.com\/auth0\/\Q$ENV{NAME}\E\x27.*?version:\s*\x27)\d+\.\d+\.\d+(\x27)/$1$ENV{VER}$2/' \
        "$podspec"
done

git add "$podspec"

echo 'Podspec dependency versions synced with spm/Package.swift.'
