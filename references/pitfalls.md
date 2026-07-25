# Common Pitfalls

- **Redirect URIs must match the Auth0 dashboard exactly.**
  - iOS: `{BUNDLE_ID}://{DOMAIN}/ios/{BUNDLE_ID}/callback`
  - Android: `{SCHEME}://{DOMAIN}/android/{PACKAGE_NAME}/callback`
- **TurboModule spec changes need codegen.** After editing `src/specs/NativeA0Auth0.ts`, regenerate CodeGen and update both iOS (`NativeBridge.swift`, `A0Auth0.mm`) and Android (`A0Auth0Module.kt` + `newarch/` **and** `oldarch/` specs). The `codegenConfig` in `package.json` must stay in sync.
- **`useAuth0()` must be inside `<Auth0Provider>`** — calling it outside the provider throws / returns uninitialized state.
- **Native drift.** A method added to the bridge on only one platform silently no-ops on the other. Change iOS, Android, and web together.
- **Android Custom Tabs** require a browser that supports them (e.g. Chrome) on the device.
- **Web feature gaps.** Some native features aren't available through `@auth0/auth0-spa-js`; the web adapter should degrade gracefully with a clear error or no-op rather than pretend support.
- **Telemetry version placeholder.** `src/core/utils/telemetry.ts` contains `__SDK_VERSION__`, replaced at prebuild by `scripts/replace-telemetry-version.js`. Don't hardcode a version there.
