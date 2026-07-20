# Git Workflow

## Commits

- **Conventional Commits**, enforced by commitlint (`@commitlint/config-conventional`) via the `commit-msg` hook.
- Types: `feat`, `fix`, `chore`, `docs`, `ci`, `refactor`, `test`, etc. Scopes are used where helpful (e.g. `feat(mfa): …`).
- The `CHANGELOG.md` is generated from commit history by `release-it` (`@release-it/conventional-changelog`, angular preset) — do not hand-edit it.

## Branches & PRs

- PRs target `master`.
- CI (`.github/workflows/main.yml`) runs `yarn test:ci` on every PR; SCA scanning runs via `sca_scan.yml`. Both must pass.
- Follow `.github/PULL_REQUEST_TEMPLATE.md` if present; keep PRs scoped and describe platform impact (iOS / Android / web).

## Release (maintainers)

Releases are cut with `release-it` (`yarn release`), not by an agent editing files:

1. Bump `version` in `package.json` (podspec and telemetry version derive from it).
2. `.version` is kept in sync (tracked in `.shiprc`).
3. `release-it` generates the changelog, tags `v${version}`, publishes to npm, and creates the GitHub release.

Version source of truth: `package.json`. Keep `.version` in step with it; the podspec `s.version` and `src/core/utils/telemetry.ts` version are injected automatically at build/prebuild time.
