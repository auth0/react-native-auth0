# AI Agent Guidelines for react-native-auth0 SDK

This document provides context and guidelines for AI coding assistants working
with the react-native-auth0 SDK codebase. It covers the architecture, development
patterns, module responsibilities, and guidelines for making changes.

## Project Overview

react-native-auth0 is a cross-platform React Native SDK that bridges Auth0's native
SDKs (Auth0.swift and Auth0.Android) with a unified TypeScript API. On web platforms,
it wraps `@auth0/auth0-spa-js`.

| Platform     | Minimum Version | Native SDK                 |
| ------------ | --------------- | -------------------------- |
| iOS          | 14.0            | Auth0.swift v2.14+         |
| Android      | API 35          | Auth0.Android v3.x         |
| Web          | -               | @auth0/auth0-spa-js v2.9.1 |
| React Native | 0.78.0          | -                          |
| React        | 19.0.0          | -                          |

---

## Core Architecture

The SDK follows a **platform abstraction pattern** where a unified TypeScript interface
delegates to platform-specific implementations via the factory pattern.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│        (Auth0Provider / useAuth0 Hook / Auth0 Class)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core Interfaces                             │
│   IAuth0Client │ IWebAuthProvider │ ICredentialsManager │ etc.  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  NativeAuth0    │ │  WebAuth0       │ │  Factory        │
│  Client         │ │  Client         │ │  (Auto-select)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                   │
        ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ Native Bridge   │ │ @auth0/auth0-   │
│ (iOS/Android)   │ │ spa-js          │
└─────────────────┘ └─────────────────┘
```

### Key Architectural Decisions

1. **Interface-Driven Design**: All platform implementations conform to shared interfaces
   (`IAuth0Client`, `ICredentialsManager`, etc.) ensuring type safety and consistent API.

2. **File-Based Platform Detection**: Metro resolves `.ts` files for native, Webpack/Vite
   resolve `.web.ts` files. No runtime platform checks needed.

3. **Native Bridge Pattern**: JavaScript communicates with native code via TurboModules:

   ```
   TypeScript → NativeBridgeManager → NativeA0Auth0 (TurboModule) → Swift/Kotlin
   ```

4. **React Context for State**: `Auth0Provider` manages authentication state and exposes
   it via `useAuth0()` hook.

---

## Repository Structure

```
react-native-auth0/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Public API exports
│   ├── Auth0.ts                  # Main Auth0 facade class
│   ├── core/                     # Platform-agnostic core logic
│   ├── factory/                  # Platform client factories
│   ├── platforms/                # Platform-specific implementations
│   ├── hooks/                    # React hooks and context
│   ├── specs/                    # TurboModule specifications
│   ├── types/                    # TypeScript type definitions
│   ├── exports/                  # Re-export modules
│   └── plugin/                   # Expo config plugin
│
├── ios/                          # iOS native code (Swift/ObjC++)
├── android/                      # Android native code (Kotlin)
├── example/                      # Example application
├── lib/                          # Build outputs (generated)
└── [config files]                # package.json, tsconfig, etc.
```

---

## Module Details

### src/core/interfaces/

**Purpose**: Define TypeScript contracts that all platform implementations must fulfill.

| File                         | Responsibility                                     |
| ---------------------------- | -------------------------------------------------- |
| `IAuth0Client.ts`            | Main client interface aggregating all sub-clients  |
| `IWebAuthProvider.ts`        | Web authentication (authorize, clearSession)       |
| `ICredentialsManager.ts`     | Token storage, retrieval, refresh, biometric       |
| `IAuthenticationProvider.ts` | Direct auth API (login, signup, passwordless, MFA) |
| `IUsersClient.ts`            | Management API (getUser, patchUser)                |

**Guidelines**:

- All new methods must be added here first
- Use optional parameters with sensible defaults
- Document platform-specific behavior in JSDoc comments

### src/core/models/

**Purpose**: Data classes, error types, and domain objects.

| File                         | Responsibility                                             |
| ---------------------------- | ---------------------------------------------------------- |
| `Credentials.ts`             | Token container (accessToken, idToken, refreshToken, etc.) |
| `ApiCredentials.ts`          | MRRT API credentials                                       |
| `Auth0User.ts`               | User profile model                                         |
| `AuthError.ts`               | Base error class for all SDK errors                        |
| `WebAuthError.ts`            | Web authentication specific errors                         |
| `CredentialsManagerError.ts` | Credential storage/retrieval errors                        |
| `DPoPError.ts`               | DPoP-related errors                                        |

**Guidelines**:

- All errors must extend `AuthError`
- Include error codes for programmatic handling
- Export from `models/index.ts`

### src/core/services/

**Purpose**: Shared business logic used across platforms.

| File                            | Responsibility                           |
| ------------------------------- | ---------------------------------------- |
| `HttpClient.ts`                 | HTTP request wrapper with error handling |
| `AuthenticationOrchestrator.ts` | Orchestrates Authentication API calls    |
| `ManagementApiOrchestrator.ts`  | Orchestrates Management API calls        |

### src/factory/

**Purpose**: Create platform-appropriate client instances.

| File                        | Resolved By    | Creates             |
| --------------------------- | -------------- | ------------------- |
| `Auth0ClientFactory.ts`     | Metro (native) | `NativeAuth0Client` |
| `Auth0ClientFactory.web.ts` | Webpack/Vite   | `WebAuth0Client`    |

**How it works**: Bundlers resolve the correct file based on platform. The factory
returns an `IAuth0Client` implementation without runtime platform checks.

### src/platforms/native/

**Purpose**: iOS and Android implementation via native bridge.

```
native/
├── adapters/                     # Interface implementations
│   ├── NativeAuth0Client.ts      # Main client
│   ├── NativeWebAuthProvider.ts  # WebAuth implementation
│   ├── NativeCredentialsManager.ts  # Credentials implementation
│   └── NativeAuthenticationProvider.ts
└── bridge/                       # Native module communication
    ├── INativeBridge.ts          # Bridge interface
    └── NativeBridgeManager.ts    # Bridge implementation
