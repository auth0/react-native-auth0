# Examples using react-native-auth0

- [Authentication API](#authentication-api)
  - [Login with Password Realm Grant](#login-with-password-realm-grant)
  - [Get user information using user's access_token](#get-user-information-using-users-access_token)
  - [Getting new access token with refresh token](#getting-new-access-token-with-refresh-token)
  - [Using custom scheme for web authentication redirection](#using-custom-scheme-for-web-authentication-redirection)
  - [Login using MFA with One Time Password code](#login-using-mfa-with-one-time-password-code)
  - [Login with Passwordless](#login-with-passwordless)
  - [Create user in database connection](#create-user-in-database-connection)
  - [Using HTTPS callback URLs](#using-https-callback-urls)
  - [Using Custom Headers](#using-custom-headers)
    - [Set global headers during initialization](#set-global-headers-during-initialization)
    - [Using custom headers with Auth0Provider component](#using-custom-headers-with-auth0provider-component)
    - [Set request-specific headers](#set-request-specific-headers)
- [Biometric Authentication](#biometric-authentication)
  - [Biometric Policy Types](#biometric-policy-types)
  - [Using with Auth0Provider (Hooks)](#using-with-auth0provider-hooks)
  - [Using with Auth0 Class](#using-with-auth0-class)
  - [Platform-Specific Behavior](#platform-specific-behavior)
  - [Migration from Previous Behavior](#migration-from-previous-behavior)
- [Management API (Users)](#management-api-users)
  - [Patch user with user_metadata](#patch-user-with-user_metadata)
  - [Get full user profile](#get-full-user-profile)
- [Organizations](#organizations)
  - [Log in to an organization](#log-in-to-an-organization)
  - [Accept user invitations](#accept-user-invitations)
- [DPoP (Demonstrating Proof-of-Possession)](#dpop-demonstrating-proof-of-possession)
  - [Enabling DPoP](#enabling-dpop)
  - [Making API calls with DPoP](#making-api-calls-with-dpop)
  - [Handling DPoP token migration](#handling-dpop-token-migration)
  - [Checking token type](#checking-token-type)
  - [Handling nonce errors](#handling-nonce-errors)
- [Multi-Resource Refresh Tokens (MRRT)](#multi-resource-refresh-tokens-mrrt)
  - [Overview](#mrrt-overview)
  - [Prerequisites](#mrrt-prerequisites)
  - [Using MRRT with Hooks](#using-mrrt-with-hooks)
  - [Using MRRT with Auth0 Class](#using-mrrt-with-auth0-class)
  - [Web Platform Configuration](#web-platform-configuration)
- [Native to Web SSO (Early Access)](#native-to-web-sso-early-access)
  - [Overview](#native-to-web-sso-overview)
  - [Prerequisites](#native-to-web-sso-prerequisites)
  - [Using Native to Web SSO with Hooks](#using-native-to-web-sso-with-hooks)
  - [Using Native to Web SSO with Auth0 Class](#using-native-to-web-sso-with-auth0-class)
  - [Sending the Session Transfer Token](#sending-the-session-transfer-token)
- [Bot Protection](#bot-protection)
  - [Domain Switching](#domain-switching)
    - [Android](#android)
    - [iOS](#ios)
    - [Expo](#expo)

## Authentication API

Unlike web authentication, we do not provide a hook for integrating with the Authentication API.

Instantiate the `Auth0` class to get access to the methods that call Auth0's Authentication API endpoints:

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});
```

### Login with Password Realm Grant

```js
auth0.auth
  .passwordRealm({
    username: 'info@auth0.com',
    password: 'password',
    realm: 'myconnection',
  })
  .then(console.log)
  .catch(console.error);
```

### Get user information using user's access_token

```js
auth0.auth
  .userInfo({ token: 'the user access_token' })
  .then(console.log)
  .catch(console.error);
```

This endpoint requires an access token that was granted the `/userinfo` audience. Check that the authentication request that returned the access token included an audience value of `https://{YOUR_AUTH0_DOMAIN}.auth0.com/userinfo`.

### Getting new access token with refresh token

```js
auth0.auth
  .refreshToken({ refreshToken: 'the user refresh_token' })
  .then(console.log)
  .catch(console.error);
```

### Using custom scheme for web authentication redirection

Custom Schemes can be used for redirecting to the React Native application after web authentication:

```js
authorize({}, { customScheme: 'YOUR_AUTH0_DOMAIN' })
  .then(console.log)
  .catch(console.error);
```

### Login using MFA with One Time Password code

This call requires the client to have the _MFA_ Client Grant Type enabled. Check [this article](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.

When you sign in to a multifactor authentication enabled connection using the `passwordRealm` method, you receive an error stating that MFA is required for that user along with an `mfa_token` value. Use this value to call `loginWithOTP` and complete the MFA flow passing the One Time Password from the enrolled MFA code generator app.

```js
auth0.auth
  .loginWithOTP({
    mfaToken: error.json.mfa_token,
    otp: '{user entered OTP}',
  })
  .then(console.log)
  .catch(console.error);
```

### Login with Passwordless

Passwordless is a two-step authentication flow that makes use of this type of connection. The **Passwordless OTP** grant is required to be enabled in your Auth0 application beforehand. Check [our guide](https://auth0.com/docs/dashboard/guides/applications/update-grant-types) to learn how to enable it.

To start the flow, you request a code to be sent to the user's email or phone number. For email scenarios only, a link can be sent in place of the code.

```js
auth0.auth
  .passwordlessWithEmail({
    email: 'info@auth0.com',
    send: 'link',
  })
  .then(console.log)
  .catch(console.error);
```

or

```js
auth0.auth
  .passwordlessWithSMS({
    phoneNumber: '+5491159991000',
  })
  .then(console.log)
  .catch(console.error);
```

Then, in order to complete the authentication, you must send back that received code value along with the email or phone number used:

```js
auth0.auth
  .loginWithEmail({
    email: 'info@auth0.com',
    code: '123456',
  })
  .then(console.log)
  .catch(console.error);
```

or

```js
auth0.auth
  .loginWithSMS({
    phoneNumber: '+5491159991000',
    code: '123456',
  })
  .then(console.log)
  .catch(console.error);
```

### Create user in database connection

```js
auth0.auth
  .createUser({
    email: 'info@auth0.com',
    username: 'username',
    password: 'password',
    connection: 'myconnection',
  })
  .then(console.log)
  .catch(console.error);
```

### Using HTTPS callback URLs

HTTPS callback URLs provide enhanced security compared to custom URL schemes. They work with Android App Links and iOS Universal Links to prevent URL scheme hijacking:

```js
auth0.webAuth
  .authorize({ scope: 'openid profile email' }, { customScheme: 'https' })
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

### Using Custom Headers

You can set custom headers to be included in all requests to the Auth0 API. This can be useful for implementing custom security requirements, logging, or tracking.

#### Set global headers during initialization

Global headers are included in all requests made by the SDK:

```js
// Set global headers during Auth0 initialization
const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  headers: {
    'Accept-Language': 'fr-CA',
    'X-Tracking-Id': 'user-tracking-id-123',
  },
});
```

#### Using custom headers with Auth0Provider component

If you're using the hooks-based approach with Auth0Provider, you can provide headers during initialization:

```jsx
import { Auth0Provider } from 'react-native-auth0';

// In your app component
<Auth0Provider
  domain={'YOUR_AUTH0_DOMAIN'}
  clientId={'YOUR_CLIENT_ID'}
  headers={{
    'Accept-Language': 'fr-CA',
    'X-App-Version': '1.2.3',
  }}
>
  <App />
</Auth0Provider>;
```

#### Set request-specific headers

You can also provide headers for specific API calls, which will override global headers with the same name:

```js
// For specific authentication requests
auth0.auth
  .passwordRealm({
    username: 'info@auth0.com',
    password: 'password',
    realm: 'myconnection',
    headers: {
      'X-Custom-Header': 'request-specific-value',
      'X-Request-ID': 'unique-request-id-456',
    },
  })
  .then(console.log)
  .catch(console.error);
```

## Biometric Authentication

> **Platform Support:** Native only (iOS/Android)

Configure biometric authentication to protect credential access. The SDK supports four biometric policies that control when biometric prompts are shown.

### Biometric Policy Types

- **`BiometricPolicy.default`**: System-managed behavior. Reuses the same `LAContext` on iOS, allowing the system to optimize prompt frequency. May skip the biometric prompt if authentication was recently successful.

- **`BiometricPolicy.always`**: Always requires biometric authentication on every credential access. Creates a fresh `LAContext` on iOS and uses the "Always" policy on Android to ensure a new prompt is shown.

- **`BiometricPolicy.session`**: Requires biometric authentication only once per session. After successful authentication, credentials can be accessed without prompting for the specified timeout duration.

- **`BiometricPolicy.appLifecycle`**: Similar to session policy, but persists for the app's lifecycle. Session remains valid until the app restarts or `clearCredentials()` is called. Default timeout is 1 hour (3600 seconds).

### Using with Auth0Provider (Hooks)

```jsx
import { Auth0Provider, BiometricPolicy } from 'react-native-auth0';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_CLIENT_ID"
      localAuthenticationOptions={{
        title: 'Authenticate to access credentials',
        subtitle: 'Please authenticate to continue',
        description: 'We need to authenticate you to retrieve your credentials',
        cancelTitle: 'Cancel',
        evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
        fallbackTitle: 'Use Passcode',
        authenticationLevel: LocalAuthenticationLevel.strong,
        deviceCredentialFallback: true,
        // Option 1: Default policy (system-managed, backward compatible)
        biometricPolicy: BiometricPolicy.default,

        // Option 2: Always require biometric authentication
        // biometricPolicy: BiometricPolicy.always,

        // Option 3: Session-based (5 minutes)
        // biometricPolicy: BiometricPolicy.session,
        // biometricTimeout: 300,

        // Option 4: App lifecycle (1 hour)
        // biometricPolicy: BiometricPolicy.appLifecycle,
        // biometricTimeout: 3600,
      }}
    >
      <YourApp />
    </Auth0Provider>
  );
}
```

### Using with Auth0 Class

```js
import Auth0, { BiometricPolicy } from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  localAuthenticationOptions: {
    title: 'Authenticate to access credentials',
    subtitle: 'Please authenticate to continue',
    description: 'We need to authenticate you to retrieve your credentials',
    cancelTitle: 'Cancel',
    evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
    fallbackTitle: 'Use Passcode',
    authenticationLevel: LocalAuthenticationLevel.strong,
    deviceCredentialFallback: true,
    biometricPolicy: BiometricPolicy.session,
    biometricTimeout: 300, // 5 minutes
  },
});

// Get credentials - will prompt for biometric authentication based on policy
const credentials = await auth0.credentialsManager.getCredentials();
```

### Platform-Specific Behavior

#### Android

- `BiometricPolicy.default` and `BiometricPolicy.always` both map to the Android SDK's "Always" policy
- Uses `BiometricPrompt` for authentication
- Session state is stored in memory and cleared on app restart

#### iOS

- `BiometricPolicy.default` reuses the same `LAContext`, allowing the system to manage prompt frequency
- `BiometricPolicy.always`, `session`, and `appLifecycle` create a fresh `LAContext` to ensure reliable prompts
- Uses Face ID or Touch ID based on device capabilities
- Session state is thread-safe and managed in memory

### Migration from Previous Behavior

If you were not explicitly configuring biometric authentication before, the new `BiometricPolicy.default` maintains backward-compatible behavior. To enforce stricter biometric requirements, switch to `BiometricPolicy.always`.

## Management API (Users)

### Patch user with user_metadata

```js
auth0
  .users('the user access_token')
  .patchUser({
    id: 'user_id',
    metadata: { first_name: 'John', last_name: 'Doe' },
  })
  .then(console.log)
  .catch(console.error);
```

### Get full user profile

```js
auth0
  .users('{ACCESS_TOKEN}')
  .getUser({ id: 'user_id' })
  .then(console.log)
  .catch(console.error);
```

For more info please check our generated [documentation](https://auth0.github.io/react-native-auth0/index.html)

## Organizations

[Organizations](https://auth0.com/docs/organizations) is a set of features that provide better support for developers who build and maintain SaaS and Business-to-Business (B2B) applications.

Using Organizations, you can:
Note that Organizations is currently only available to customers on our Enterprise and Startup subscription plans.

### Log in to an organization

```js
auth0.webAuth
  .authorize({ organization: 'organization-id' })
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

### Accept user invitations

Users can be invited to your organization via a link. Tapping on the invitation link should open your app. Since invitations links are `https` only, is recommended that your Android app supports [Android App Links](https://developer.android.com/training/app-links). In the case of iOS, your app must support [Universal Links](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/supporting_universal_links_in_your_app).

In [Enable Android App Links Support](https://auth0.com/docs/applications/enable-android-app-links-support) and [Enable Universal Links Support](https://auth0.com/docs/enable-universal-links-support-in-apple-xcode), you will find how to make the Auth0 server publish the Digital Asset Links file required by your applications.

When your app gets opened by an invitation link, grab the invitation URL and pass it as a parameter to the webauth call. Use the [Linking Module](https://reactnative.dev/docs/linking) method called `getInitialUrl()` to obtain the URL that launched your application.

```js
auth0.webAuth
  .authorize({
    invitationUrl:
      'https://myapp.com/login?invitation=inv123&organization=org123',
  })
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

If the URL doesn't contain the expected values, an error will be raised through the provided callback.

## Multi-Resource Refresh Tokens (MRRT)

### MRRT Overview

Multi-Resource Refresh Tokens (MRRT) allow your application to obtain access tokens for multiple APIs using a single refresh token. This is useful when your application needs to access multiple backend services, each identified by a different audience.

### MRRT Prerequisites

Before using MRRT, ensure:

1. **MRRT is enabled on your Auth0 tenant** - Contact Auth0 support or enable it through the Auth0 Dashboard
2. **Request `offline_access` scope during login** - This ensures a refresh token is issued
3. **Configure your APIs in Auth0 Dashboard** - Each API you want to access should be registered with its own audience identifier

### Using MRRT with Hooks

```tsx
import { useAuth0 } from 'react-native-auth0';

function MyComponent() {
  const { authorize, getApiCredentials, clearApiCredentials } = useAuth0();

  const login = async () => {
    // Login with offline_access to get a refresh token
    await authorize({
      scope: 'openid profile email offline_access',
      audience: 'https://primary-api.example.com',
    });
  };

  const getFirstApiToken = async () => {
    try {
      // Get credentials for the first API
      const credentials = await getApiCredentials(
        'https://first-api.example.com',
        'read:data write:data'
      );
      console.log('First API Access Token:', credentials.accessToken);
      console.log('Expires At:', new Date(credentials.expiresAt * 1000));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSecondApiToken = async () => {
    try {
      // Get credentials for a different API using the same refresh token
      const credentials = await getApiCredentials(
        'https://second-api.example.com',
        'read:reports'
      );
      console.log('Second API Access Token:', credentials.accessToken);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clearFirstApiCache = async () => {
    // Clear cached credentials for a specific API
    await clearApiCredentials('https://first-api.example.com');
  };

  return (
    // Your UI components
  );
}
```

### Using MRRT with Auth0 Class

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// Login with offline_access scope
await auth0.webAuth.authorize({
  scope: 'openid profile email offline_access',
  audience: 'https://primary-api.example.com',
});

// Get credentials for a specific API
const apiCredentials = await auth0.credentialsManager.getApiCredentials(
  'https://first-api.example.com',
  'read:data write:data'
);

console.log('Access Token:', apiCredentials.accessToken);
console.log('Token Type:', apiCredentials.tokenType);
console.log('Expires At:', apiCredentials.expiresAt);
console.log('Scope:', apiCredentials.scope);

// Clear cached credentials for a specific API
await auth0.credentialsManager.clearApiCredentials(
  'https://first-api.example.com'
);
```

### Web Platform Configuration

On the **web platform**, you must explicitly enable MRRT support in the `Auth0Provider`:

```tsx
import { Auth0Provider } from 'react-native-auth0';

function App() {
  return (
    <Auth0Provider
      domain="your-domain.auth0.com"
      clientId="your-client-id"
      useMrrt={true}
      cacheLocation="localstorage"
    >
      <YourApp />
    </Auth0Provider>
  );
}
```

## Native to Web SSO (Early Access)

> ⚠️ **Early Access Feature**: Native to Web SSO is currently available in Early Access. To use this feature, you must have an Enterprise plan. For more information, see [Product Release Stages](https://auth0.com/docs/troubleshoot/product-lifecycle/product-release-stages).

### Native to Web SSO Overview

Native to Web SSO allows authenticated users in your native mobile application to seamlessly transition to your web application without requiring them to log in again. This is achieved by exchanging a refresh token for a Session Transfer Token, which can then be used to establish a session in the web application.

The Session Transfer Token is:

- **Short-lived**: Expires after approximately 1 minute
- **Single-use**: Can only be used once to establish a web session
- **Secure**: Can be bound to the user's device through IP address or ASN

For detailed configuration and implementation guidance, see the [Auth0 Native to Web SSO documentation](https://auth0.com/docs/authenticate/single-sign-on/native-to-web/configure-implement-native-to-web).

### Native to Web SSO Prerequisites

Before using Native to Web SSO:

1. **Enable Native to Web SSO on your Auth0 tenant** - This feature requires an Enterprise plan
2. [**Configure your native application**](https://auth0.com/docs/authenticate/single-sign-on/native-to-web/configure-implement-native-to-web#configure-native-applications)
3. **Request `offline_access` scope during login** to ensure a refresh token is issued

### Using Native to Web SSO with Hooks

```tsx
import { useAuth0 } from 'react-native-auth0';
import { Linking } from 'react-native';

function MyComponent() {
  const { authorize, getSSOCredentials } = useAuth0();

  const login = async () => {
    // Login with offline_access to get a refresh token
    await authorize({
      scope: 'openid profile email offline_access',
    });
  };

  const openWebApp = async () => {
    try {
      // Get session transfer credentials
      const ssoCredentials = await getSSOCredentials();

      console.log('Session Transfer Token:', ssoCredentials.sessionTransferToken);
      console.log('Token Type:', ssoCredentials.tokenType);
      console.log('Expires In:', ssoCredentials.expiresIn, 'seconds');

      // Open web app with session transfer token as query parameter
      const webAppUrl = `https://your-web-app.com/login?session_transfer_token=${ssoCredentials.sessionTransferToken}`;
      await Linking.openURL(webAppUrl);
    } catch (error) {
      console.error('Failed to get SSO credentials:', error);
    }
  };

  return (
    // Your UI components
  );
}
```

### Using Native to Web SSO with Auth0 Class

```js
import Auth0 from 'react-native-auth0';
import { Linking } from 'react-native';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// Login with offline_access scope
await auth0.webAuth.authorize({
  scope: 'openid profile email offline_access',
});

// Get session transfer credentials
const ssoCredentials = await auth0.credentialsManager.getSSOCredentials();

console.log('Session Transfer Token:', ssoCredentials.sessionTransferToken);
console.log('Token Type:', ssoCredentials.tokenType);
console.log('Expires In:', ssoCredentials.expiresIn);

// Optional: ID Token and Refresh Token may be returned if RTR is enabled
if (ssoCredentials.idToken) {
  console.log('ID Token:', ssoCredentials.idToken);
}
if (ssoCredentials.refreshToken) {
  console.log('New Refresh Token received (RTR enabled)');
}

// Open your web application with the session transfer token
const webAppUrl = `https://your-web-app.com/login?session_transfer_token=${ssoCredentials.sessionTransferToken}`;
await Linking.openURL(webAppUrl);
```

### Sending the Session Transfer Token

There are two ways to send the Session Transfer Token to your web application:

#### Option 1: As a Query Parameter

Pass the token as a URL parameter when opening your web application:

```js
const ssoCredentials = await auth0.credentialsManager.getSSOCredentials();

// Your web app should extract the token and pass it to Auth0's /authorize endpoint
const webAppUrl = `https://your-web-app.com/login?session_transfer_token=${ssoCredentials.sessionTransferToken}`;
await Linking.openURL(webAppUrl);
```

Your web application should then include the `session_transfer_token` in the `/authorize` request:

```js
// In your web application
const urlParams = new URLSearchParams(window.location.search);
const sessionTransferToken = urlParams.get('session_transfer_token');

if (sessionTransferToken) {
  // Include in your authorization request
  const authorizeUrl =
    `https://YOUR_AUTH0_DOMAIN/authorize?` +
    `client_id=YOUR_WEB_CLIENT_ID&` +
    `redirect_uri=${encodeURIComponent('https://your-web-app.com/callback')}&` +
    `response_type=code&` +
    `scope=openid profile email&` +
    `session_transfer_token=${sessionTransferToken}`;

  window.location.href = authorizeUrl;
}
```

#### Option 2: As a Cookie (WebView only)

If your application uses a WebView that supports cookie injection:

```js
import { WebView } from 'react-native-webview';

function WebAppView() {
  const [cookies, setCookies] = useState('');

  const prepareWebSession = async () => {
    const ssoCredentials = await auth0.credentialsManager.getSSOCredentials();

    // Set cookie that will be sent to Auth0
    const cookie = `auth0_session_transfer_token=${ssoCredentials.sessionTransferToken}; path=/; domain=.your-auth0-domain.auth0.com; secure`;
    setCookies(cookie);
  };

  return (
    <WebView
      source={{ uri: 'https://your-web-app.com' }}
      sharedCookiesEnabled={true}
      // Additional WebView configuration for cookie injection
    />
  );
}
```

> **Note**: Cookie injection is platform-specific and may require additional configuration. The query parameter method is generally more straightforward and recommended for most use cases.

## Bot Protection

If you are using the [Bot Protection](https://auth0.com/docs/anomaly-detection/bot-protection) feature and performing database login/signup via the Authentication API, you need to handle the `requires_verification` error. It indicates that the request was flagged as suspicious and an additional verification step is necessary to log the user in. That verification step is web-based, so you need to use Universal Login to complete it.

```js
const email = 'support@auth0.com';
const realm = 'Username-Password-Authentication';
const scope = 'openid profile';

auth0.auth
  .passwordRealm({
    username: email,
    password: 'secret-password',
    realm: realm,
    scope: scope,
  })
  .then((credentials) => {
    // Logged in!
  })
  .catch((error) => {
    if (error.name === 'requires_verification') {
      auth0.webAuth
        .authorize({
          connection: realm,
          scope: scope,
          login_hint: email, // So the user doesn't have to type it again
        })
        .then((credentials) => {
          // Logged in!
        })
        .catch(console.error);
    } else {
      console.error(error);
    }
  });
```

In the case of signup, you can add [an additional parameter](https://auth0.com/docs/universal-login/new-experience#signup) to make the user land directly on the signup page:

```js
auth0.webAuth.authorize({
  connection: realm,
  scope: scope,
  additionalParameters: {
    login_hint: email,
    screen_hint: 'signup', // 👈🏻
  },
});
```

### Domain Switching

To switch between two different domains for authentication in your Android and iOS applications, follow these steps:

#### Android

To switch between two different domains for authentication in your Android application, you need to manually update your `AndroidManifest.xml` file. This involves adding an intent filter for the activity `com.auth0.android.provider.RedirectActivity`. Unlike using a single domain where you can add the domain and scheme values within the `manifestPlaceholders` of your app's `build.gradle` file, you need to add a `<data>` tag for each domain along with its scheme within the intent filter.

Here is an example:

```xml
<activity
    android:name="com.auth0.android.provider.RedirectActivity"
    tools:node="replace"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:host="${domain1}"
            android:pathPrefix="/android/${applicationId}/callback"
            android:scheme="${applicationId}.auth0" />
        <data
            android:host="${domain2}"
            android:pathPrefix="/android/${applicationId}/callback"
            android:scheme="${applicationId}.auth0" />
    </intent-filter>
</activity>
```

If you customize the scheme by removing the default value of `${applicationId}.auth0`, you will also need to pass it as the `customScheme` option parameter of the `authorize` and `clearSession` methods.

#### iOS

For iOS, if you are not customizing the scheme, adding `$(PRODUCT_BUNDLE_IDENTIFIER).auth0` as an entry to the `CFBundleURLSchemes` array in your `Info.plist` file should be sufficient. However, if you want to customize the scheme for the domains, you need to add the customized scheme for each domain as an entry to the `CFBundleURLSchemes` array.

Here is an example:

```
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>None</string>
        <key>CFBundleURLName</key>
        <string>auth0</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>$(customScheme1)</string>
            <string>$(customScheme2)</string>
        </array>
    </dict>
</array>
```

By following these steps, you can configure your Android and iOS applications to handle authentication for multiple domains.

#### Expo

If using a single domain, you can simply pass an object in the format to the `react-native-auth0` plugin in your `app.json` as shown below:

```json
"plugins": [
  "expo-router",
  ["react-native-auth0",
    {
      "domain": "sample.auth0.com",
      "customScheme": "sampleScheme"
    }
  ]
]
```

If you want to support multiple domains, you would have to pass an array of objects as shown below:

```json
"plugins": [
  "expo-router",
  ["react-native-auth0",
    [{
      "domain": "sample.auth0.com",
      "customScheme": "sampleScheme"
    },
    {
      "domain": "sample2.auth0.com",
      "customScheme": "sampleScheme2"
    }]
  ]
]
```

You can skip sending the `customScheme` property if you do not want to customize it.

## DPoP (Demonstrating Proof-of-Possession)

[DPoP](https://datatracker.ietf.org/doc/html/rfc9449) (Demonstrating Proof-of-Possession) is an OAuth 2.0 extension that cryptographically binds access and refresh tokens to a client-specific key pair. This prevents token theft and replay attacks by ensuring that even if a token is intercepted, it cannot be used from a different device.

> **Note**: This feature is currently available in [Early Access](https://auth0.com/docs/troubleshoot/product-lifecycle/product-release-stages#early-access). Please reach out to Auth0 support to get it enabled for your tenant.

### Enabling DPoP

DPoP is enabled by default (`useDPoP: true`) when you initialize the Auth0 client:

```js
import Auth0 from 'react-native-auth0';

// DPoP is enabled by default
const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// Or explicitly enable it
const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  useDPoP: true, // Explicitly enable DPoP
});
```

**Using Auth0Provider (React Hooks):**

```js
import { Auth0Provider } from 'react-native-auth0';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      // DPoP is enabled by default
    >
      {/* Your app components */}
    </Auth0Provider>
  );
}
```

> **Important**: DPoP will only be used for **new user sessions** created after enabling it. Existing sessions with Bearer tokens will continue to work until the user logs in again. See [Handling DPoP token migration](#handling-dpop-token-migration) for how to handle this transition.

### Making API calls with DPoP

When calling your own APIs with DPoP-bound tokens, you need to include both the `Authorization` header and the `DPoP` proof header. The SDK provides a `getDPoPHeaders()` method to generate these headers:

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  useDPoP: true,
});

async function callApi() {
  try {
    // Get credentials
    const credentials = await auth0.credentialsManager.getCredentials();

    // Generate DPoP headers for your API request
    const headers = await auth0.getDPoPHeaders({
      url: 'https://api.example.com/data',
      method: 'GET',
      accessToken: credentials.accessToken,
      tokenType: credentials.tokenType,
    });

    // Make the API call with the headers
    const response = await fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

**Using React Hooks:**

```js
import { useAuth0 } from 'react-native-auth0';

function MyComponent() {
  const { getCredentials, getDPoPHeaders } = useAuth0();

  const callApi = async () => {
    try {
      const credentials = await getCredentials();

      const headers = await getDPoPHeaders({
        url: 'https://api.example.com/data',
        method: 'POST',
        accessToken: credentials.accessToken,
        tokenType: credentials.tokenType,
      });

      const response = await fetch('https://api.example.com/data', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Hello' }),
      });

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  return <Button title="Call API" onPress={callApi} />;
}
```

### Handling DPoP token migration

When you enable DPoP in your app, existing users will still have Bearer tokens until they log in again. You should implement logic to detect old tokens and prompt users to re-authenticate:

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  useDPoP: true,
});

async function ensureDPoPTokens() {
  try {
    // Check if user has credentials
    const hasCredentials = await auth0.credentialsManager.hasValidCredentials();

    if (!hasCredentials) {
      // No credentials, user needs to log in
      return await auth0.webAuth.authorize();
    }

    // Get existing credentials
    const credentials = await auth0.credentialsManager.getCredentials();

    // Check if the token is DPoP
    if (credentials.tokenType !== 'DPoP') {
      console.log(
        'User has old Bearer token, clearing and re-authenticating...'
      );

      // Clear old credentials
      await auth0.credentialsManager.clearCredentials();

      // Prompt user to log in again with DPoP
      return await auth0.webAuth.authorize();
    }

    console.log('User already has DPoP token');
    return credentials;
  } catch (error) {
    console.error('Token migration failed:', error);
    throw error;
  }
}

// Call this when your app starts or when accessing protected resources
ensureDPoPTokens()
  .then((credentials) => console.log('Ready with DPoP tokens:', credentials))
  .catch((error) => console.error('Failed to ensure DPoP tokens:', error));
```

**Using React Hooks:**

```js
import { useAuth0 } from 'react-native-auth0';
import { useEffect, useState } from 'react';

function App() {
  const { authorize, getCredentials, clearSession, hasValidCredentials } =
    useAuth0();
  const [isReady, setIsReady] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    checkAndMigrateToDPoP();
  }, []);

  const checkAndMigrateToDPoP = async () => {
    try {
      const hasValid = await hasValidCredentials();

      if (!hasValid) {
        setIsReady(true);
        return;
      }

      const credentials = await getCredentials();

      if (credentials.tokenType !== 'DPoP') {
        setNeedsMigration(true);
        // Optionally auto-clear or wait for user action
        // await clearSession();
        // await authorize();
      }

      setIsReady(true);
    } catch (error) {
      console.error('Migration check failed:', error);
      setIsReady(true);
    }
  };

  const handleMigration = async () => {
    try {
      await clearSession();
      await authorize();
      setNeedsMigration(false);
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (needsMigration) {
    return (
      <View>
        <Text>Security Update Required</Text>
        <Text>
          Please log in again to enhance your account security with DPoP.
        </Text>
        <Button title="Log In Again" onPress={handleMigration} />
      </View>
    );
  }

  return <YourApp />;
}
```

### Checking token type

You can check whether credentials use DPoP or Bearer tokens:

```js
const credentials = await auth0.credentialsManager.getCredentials();

if (credentials.tokenType === 'DPoP') {
  console.log('Using DPoP token - enhanced security enabled');

  // Generate DPoP headers for API calls
  const headers = await auth0.getDPoPHeaders({
    url: 'https://api.example.com/data',
    method: 'GET',
    accessToken: credentials.accessToken,
    tokenType: credentials.tokenType,
  });
} else {
  console.log('Using Bearer token - consider migrating to DPoP');

  // Standard Bearer authorization
  const headers = {
    Authorization: `Bearer ${credentials.accessToken}`,
  };
}
```

### Handling nonce errors

Some APIs may require DPoP nonces to prevent replay attacks. If your API responds with a `use_dpop_nonce` error, you can retry the request with the nonce:

```js
async function callApiWithNonce(url, method, credentials, retryCount = 0) {
  try {
    // Generate headers (initially without nonce)
    const headers = await auth0.getDPoPHeaders({
      url,
      method,
      accessToken: credentials.accessToken,
      tokenType: credentials.tokenType,
    });

    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    // Check if nonce is required
    if (response.status === 401 && retryCount === 0) {
      const authHeader = response.headers.get('WWW-Authenticate');

      if (authHeader && authHeader.includes('use_dpop_nonce')) {
        // Extract nonce from response
        const nonce = response.headers.get('DPoP-Nonce');

        if (nonce) {
          console.log('Retrying with DPoP nonce...');

          // Retry with nonce
          const headersWithNonce = await auth0.getDPoPHeaders({
            url,
            method,
            accessToken: credentials.accessToken,
            tokenType: credentials.tokenType,
            nonce,
          });

          return await fetch(url, {
            method,
            headers: {
              ...headersWithNonce,
              'Content-Type': 'application/json',
            },
          });
        }
      }
    }

    return response;
  } catch (error) {
    console.error('API call with nonce failed:', error);
    throw error;
  }
}

// Usage
const credentials = await auth0.credentialsManager.getCredentials();
const response = await callApiWithNonce(
  'https://api.example.com/data',
  'GET',
  credentials
);
const data = await response.json();
```
