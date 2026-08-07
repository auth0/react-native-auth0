# Public API / Type Surface Audit + Error Taxonomy Freeze

**Ticket:** [SDK-10043](https://auth0team.atlassian.net/browse/SDK-10043) (parent: SDK-9737 React Native V6)
**Date:** 2026-08-07
**Branch:** `feat/android-ephemeral-session` (worktree), based on `v6-development`

## Goal

Before v6 GA, freeze the public surface so post-GA additions can't happen by accident, and give
consumers one predictable error contract across iOS, Android, and web.

Two deliverables from the ticket:

1. Audit every exported type/method in `src/index.ts`; remove or rename anything inconsistent.
2. Freeze a single normalized error taxonomy shared by native and web adapters.

## Baseline

Measured on `v6-development` (`ad16ebe`) via the TypeScript compiler, not by reading barrels:

- **122 public exports** from `src/index.ts`
- `yarn typecheck` passes
- `ErrorCodes.spec.ts` passes (17 tests)

`users()` / `IUsersClient` already removed on `v6-development` in `ad16ebe`, so the Management API
surface is out of scope here (SDK-10042 owns it).

## Audit Findings

### Error taxonomy

| # | Finding | Evidence |
|---|---------|----------|
| 1 | `MyAccountErrorCodes` does not exist, yet `EXAMPLES.md:1822` imports it and switches on three of its members | `grep -rn MyAccountErrorCodes src` → 0 hits |
| 2 | `MyAccountError.type` is an RFC 7807 **URI**, not a normalized code, unlike all five siblings | `MyAccountError.ts:24` |
| 3 | `type` is declared `string` on all six classes — no exhaustiveness checking, no autocomplete | 6× `public readonly type: string` |
| 4 | No exported code-union aliases, so a consumer cannot type a parameter that accepts a code | `src/index.ts` |
| 5 | `TimeoutError` has no `type` at all, so it sits outside the taxonomy | `fetchWithTimeout.ts:3` |

Finding 2 compounds finding 1: the documented `case MyAccountErrorCodes.ENROLLMENT_FAILED` could
never match a URI even if the constant existed. This is the single most consequential fix in this
spec, and the only intentional behavior change.

### Type surface

| # | Finding | Evidence |
|---|---------|----------|
| 6 | Snake_case HTTP wire types are public: `NativeCredentialsResponse`, `SSOCredentialsResponse` | used only by `Credentials.fromResponse` / `AuthenticationOrchestrator` |
| 7 | Adapter-constructor-only options are public: `NativeAuth0Options`, `WebAuth0Options` | only referenced in `platforms/*/adapters` + `factory/` |
| 8 | `src/exports/` (5 files) is dead **and** drifted — unreachable from `index.ts`, missing `MfaError`/`MyAccountError`/`MfaErrorCodes`, and imports from `'../index'` | `grep "exports/" src/index.ts package.json` → 0 hits |
| 9 | Only `IMfaClient` is exported; the five sibling interfaces returned by `Auth0` getters are unnameable | `src/index.ts:27` |
| 10 | `Auth0ContextInterface` / `AuthState` unexported, though `useAuth0()` returns the former | `hooks/Auth0Context.ts:50` |
| 11 | `Auth0` has no named export (default only), so `import { Auth0 }` fails | `src/index.ts:30` |
| 12 | `DPoPHeadersParams` breaks the `...Parameters` suffix used by all 70 sibling parameter types | `types/common.ts:436` |

## Explicitly Rejected

Recorded so they aren't re-litigated later.

- **Consolidating "duplicate" type pairs.** `MfaChallengeResult`/`MfaChallengeResponse`,
  `Factor`/`MfaFactor`, `EnrollmentChallenge`/`MfaEnrollmentChallenge` are *distinct domains*
  (Flexible Factors Grant vs legacy `multifactorChallenge`; My Account API vs MFA grant). Merging
  them would conflate unrelated wire shapes. `DeliveryMethod` + `PasswordlessDeliveryMethod` is an
  intentional const + derived-union pair, already documented as such.
- **Renaming `PasskeyErrorCodes` keys to match values.** The `PASSKEY_*` value prefix is what keeps
  passkey codes globally unique across the taxonomy. Renaming keys breaks
  `PasskeyErrorCodes.NOT_AVAILABLE` for no functional gain. Documented instead.
- **Un-exporting `NativeAuthorizeOptions` / `NativeClearSessionOptions` / `WebAuthorizeOptions` /
  `WebClearSessionOptions`.** Initially flagged as internal; verification showed the first two appear
  in `useAuth0()`'s public signatures (`Auth0Context.ts:60,72`) and all four in
  `IWebAuthProvider.authorize()` / `.clearSession()`. Un-exporting them would make the SDK's primary
  auth call untypeable. They stay public.
- **Dropping the `I` interface prefix.** SDK-10045 owns that rename; doing it here would conflict.

## Design

### A. Taxonomy freeze

1. **Add `MyAccountErrorCodes`** with normalized SCREAMING_SNAKE members, and map
   `MyAccountError.type` onto it. Preserve the RFC 7807 URI on a new `typeUri` field so no
   information is lost. Both native and web My Account adapters feed the same mapper.
2. **Export six code unions** — `WebAuthErrorCode`, `CredentialsManagerErrorCode`, `DPoPErrorCode`,
   `MfaErrorCode`, `PasskeyErrorCode`, `MyAccountErrorCode` — each derived as
   `(typeof XCodes)[keyof typeof XCodes]` so union and constants cannot drift. Plus an
   `Auth0ErrorCode` umbrella union.
3. **Narrow each `type` to its own union** (finding 3). Technically breaking for anyone assigning an
   arbitrary string to `.type`, which is not a supported use.
4. **Give `TimeoutError` a `type`** so it joins the taxonomy. Wire-level `code: 'timeout'` is left
   alone — it is what the transport actually emits.

### B. Surface cleanup

5. Replace `export * from './types'` with an explicit public export list, dropping the 2 wire types
   (finding 6) and 2 adapter-option types (finding 7).
6. Delete `src/exports/` (finding 8).
7. Add missing exports: `IAuth0Client`, `IWebAuthProvider`, `ICredentialsManager`,
   `IAuthenticationProvider`, `IMyAccountClient`, `IPasswordlessClient`, `Auth0ContextInterface`,
   `AuthState`, and a named `Auth0` (findings 9–11).
8. Rename `DPoPHeadersParams` → `DPoPHeadersParameters`, keeping a `@deprecated` alias (finding 12).

### C. Freeze mechanism

This is what actually satisfies "prevents accidental breaking changes post-GA" — the audit is a
one-time cleanup; the test is what holds the line.

9. **Public-surface snapshot test** asserting the exact sorted export list of `src/index.ts`. Any
   addition or removal fails CI until the snapshot is updated deliberately.
10. **Taxonomy invariant test**: every error class exposes `type`; every codes object has a matching
    exported union; cross-class code values are unique except the documented `UNKNOWN_ERROR`
    overlap; `PasskeyErrorCodes`' prefix asymmetry is asserted as intentional.

### D. Documentation

11. Fix the broken `EXAMPLES.md:1822` block.
12. Document the frozen taxonomy — the six code objects, their unions, and the `type` vs `code` vs
    `typeUri` distinction — as the stable public contract.

## Expected Outcome

122 → 136 exports: 4 removed, 18 added. Every remaining export is intentional and covered by the
snapshot test.

**Removed (4)** — internal wire/config shapes that were never usable by consumers:
`NativeAuth0Options`, `WebAuth0Options`, `NativeCredentialsResponse`, `SSOCredentialsResponse`.

**Added (18):**

| Group                                                                                          | Count |
| ---------------------------------------------------------------------------------------------- | ----- |
| Derived code unions — `WebAuthErrorCode` … `MyAccountErrorCode` (one per error class)           | 6     |
| `MyAccountErrorCodes` — the new codes object completing the taxonomy                           | 1     |
| `Auth0ErrorCode` — the shared base union                                                       | 1     |
| `DPoPHeadersParameters` — rename; the `DPoPHeadersParams` alias stays exported and deprecated  | 1     |
| `Auth0` — named alias for the default export, so consumers need not rely on `default`          | 1     |
| `Auth0ContextInterface`, `AuthState` — already in `useAuth0()`'s signature but not exported    | 2     |
| Client interfaces — `IAuth0Client` and its 5 sub-provider siblings                              | 6     |

The interface and React-binding groups are types that already appeared in public method signatures
but were unreachable from the entry point — exporting them makes the existing surface *typeable*, not
larger in capability.

## Testing

- Snapshot test for the export list (new)
- Taxonomy invariant test (new)
- `MyAccountError` mapping test covering both URI→code normalization and `typeUri` preservation (new;
  the class currently has no spec file)
- Existing `ErrorCodes.spec.ts` extended for `MyAccountErrorCodes`
- `yarn typecheck` and full `yarn test` must pass

## Risks

- **`MyAccountError.type` change is breaking** for anyone switching on the URI. Mitigated by
  `typeUri`, and by the fact that the only documented usage was already broken.
- **Narrowing `type` to a union** surfaces as a compile error in code that assigned arbitrary
  strings. Intended — that is the freeze.
- Migration-guide entries belong to SDK-10047; this spec only notes what changed.

## Out of Scope

- Dropping the `I` prefix (SDK-10045)
- Full native delegation asymmetry (SDK-10041)
- Migration guide authoring (SDK-10047)
- `v6-development` does not yet contain master's deprecation commits `113a610` / `a47ad73`, so the
  legacy MFA methods on `IAuthenticationProvider` remain undeprecated there. Pre-existing branch
  gap, tracked separately.