```

**Data Flow**:

```
Adapter → NativeBridgeManager → NativeA0Auth0 (TurboModule) → Swift/Kotlin
```

### src/platforms/web/

**Purpose**: Web implementation wrapping @auth0/auth0-spa-js.

```
web/
└── adapters/
    ├── WebAuth0Client.ts
    ├── WebWebAuthProvider.ts
    └── WebCredentialsManager.ts
```

**Guidelines**:

- Some native features may not be available on web
- Handle gracefully with clear error messages or no-ops

### src/hooks/

**Purpose**: React integration via Context API.

| File                | Responsibility                                 |
| ------------------- | ---------------------------------------------- |
| `Auth0Provider.tsx` | Context provider component                     |
| `Auth0Context.ts`   | Context definition and `Auth0ContextInterface` |
| `useAuth0.ts`       | Consumer hook                                  |
| `reducer.ts`        | State management (user, isLoading, error)      |

**State Shape**:

```typescript
{
  user: Auth0User | null;
  isLoading: boolean;
  error: AuthError | null;
}
```

### src/specs/

**Purpose**: TurboModule specifications for React Native New Architecture.

| File               | Responsibility                                |
| ------------------ | --------------------------------------------- |
| `NativeA0Auth0.ts` | CodeGen spec defining native module interface |

**Guidelines**:

- Changes here require corresponding native code updates
- Run `yarn codegen` after modifications
- Keep in sync with `package.json` codegenConfig

### ios/

**Purpose**: iOS native implementation.

| File                        | Responsibility                                              |
| --------------------------- | ----------------------------------------------------------- |
| `NativeBridge.swift`        | Swift implementation of all native methods                  |
| `A0Auth0.mm`                | Objective-C++ bridge (RCT_EXPORT_MODULE, RCT_EXPORT_METHOD) |
| `A0Auth0.h`                 | Header file                                                 |
| `A0Auth0-Bridging-Header.h` | Swift-ObjC bridging header                                  |

**Data Flow**:

```
JS → A0Auth0.mm (ObjC++) → NativeBridge.swift → Auth0.swift SDK
```

### android/

**Purpose**: Android native implementation.

```
android/src/main/java/com/auth0/react/
├── A0Auth0Module.kt              # Main module implementation
├── A0Auth0Spec.kt                # TurboModule spec (newarch/)
├── A0Auth0Package.kt             # React Native package
├── CredentialsParser.kt          # Parse Credentials to JS object
└── ApiCredentialsParser.kt       # Parse ApiCredentials to JS object
```

**Architecture Support**:

- `newarch/A0Auth0Spec.kt` - TurboModule spec for New Architecture
- `oldarch/A0Auth0Spec.kt` - Legacy bridge spec

---

## Development Guidelines

### Code Style

- **Language**: TypeScript (strict mode)
- **Formatting**: ESLint + Prettier (run `yarn lint:fix`)
- **Documentation**: JSDoc for all public APIs

### Adding a New Method

1. **Define interface** in `src/core/interfaces/`
2. **Add to TurboModule spec** in `src/specs/NativeA0Auth0.ts`
3. **Implement native code**:
   - iOS: `NativeBridge.swift` + `A0Auth0.mm`
   - Android: `A0Auth0Module.kt` + both arch specs
4. **Implement bridge** in `src/platforms/native/bridge/NativeBridgeManager.ts`
5. **Implement adapters**:
   - `src/platforms/native/adapters/` (appropriate adapter)
   - `src/platforms/web/adapters/` (web adapter)
6. **Add to hooks** in `Auth0Context.ts` + `Auth0Provider.tsx`
7. **Write tests** in `__tests__/` directories
8. **Update docs** in `EXAMPLES.md`

### Adding a New Error Type

1. Create class in `src/core/models/` extending `AuthError`
2. Export from `src/core/models/index.ts`
3. Export from `src/index.ts`

### Platform-Specific Behavior

Use file-based platform detection:

```
SomeModule.ts       → Native implementation (Metro)
SomeModule.web.ts   → Web implementation (Webpack/Vite)
```

Document platform differences in JSDoc:

```typescript
/**
 * @param headers Additional headers. **iOS only** - ignored on Android.
 */
