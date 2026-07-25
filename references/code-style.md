# Code Style

## Enforced rules

- **Prettier** (`prettier/prettier: error` in `eslint.config.mjs`): single quotes, trailing commas, 2-space indent, no `useTabs`.
- **TypeScript strict** (`tsconfig.json`): `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`.
- **`@typescript-eslint/unbound-method: error`** — a deliberate choice so interface methods that don't use `this` are declared as arrow-function properties, keeping them safely unbound-able.
- Lint config excludes `node_modules/`, `lib/`, `docs`, `example/`, `coverage/`; type-checked rules skip test/mock files.

## Naming

- `PascalCase` for classes, types, and interfaces; interfaces are `I`-prefixed (`IAuth0Client`, `ICredentialsManager`).
- `camelCase` for functions, methods, variables.
- `snake_case` appears only in raw API wire payloads; convert to camelCase via `deepCamelCase` (`src/core/utils`) before it reaches public types.
- Errors extend `AuthError` and carry a programmatic `code`, a `message`, and an optional `cause`.

## Good vs. bad

**✅ Good** — typed params, `import type`, arrow-property on the interface, extends `AuthError`:

```ts
import type { Credentials } from '../../types';

export interface IAuthenticationProvider {
  passwordRealm: (params: PasswordRealmParameters) => Promise<Credentials>;
}

export class InvalidTokenError extends AuthError {
  constructor(message: string, cause?: unknown) {
    super('invalid_token', message, cause);
  }
}
```

**❌ Bad** — value import of a type, `any`, method syntax (trips `unbound-method`), bare `Error`:

```ts
import { Credentials } from '../../types'; // should be `import type`

export interface IAuthenticationProvider {
  passwordRealm(params: any): Promise<any>; // any + method syntax
}

throw new Error('bad token'); // must extend AuthError with a code
```

## Dominant patterns

- **Interface-driven design:** every platform backend implements the shared `core/interfaces/` contracts; new public methods are defined on the interface first.
- **Bundler-selected factory:** `Auth0ClientFactory.ts` (native) vs `Auth0ClientFactory.web.ts` (web) — Metro picks `.ts`, web bundlers pick `.web.ts`; no runtime platform branching.
- **Orchestrators:** `AuthenticationOrchestrator` / `ManagementApiOrchestrator` build requests through `HttpClient` and parse responses centrally.
- **Native bridge:** `Adapter → NativeBridgeManager → NativeA0Auth0 (TurboModule) → Swift/Kotlin`.
- **React integration:** `Auth0Provider` + `useAuth0()` over a reducer (`user`, `isLoading`, `error`).
