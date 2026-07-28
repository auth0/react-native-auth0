# Migration Guide

## Upgrading from v5 -> v6

Version 6.0 of `react-native-auth0` modernizes the SDK's foundation and delegates all authentication to the underlying native SDKs (Auth0.swift and Auth0.Android). This guide is being written incrementally as the v6 workstreams land; each section below is marked with its status.

> **Status legend:** ✅ Landed · 🚧 In progress · ⏳ Planned

Upgrading from v5.x requires addressing several breaking changes. Please follow this guide carefully.

### 1. Compatibility & Installation

Before updating the library, ensure your project meets the new minimum requirements.

#### Environment Requirements

| Requirement      | v5.x            | v6.0                          |
| :--------------- | :-------------- | :---------------------------- |
| **React**        | `19.0.0`+       | `19.0.0`+                     |
| **React Native** | `0.78.0`+       | **`0.82.0`+ (New Arch only)** |
| **Architecture** | Old **or** New  | **New Architecture only**     |
| **Expo**         | SDK `53`+       | **SDK `55`+** _(see below)_   |
| **iOS**          | Deployment `14` | Deployment `14`               |
| **Android**      | Target SDK `35` | Target SDK `36` _(see §3)_    |

### 2. React Native New Architecture is now required ✅

**This is the foundational breaking change in v6.** React Native `0.82` is the first React Native release that runs **entirely on the New Architecture** — the Legacy Architecture is no longer part of how apps run, and future releases will remove the remaining Legacy Architecture code from the codebase. To match the ecosystem, v6 of this SDK **drops old-architecture support entirely** and ships as a TurboModule-only native module.

**What changed internally (no consumer code change, but affects your build):**

- The Android module no longer ships an old-architecture (`oldarch`) bridge spec; it is now TurboModule-only.
- The iOS module no longer compiles the legacy `RCTBridgeModule` path; it standardizes on the codegen TurboModule.
- The `react-native` peer dependency floor is now **`>=0.82.0`**.

**✅ Action Required:**

