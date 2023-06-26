- Revoke Token and Change Password now return void instead of empty object
- Returned `user` object will now be camel case
- Removed `type` property returned in Android. Use `tokenType` instead.
- `getCredentials` in Android will return `expiresIn` instead of `expiresAt`
- `max_age` parameter is changed to `maxAge` in `WebAuth.authorize()`
- Web Auth will now have default scope of 'openid profile email'
- Minimum supported version for iOS is bumped to 13
- skipLegacyListener has been removed in `authorize` and `clearSession`
- `customScheme` is now part of `ClearSessionOptions` instead of `ClearSessionParameters` in `clearSession`
- Callback URL migration:
  We are migrating the callback URL we use for the SDK to below:   
  ```
  iOS: {PRODUCT_BUNDLE_IDENTIFIER}.auth0://{DOMAIN}/ios/{PRODUCT_BUNDLE_IDENTIFIER}/callback
  Android: {YOUR_APP_PACKAGE_NAME}.auth0://{DOMAIN}/android/{YOUR_APP_PACKAGE_NAME}/callback
  ```
  You can choose to migrate or not by following the below steps
  - **If your project is built with Expo:**
    - To keep things as it is, you don't have to do anything
    - To migrate to new non-custom scheme flow.
      - Remove custom scheme in app.json and `authorize()`.
      - Run npx expo prebuild --clean (Any manual changes to Android or iOS folders will be lost)
      - Add the new callback URL to Auth0 dashboard
  - **If your project is built with Non Expo:**
    - To keep things as it is, set `useLegacyCallbackUrl` to true in `authorize` and `clearSession`
    - To migrate to new non-custom scheme flow, Add the new callback URL to Auth0 dashboard
