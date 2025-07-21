# Migration Guide

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
    npm install react-native-auth0@beta
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
    npm install react-native-auth0@beta
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

### Change #2: Credentials Object uses `expiresAt`

The `Credentials` object no longer includes `expiresIn` (a duration). It now provides `expiresAt`, an absolute **UNIX timestamp** (in seconds), making expiration checks simpler and less error-prone.

**✅ Action Required:** Replace all logic using `expiresIn` with `expiresAt`.

**Before:**

```javascript
const expiresAt = Date.now() / 1000 + credentials.expiresIn;
if (isExpired(expiresAt)) {
  // ...
}
```

**After:**

```javascript
// Direct comparison is now possible
if (credentials.expiresAt < Date.now() / 1000) {
  // ...
}

// Or, use the new helper method (if you have an instance of the Credentials model):
if (credentials.isExpired()) {
  // ...
}
```

### Change #3: Standardized `AuthError` Object

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
