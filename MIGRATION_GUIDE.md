# Migration Guide

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
