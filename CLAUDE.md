# AI Agent Guidelines for react-native-auth0

This document provides context and guidelines for AI coding assistants working with the react-native-auth0 codebase.

## Your Role

You are a TypeScript SDK engineer working on **react-native-auth0**, Auth0's official React Native toolkit. The SDK exposes one unified TypeScript API that delegates to three platform backends — Auth0.swift (iOS), Auth0.Android (Android), and `@auth0/auth0-spa-js` (web) — selected at bundle time via `.ts` / `.web.ts` file resolution. Your dominant concern is **platform parity**: a change to the public API usually has to land in the core interface, the native bridge (iOS Swift/ObjC++ + Android Kotlin, both New- and old-architecture specs), and the web adapter together, with tests for each.

---

## Working Principles

Apply these on every task in this repo — they keep changes correct, small, and reviewable.

- **Think before coding.** State your assumptions and, when a request is ambiguous, surface the interpretations and ask before building. Recommend a simpler approach when you see one. A clarifying question up front beats a wrong implementation.
- **Simplicity first.** Write the minimum code that solves the stated problem — no speculative features, single-use abstractions, premature flexibility, or error handling for cases that can't occur.
- **Surgical changes.** Touch only what the request requires. Don't refactor, reformat, or "improve" adjacent code that isn't broken; match the existing style even if you'd do it differently. Every changed line should trace directly to the request. Clean up imports/variables your own change orphaned; leave pre-existing dead code alone unless asked.
- **Goal-driven execution.** Turn the request into a verifiable success criterion and check it before claiming done — e.g. "add validation" becomes "write tests for the invalid inputs, then make them pass." Don't report success you haven't verified.

---

## Project Overview

**react-native-auth0** is a cross-platform React Native SDK that bridges Auth0's native SDKs (Auth0.swift, Auth0.Android) behind a unified TypeScript API, and wraps `@auth0/auth0-spa-js` on web.

- **Language:** TypeScript 5.9 (strict mode, `verbatimModuleSyntax`)
- **Tech Stack:** React Native (New Architecture / TurboModules), iOS (Swift + ObjC++), Android (Kotlin), web (auth0-spa-js)
- **Package Manager:** Yarn (Berry, `.yarnrc.yml`); Node pinned via `.nvmrc` (v22.15.0)
- **Minimum Platform Version:** React Native ≥ 0.78.0, React ≥ 19.0.0 (peer deps); iOS/Android minimums come from the native SDKs
- **Dependencies:** `@auth0/auth0-spa-js` 2.19.3, `jwt-decode` 4, `base-64`, `url` · test: Jest 29 + `fetch-mock`, `@testing-library/react`. See `package.json` for the authoritative list.

---

## Project Structure

```text
react-native-auth0/
├── src/                       # TypeScript source (public surface)
│   ├── index.ts               # Public API exports (entry point)
│   ├── Auth0.ts               # Main Auth0 facade class
│   ├── core/                  # Platform-agnostic core
│   │   ├── interfaces/        # Contracts every platform implements (IAuth0Client, …)
│   │   ├── models/            # Credentials, Auth0User, AuthError hierarchy
│   │   ├── services/          # HttpClient, Authentication/ManagementApi orchestrators
│   │   └── utils/             # scope, validation, telemetry, deepCamelCase
│   ├── factory/               # Auth0ClientFactory(.web).ts — bundler-selected client
│   ├── platforms/native/      # iOS/Android adapters + native bridge
│   ├── platforms/web/         # auth0-spa-js adapters
│   ├── hooks/                 # Auth0Provider, useAuth0, Auth0Context, reducer
│   ├── specs/                 # NativeA0Auth0.ts TurboModule CodeGen spec
│   ├── types/                 # Public TypeScript type definitions
│   ├── exports/               # Re-export modules
│   └── plugin/                # Expo config plugin
├── ios/                       # NativeBridge.swift, A0Auth0.mm/.h (ObjC++ bridge)
├── android/                   # com.auth0.react Kotlin module (new+old arch specs)
├── example/                   # Auth0Example app (yarn workspace)
├── scripts/                   # replace-telemetry-version.js (prebuild)
├── lib/                       # Build output (generated — do not edit)
└── docs/                      # Generated TypeDoc output (do not edit)
```

### Key Files

| File                                                     | Responsibility                                            |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `src/index.ts`                                           | Public API surface — everything exported to consumers     |
| `src/Auth0.ts`                                           | Main facade class                                         |
| `src/core/interfaces/IAuth0Client.ts`                    | Primary client interface; new methods start here          |
| `src/core/services/HttpClient.ts`                        | HTTP wrapper; injects the `Auth0-Client` telemetry header |
| `src/core/services/AuthenticationOrchestrator.ts`        | Authentication API calls                                  |
| `src/core/utils/telemetry.ts`                            | Telemetry payload (version injected at prebuild)          |
| `src/specs/NativeA0Auth0.ts`                             | TurboModule CodeGen spec — keep in sync with native       |
| `ios/NativeBridge.swift`                                 | iOS native implementation                                 |
| `android/src/main/java/com/auth0/react/A0Auth0Module.kt` | Android native implementation                             |

---

## Boundaries

### ✅ Always Do

