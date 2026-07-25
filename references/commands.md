# Commands

Full command reference for react-native-auth0. Commands come from `package.json` scripts and CI (`.github/workflows/main.yml` runs `yarn test:ci`).

## Build & type checking

```bash
yarn typecheck        # tsc --noEmit
yarn build            # yarn lint && yarn prebuild && bob build
yarn prebuild         # node scripts/replace-telemetry-version.js (injects SDK version)
yarn clean            # del-cli lib + example/native build dirs
yarn prepare          # husky && yarn build (runs on install)
```

Build output is produced by `react-native-builder-bob` into `lib/` in three targets: `commonjs`, `module`, `typescript` (see `package.json` → `react-native-builder-bob`).

## Test

```bash
yarn test             # jest — all unit tests
yarn test:ci          # jest --coverage (the exact CI command)
yarn test path/to/file.spec.ts   # single file
yarn test --watch     # watch mode
```

## Lint & format

```bash
yarn lint             # eslint "**/*.{js,ts,tsx}"
yarn lint:fix         # eslint --fix
```

Prettier is enforced through ESLint (`prettier/prettier: error`). Pre-commit hook runs `pretty-quick --staged`; pre-push runs `yarn build`.

## Example app (yarn workspace `Auth0Example`)

```bash
yarn example start    # Metro bundler
yarn example:ios      # cd example && npm run ios
yarn example:android  # cd example && npm run android
```

## Docs

```bash
yarn docs             # typedoc --options ./typedoc.json → docs/ (generated)
```

## Release

```bash
yarn release          # release-it (maintainers only — see references/git-workflow.md)
```