1.  **Upgrade React Native to `0.82.0` or higher.**

    ```bash
    npm install react-native@^0.82.0 react@^19.0.0
    ```

    Follow the [React Native 0.82 release notes](https://reactnative.dev/blog/2025/10/08/react-native-0.82#react-1911) for the full upgrade steps, including removing any legacy old-architecture opt-outs.

2.  **If you cannot enable the New Architecture yet,** stay on `react-native-auth0@5.x` until your app is migrated. v6 will not run on the legacy bridge.

> **Note for web (`react-native-web`) consumers:** the web platform is unaffected by this change — it uses `@auth0/auth0-spa-js` and has no native module. No action is required for web-only usage.

#### For Expo Projects

Expo SDK 55+ uses the New Architecture only.

```bash
npx expo prebuild --clean
```

> **Warning:** `prebuild --clean` overwrites manual changes in your `ios` and `android` directories.

### 3. Android: minSdk 26 & JDK 17 ⏳

_Planned — lands with the Auth0.Android v4 adoption._ v6 raises the Android minimum SDK to **26** and requires consuming apps to build with **JDK 17** (AGP 8.10+). This section will be completed when that workstream merges.

### 4. iOS: Auth0.swift 3.0 & `use_frameworks!` ⏳

_Planned — lands with the Auth0.swift v3.0 adoption._ v6 adopts Auth0.swift 3.0 (Swift 6 tools, iOS 14 floor) and requires a `use_frameworks!` Podfile setup. This section will be completed when that workstream merges.

### 5. Behavioral default shifts under native delegation ⏳

_Planned — lands with full native auth delegation._ Routing all authentication through the native SDKs changes some defaults (e.g. `scope` gains `offline_access`, `minTTL` defaults to `60`, default connection names). Each shift and the action required will be documented here when that workstream merges.

### 6. Management API (`users()`) removal ⏳

_Planned._ The client-side Management API wrapper (`auth0.users(...)`) is being removed in v6, mirroring both native SDKs. Migrate Management operations to a backend/BFF. Full guidance will be added here.

### Recommended Reading

- The [FAQ](FAQ.md) for guidance on the `authorize()` redirect flow on web and the importance of the `offline_access` scope.

## Upgrading from v4 -> v5

Version 5.0 of `react-native-auth0` is a significant update featuring a complete architectural overhaul. This new foundation improves performance, maintainability, and provides a more consistent API across all platforms.

Upgrading from v4.x requires addressing several breaking changes. Please follow this guide carefully.

## 1. Compatibility & Installation

Before updating the library, ensure your project meets the new minimum requirements.

### Environment Requirements

- **React:** `19.0.0` or higher
- **React Native:** `0.78.0` or higher
- **Expo:** SDK `53` or higher
- **iOS:** Deployment Target `14.0`
- **Android:** Target SDK `35` or higher

### Updating Your Project

#### For Standard React Native Projects:

1.  **Upgrade React Native:**
    ```bash
    npm install react@^19.0.0 react-native@^0.78.0
    ```
2.  **Update this Library:**
    ```bash
    npm install react-native-auth0
    ```
3.  **Update iOS Target:** In your `ios/Podfile`, set the platform version:
    ```ruby
    platform :ios, '14.0'
    ```
4.  **Install Pods:**
    ```bash
    cd ios && pod install && cd ..
    ```

#### For Expo Projects:

1.  **Upgrade Expo SDK:**
    ```bash
    npx expo upgrade
    ```
2.  **Update this Library:**
    ```bash
    npm install react-native-auth0
    ```
3.  **Rebuild Native Code:**
    ```bash
    npx expo prebuild --clean
    ```
    > **Warning:** This will overwrite any manual changes in your `ios` and `android` directories.

## 2. Breaking API Changes

The following API changes require code modifications in your application.

### Change #1: User Profile Properties are now `camelCase`

To align with modern JavaScript standards, all properties on the `user` object are now `camelCase`.

**✅ Action Required:** Update all references to `user` properties.

| Before (snake_case)   | After (camelCase)    |
| :-------------------- | :------------------- |
| `user.given_name`     | `user.givenName`     |
| `user.family_name`    | `user.familyName`    |
| `user.email_verified` | `user.emailVerified` |
| `user.phone_number`   | `user.phoneNumber`   |
| ...and so on.         |                      |

### Change #2: Standardized `AuthError` Object

All errors thrown by the library are now instances of a single, consistent `AuthError` class. This replaces multiple error types like `CredentialsManagerError`.

**✅ Action Required:** Update your `try...catch` blocks to handle the new unified error object.

**Before:**

```javascript
catch (e) {
  // Inconsistent properties like e.error, e.error_description
  console.error(e.message);
}
```

**After:**

```javascript
import { AuthError } from 'react-native-auth0';

catch (e) {
  if (e instanceof AuthError) {
    // Consistent properties are now available
    console.error(e.name, e.message); // e.g., 'invalid_grant', 'The refresh token is invalid.'
  }
}
```

### Change #3: Platform-Specific API Availability

With the introduction of **React Native Web support**, some methods are only available on native platforms for security reasons. Direct authentication grants that handle user credentials (like passwords or OTP codes) are **not supported in the browser** and will throw a `NotImplemented` error.

**✅ Action Required:** If you are building for the web, ensure all authentication flows are initiated via the redirect-based `authorize()` method. Review the platform support table in the [README](README.md#features-and-platform-support) for a full list of platform-specific methods.

### Change #4: `authorize()` Behavior on Web

On React Native Web, the `authorize()` method now triggers a **full-page redirect** to Auth0. As a result, the promise returned by `authorize()` will **not resolve** in the browser. Your application must be structured to handle the user state upon reloading after the redirect.

**✅ Action Required:** Review the new **[FAQ entry](#faq-authorize-web)** for guidance on how to correctly handle the post-login flow on the web. The `Auth0Provider` and `useAuth0` hook are designed to manage this flow automatically.

### Change #5: Hook Methods Now Throw Error

Previously, all hook-related methods such as `getCredentials()`, `saveCredentials()`, etc., did not throw error directly. Instead, any issues were silently handled and surfaced via the error property in `useAuth0()`:

```javascript
const { error } = useAuth0();
// error would be populated if getCredentials failed
```

**What's Changed:**

These methods now throw error directly to the caller. You must handle them explicitly using try...catch blocks.

**✅ Action Required:** Update your code to handle error for each function call individually.

**Before:**

```javascript
const { getCredentials, error } = useAuth0();
---
await getCredentials();
// Check error manually later
```

**After:**

```javascript
const { getCredentials, error } = useAuth0();

try {
  await getCredentials();
} catch (e) {
  console.error(e);
}
```

All thrown errors are instances of the new standardized AuthError class described in Change #2.

### Recommended Reading

After migrating, we highly recommend reviewing the updated **[FAQ](FAQ.md)** for detailed explanations on:

- How to handle the `authorize()` redirect flow on the web.
- The importance of the `offline_access` scope for keeping users logged in.

## Upgrading from v3 -> v4

- **If your project is built with Expo:**
  - Run `npx expo prebuild --clean` to ensure the intent-filters in `android` & custom scheme's in iOS are propertly setup. Please note that any manual changes to Android or iOS folders will be lost when this command is executed.

### Breaking Changes:

- `requireLocalAuthentication` method is no longer available as part of the `CredentialsManager` class or the `useAuth0` Hook from v4 of the SDK. Refer below sections on how to enable authentication before obtaining credentials now.

### Changes:

- Updated the `Auth0` class constructor to accept a new parameter, `LocalAuthenticationOptions`, for enabling authentication before obtaining credentials as shown below:

```
const localAuthOptions: LocalAuthenticationOptions = {
    title: 'Authenticate to retreive your credentials',
    subtitle: 'Please authenticate to continue',
    description: 'We need to authenticate you to retrieve your credentials',
    cancelTitle: 'Cancel',
    evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
    fallbackTitle: 'Use Passcode',
    authenticationLevel: LocalAuthenticationLevel.strong,
    deviceCredentialFallback: true,
  }
const auth0 = new Auth0({ domain: config.domain, clientId: config.clientId, localAuthenticationOptions: localAuthOptions });
```

Modified the `Auth0Provider` to accept `LocalAuthenticationOptions` as a parameter to enable authentication before obtaining credentials.

```
const localAuthOptions: LocalAuthenticationOptions = {
  title: 'Authenticate to retreive your credentials',
  subtitle: 'Please authenticate to continue',
  description: 'We need to authenticate you to retrieve your credentials',
  cancelTitle: 'Cancel',
  evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
  fallbackTitle: 'Use Passcode',
  authenticationLevel: LocalAuthenticationLevel.strong,
  deviceCredentialFallback: true,
};

const App = () => {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      localAuthenticationOptions={localAuthOptions}
    >
      {/* YOUR APP */}
    </Auth0Provider>
  );
};

export default App;
```

## Upgrading from v2 -> v3

### Improvements and changes

- Web Auth will now have default scope of 'openid profile email', so these scopes can be removed if you're explicitly specifying them
- Minimum supported version for iOS is bumped to 13
- Minimum supported version for Expo is bumped to 48
- Revoke Token and Change Password now return `void` instead of an empty object

### Breaking changes

- The properties inside the `user` object will now be camelCase instead of snake_case
- Removed the `type` property returned in the `Credentials` object in Android. Use `tokenType` instead.
- `Credentials` object in iOS will return `expiresAt` instead of `expiresIn`
- `expiresIn` value will now return `expiresAt` value which is a UNIX timestamp of the expiration time.
- `max_age` parameter is changed to `maxAge` in `WebAuth.authorize()`
- `skipLegacyListener` has been removed in `authorize` and `clearSession`
- `customScheme` is now part of `ClearSessionOptions` instead of `ClearSessionParameters` in `clearSession`
- iOS minimum deployment target is now 13. This can be migrated by adding `platform :ios '13.0'` to the ios/Podfile file
- Additional or custom parameters to be sent in `authorize` method should now be sent as `additionalParameters`. This includes when sending `prompt` parameter.
- Error codes are now platform specific. For example - When user cancels authentication, Android error code is `a0.session.user_cancelled` and iOS error code is `USER_CANCELLED`

### Callback URL migration

We are migrating the callback URL we use for the SDK to below.

**Old**

```
iOS: {PRODUCT_BUNDLE_IDENTIFIER}://{DOMAIN}/ios/{PRODUCT_BUNDLE_IDENTIFIER}/callback
Android: {YOUR_APP_PACKAGE_NAME}://{DOMAIN}/android/{YOUR_APP_PACKAGE_NAME}/callback
```

**New**

Notice the new `.auth0` suffix after the bundle identifier / package name:

```
iOS: {PRODUCT_BUNDLE_IDENTIFIER}.auth0://{DOMAIN}/ios/{PRODUCT_BUNDLE_IDENTIFIER}/callback
Android: {YOUR_APP_PACKAGE_NAME}.auth0://{DOMAIN}/android/{YOUR_APP_PACKAGE_NAME}/callback
```

Choose one of the following migration paths depending on your application:

- **If your project is built with Expo:**
  - To keep things as it is, no changes are required
  - To migrate to new non-custom scheme flow:
    - Remove custom scheme in app.json and `authorize()`.
    - Run `npx expo prebuild --clean` (any manual changes to Android or iOS folders will be lost)
    - Add the new callback URL to Auth0 dashboard
- **If your project is built with Non Expo:**

  - To keep things as it is, set `useLegacyCallbackUrl` to true in `authorize` and `clearSession`
  - To migrate to new non-custom scheme flow, add the new callback URL to Auth0 dashboard
  - Change the manifest placeholders in your app's build.gradle file (typically at android/app/build.gradle):

  **Old**

```
  android {
    defaultConfig {
        manifestPlaceholders = [auth0Domain: "YOUR_AUTH0_DOMAIN", auth0Scheme: "${applicationId}"]
    }
    ...
}
```

**New**

Notice the new `.auth0` suffix in auth0Scheme:

```
android {
    defaultConfig {
        manifestPlaceholders = [auth0Domain: "YOUR_AUTH0_DOMAIN", auth0Scheme: "${applicationId}.auth0"]
    }
    ...
}
```
