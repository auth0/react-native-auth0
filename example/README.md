## Running the Example Application 🏃‍♂️

The Example application can be used for development purpose of the SDK. To integrate with Auth0, it is better to use the [Quickstart](https://auth0.com/docs/quickstart/native/react-native/interactive) and [Sample App](https://github.com/auth0-samples/auth0-react-native-sample/tree/master/00-Login-Hooks) applications

To run the example application inside the repository, follow these steps:

1. Open a terminal or command prompt.
2. Run `yarn bootstrap` to set up the project.
3. Run `yarn ci` to build the project.
4. To run the application:
   For Android, run `yarn example:android`.
   For iOS, run `yarn example:ios`.

The application will be built and launched on the specified platform, allowing you to interact with it.

To run the web example, run `yarn web` from the `example` directory and open the served URL.

### Layout

The app has no navigation. `App.tsx` (native) renders a single sectioned
`ScrollView`, one section per SDK feature group: Web Auth, Credentials Manager,
Direct Auth API (native only), Passwordless (native only), MFA, My Account,
Passkeys, and Advanced Tokens. `App.web.tsx` is a single file covering the
web-supported features only, with web-specific methods labelled inline.

Each native feature has two files under `src/features/`:

- `FeatureHooks.tsx` — the `useAuth0()` hooks approach. These are the files the
  app actually imports and renders.
- `FeatureClass.tsx` — the same feature written against the `Auth0` class
  instance (`src/shared/api.ts`), kept as unused side-by-side reference. Nothing
  imports these; they exist to show the class API next to the hooks API.

Platform-specific methods carry the platform in their label (e.g.
`resumeSession (Android)`, `cancelWebAuth (iOS)`, `saveCredentials (Native only)`).
There is no custom styling — only default React Native components with spacing.

### To run on different Auth0 Application

1. Change the `clientId` and `domain` value in `example/src/auth0-configuration.js`
2. For Android, Change the `android:host` values in `example/android/app/src/main/AndroidManifest.xml`