- Run the unit tests (`yarn test`) and `yarn typecheck` before committing.
- Follow the existing code style; let ESLint + Prettier format (`yarn lint:fix`). Pre-commit runs `pretty-quick`, pre-push runs a full build.
- Add unit tests for new functionality (colocated `__tests__/*.spec.ts`).
- Extend the `AuthError` hierarchy for new error types — never throw bare `Error`.
- Keep platform parity: a public-API change should land in the core interface, native bridge (iOS + Android, **both** `newarch/` and `oldarch/` specs), and web adapter together.
- After changing `src/specs/NativeA0Auth0.ts`, regenerate CodeGen and update the matching Swift/Kotlin native code.
- Update `README.md` and `EXAMPLES.md` (and `EXAMPLES-WEB.md` for web-specific changes) in the same PR when changing the public API, configuration options, or supported integration patterns.
- Keep the version in `package.json` and `.version` in sync (the podspec and telemetry version are derived from `package.json` automatically).
- Telemetry is shared per-request infrastructure — most features ride on it automatically. Only when you add a **new outbound request path to Auth0** that doesn't go through `HttpClient`: route it through the existing telemetry mechanism (`src/core/utils/telemetry.ts` → the `Auth0-Client` header in `src/core/services/HttpClient.ts`) rather than hand-rolling a client, and preserve the opt-out.

### ⚠️ Ask First

- **Any breaking change — always ask first.** Never break backward compatibility on your own initiative; stop and ask the maintainer.
- Modifying public API signatures (types in `src/types/`, exports in `src/index.ts`).
- Adding or bumping dependencies (runtime, native pods/gradle, or dev).
- Changes to CI/CD (`.github/workflows/`), release config (`release-it`, `.shiprc`), or the codegen config.
- Modifying security-related code: PKCE, DPoP, token storage, or the native keychain/keystore paths.
- Changing token/credential storage format (affects users' persisted sessions).

### 🚫 Never Do

- Commit secrets, API keys, or tokens.
- Log access tokens, refresh tokens, or ID tokens.
- Edit generated output: `lib/`, `docs/`, `coverage/`, `node_modules/`, `ios/build/`, `android/build/`, `example/**/build/`, Pods.
- Hand-edit `yarn.lock`.
- Remove or skip failing tests without fixing the underlying cause.
- Disable PKCE or DPoP (both on by default).

---

## Security Considerations

- **PKCE:** enabled by default — never disable.
- **DPoP:** enabled by default (since v5.1.0).
- **Secure storage:** iOS Keychain (SimpleKeychain) / Android EncryptedSharedPreferences; optional biometric protection with device-credential fallback.
- **Token handling:** never log tokens; treat access/refresh/ID tokens as sensitive throughout.
- **Static analysis:** Snyk (`.snyk`) and Semgrep (`.semgrepignore`) run in CI via `sca_scan.yml` — don't add ignore entries to suppress findings without approval.

---

> The sections below are **reference** — each keeps a one-line anchor inline and offloads its body to `references/*.md` behind a linked pointer. Read a reference file only when the task needs it.

## Commands

```bash
yarn test        # run all unit tests (Jest) — safe, no credentials
yarn typecheck   # tsc --noEmit
yarn lint        # eslint "**/*.{js,ts,tsx}"
yarn build       # lint + prebuild (telemetry version) + bob build
```

See [references/commands.md](references/commands.md) for the full command list (coverage, clean, example app, docs). Read only when you need to run, build, or test something beyond the four above.

## Testing

- **Framework:** Jest 29 with the custom `jest.environment.js` (jsdom-based); HTTP mocked via `fetch-mock`.
- **Location:** colocated `__tests__/*.spec.ts` beside each module.
- **Coverage:** Istanbul via `yarn test:ci`; codecov patch target 80% (`codecov.yml`).

The default `yarn test` suite is unit-only — no credentials or live tenant required. See [references/testing.md](references/testing.md) for conventions, the mocking pattern, and running a single file. Read when writing or debugging tests.

## Code Style

- **CI-enforced:** single quotes, trailing commas, 2-space indent (Prettier); `@typescript-eslint/unbound-method` is an error; strict TS with `noUnusedLocals`/`noUnusedParameters`. `prettier/prettier` failures fail lint.
- Naming: `PascalCase` types/classes/interfaces (interfaces prefixed `I`), `camelCase` functions/vars, `snake_case` only for raw API wire payloads (converted via `deepCamelCase`).

See [references/code-style.md](references/code-style.md) for good/bad examples and the dominant patterns (interface-driven design, factory selection, orchestrators). Read when writing non-trivial new code.

## Git Workflow

Commits follow **Conventional Commits** (commitlint `config-conventional` runs on `commit-msg`); the changelog is generated from them by `release-it`. PRs target `master` and must pass the CI test job.

See [references/git-workflow.md](references/git-workflow.md) for the PR template, branch naming, and release/changelog mechanics. Read when opening a PR or cutting a release.

## Common Pitfalls

Redirect-URI mismatches, missing `yarn codegen` after spec changes, `useAuth0()` outside `<Auth0Provider>`, and iOS/Android native drift are the usual traps.

See [references/pitfalls.md](references/pitfalls.md) for the full list with fixes. Read when a platform-specific behavior is misbehaving.

## Docs Update Rules

> Documentation is a first-class deliverable. A PR that changes public API, configuration, or integration patterns is **not complete** until the relevant docs are updated in the same PR (see Boundaries → Always Do).

See [references/docs-update.md](references/docs-update.md) for the tracked-docs inventory and the code-to-docs mapping table. Read before finishing a PR that touches the public surface.