```

---

## Build & Testing Commands

### Development

```bash
yarn install          # Install dependencies
yarn build            # Full build (lint + prebuild + bob)
yarn clean            # Remove build artifacts
yarn typecheck        # TypeScript type checking
```

### Testing

```bash
yarn test             # Run all unit tests
yarn test:ci          # Run with coverage
yarn test --watch     # Watch mode
```

### Linting

```bash
yarn lint             # Check for issues
yarn lint:fix         # Auto-fix issues
```

### Example App

```bash
yarn example start    # Start Metro bundler
yarn example ios      # Run iOS example
yarn example android  # Run Android example
```

### CodeGen (New Architecture)

```bash
yarn codegen          # Generate native specs from TurboModule definitions
```

---

## Build Outputs

| Target     | Path              | Format               |
| ---------- | ----------------- | -------------------- |
| CommonJS   | `lib/commonjs/`   | `require()`          |
| ES Modules | `lib/module/`     | `import/export`      |
| TypeScript | `lib/typescript/` | `.d.ts` declarations |

Build is managed by `react-native-builder-bob` (configured in `package.json`).

---

## Native SDK Integration

### iOS (Auth0.swift)

- Managed via CocoaPods (`A0Auth0.podspec`)
- Dependency: `Auth0 ~> 2.14`
- Swift implementation calls Auth0.swift APIs directly

### Android (Auth0.Android)

- Managed via Gradle (`android/build.gradle`)
- Dependency: `com.auth0.android:auth0:3.+`
- Kotlin implementation calls Auth0.Android APIs directly

---

## Error Handling

| Error Type                | When Used                            |
| ------------------------- | ------------------------------------ |
| `AuthError`               | Base class for all errors            |
| `WebAuthError`            | User cancellation, browser issues    |
| `CredentialsManagerError` | Storage/retrieval failures           |
| `DPoPError`               | DPoP key generation/signing failures |

All errors include:

- `code`: Programmatic error identifier
- `message`: Human-readable description
- `cause`: Original error (when wrapping)

---

## Security Considerations

1. **PKCE**: Enabled by default - never disable
2. **DPoP**: Enabled by default since v5.1.0
3. **Secure Storage**: iOS Keychain / Android EncryptedSharedPreferences
4. **Biometric Protection**: Optional, requires device credential fallback
5. **Never log tokens**: Access tokens, refresh tokens, ID tokens are sensitive

---

## Common Pitfalls

- **Redirect URIs**: Must match exactly between Auth0 dashboard and app
  - iOS: `{BUNDLE_ID}://{DOMAIN}/ios/{BUNDLE_ID}/callback`
  - Android: `{SCHEME}://{DOMAIN}/android/{PACKAGE_NAME}/callback`
- **Custom Tabs**: Require Chrome installed on Android
- **TurboModules**: Run `yarn codegen` after spec changes
- **React Context**: `useAuth0()` must be within `<Auth0Provider>`
- **Native Sync**: Spec changes require updates to both iOS and Android

---

## Release Process

Managed via `release-it`:

```bash
yarn release
```

Steps:

1. Run tests and build
2. Bump version in `package.json`
3. Generate changelog
4. Create git tag
5. Publish to npm
6. Create GitHub release

---

## AI Agent Best Practices

1. **Preserve Patterns**: Follow interface-driven and factory patterns
2. **Platform Parity**: Consider iOS, Android, and Web for all changes
3. **Interface First**: Define in `core/interfaces/` before implementing
4. **Native Sync**: Spec changes must update iOS (`NativeBridge.swift`, `A0Auth0.mm`)
   and Android (`A0Auth0Module.kt`, both arch specs)
5. **Test Coverage**: Maintain 80%+ coverage
6. **Documentation**: Update `EXAMPLES.md` for user-facing changes
7. **Backward Compatibility**: Follow semver strictly
8. **Security First**: Never compromise PKCE, DPoP, or encrypted storage
9. **Type Safety**: Avoid `any` types, use strict TypeScript

---

## Getting Help

- **GitHub Issues**: [react-native-auth0/issues](https://github.com/auth0/react-native-auth0/issues)
- **GitHub Discussions**: [react-native-auth0/discussions](https://github.com/auth0/react-native-auth0/discussions)
- **Auth0 Community**: [community.auth0.com](https://community.auth0.com/)

---

## External References

- [Auth0.swift SDK](https://github.com/auth0/Auth0.swift)
- [Auth0.Android SDK](https://github.com/auth0/Auth0.Android)
- [Auth0 SPA SDK](https://github.com/auth0/auth0-spa-js)
- [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro)
