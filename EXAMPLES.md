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
- [Credential Renewal Retry](#credential-renewal-retry)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Using Retry with Hooks](#using-retry-with-hooks)
  - [Using Retry with Auth0 Class](#using-retry-with-auth0-class)
  - [Platform Support](#platform-support)
  - [Error Handling](#error-handling)
- [Biometric Authentication](#biometric-authentication)
  - [Biometric Policy Types](#biometric-policy-types)
  - [Using with Auth0Provider (Hooks)](#using-with-auth0provider-hooks)
  - [Using with Auth0 Class](#using-with-auth0-class)
  - [Platform-Specific Behavior](#platform-specific-behavior)
    - [Android](#android)
    - [iOS](#ios)
  - [Migration from Previous Behavior](#migration-from-previous-behavior)
- [Management API (Users)](#management-api-users)
  - [Patch user with user_metadata](#patch-user-with-user_metadata)
  - [Get full user profile](#get-full-user-profile)
- [Organizations](#organizations)
  - [Log in to an organization](#log-in-to-an-organization)
  - [Accept user invitations](#accept-user-invitations)
- [Multi-Resource Refresh Tokens (MRRT)](#multi-resource-refresh-tokens-mrrt)
  - [MRRT Overview](#mrrt-overview)
  - [MRRT Prerequisites](#mrrt-prerequisites)
  - [Using MRRT with Hooks](#using-mrrt-with-hooks)
  - [Using MRRT with Auth0 Class](#using-mrrt-with-auth0-class)
  - [Web Platform Configuration](#web-platform-configuration)
- [Custom Token Exchange (RFC 8693)](#custom-token-exchange-rfc-8693)
  - [Using Custom Token Exchange with Hooks](#using-custom-token-exchange-with-hooks)
  - [Using Custom Token Exchange with Auth0 Class](#using-custom-token-exchange-with-auth0-class)
  - [With Organization Context](#with-organization-context)
  - [Subject Token Type Requirements](#subject-token-type-requirements)
    - [Valid Token Type Patterns](#valid-token-type-patterns)
    - [Reserved Namespaces (Forbidden)](#reserved-namespaces-forbidden)
    - [Common Use Cases](#common-use-cases)
  - [Error Codes Reference](#error-codes-reference)
  - [Auth0 Actions Validation](#auth0-actions-validation)
- [Passkeys](#passkeys)
  - [Overview](#overview-1)
  - [Prerequisites](#prerequisites-1)
  - [Signup with Passkey](#signup-with-passkey)
  - [Signin with Passkey](#signin-with-passkey)
  - [Auth Response Format](#auth-response-format)
  - [Using Passkeys with Auth0 Class](#using-passkeys-with-auth0-class)
  - [Signup Challenge Parameters](#signup-challenge-parameters)
  - [Error Handling](#error-handling-1)
  - [Platform Support](#platform-support-1)
- [My Account API](#my-account-api)
  - [Overview](#overview-2)
  - [Prerequisites](#prerequisites-2)
  - [Passkey Enrollment](#passkey-enrollment)
  - [Phone Enrollment](#phone-enrollment)
  - [Email Enrollment](#email-enrollment)
  - [TOTP Enrollment](#totp-enrollment)
  - [Recovery Code Enrollment](#recovery-code-enrollment)
  - [Managing Authentication Methods](#managing-authentication-methods)
  - [Getting Available Factors](#getting-available-factors)
  - [Error Handling](#error-handling-2)
  - [Platform Support](#platform-support-2)
- [Native to Web SSO](#native-to-web-sso)
  - [Native to Web SSO Overview](#native-to-web-sso-overview)
  - [Native to Web SSO Prerequisites](#native-to-web-sso-prerequisites)
  - [Using Native to Web SSO with Hooks](#using-native-to-web-sso-with-hooks)
  - [Using Native to Web SSO with Auth0 Class](#using-native-to-web-sso-with-auth0-class)
  - [SSO Exchange via Authentication API](#sso-exchange-via-authentication-api)
    - [Using SSO Exchange with Hooks](#using-sso-exchange-with-hooks)
    - [Using SSO Exchange with Auth0 Class](#using-sso-exchange-with-auth0-class)
  - [Sending the Session Transfer Token](#sending-the-session-transfer-token)
    - [Option 1: As a Query Parameter](#option-1-as-a-query-parameter)
    - [Option 2: As a Cookie (WebView only)](#option-2-as-a-cookie-webview-only)
- [Bot Protection](#bot-protection)
  - [Domain Switching](#domain-switching)
    - [Android](#android-1)
    - [iOS](#ios-1)
    - [Expo](#expo)
- [Allowed Browsers (Android)](#allowed-browsers-android)
  - [Using with Hooks](#using-with-hooks)
  - [Using with Auth0 Class](#using-with-auth0-class-1)
- [Recovering Login After Process Death (Android)](#recovering-login-after-process-death-android)
  - [Using with Hooks](#recovering-login-using-hooks)
  - [Using with Auth0 Class](#recovering-login-using-the-auth0-class)
- [DPoP (Demonstrating Proof-of-Possession)](#dpop-demonstrating-proof-of-possession)
  - [Enabling DPoP](#enabling-dpop)
  - [Making API calls with DPoP](#making-api-calls-with-dpop)
  - [Handling DPoP token migration](#handling-dpop-token-migration)
  - [Checking token type](#checking-token-type)
  - [Handling nonce errors](#handling-nonce-errors)

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

### Parse user profile from an ID token locally

If you already have credentials (e.g. from `webAuth.authorize()` or `credentialsManager.getCredentials()`), you can extract the user profile from the ID token without a network request:

```js
import Auth0, { parseIdToken } from 'react-native-auth0';

const auth0 = new Auth0({ domain, clientId });
const credentials = await auth0.webAuth.authorize({
  scope: 'openid profile email',
});
const user = parseIdToken(credentials.idToken);
// user.sub, user.name, user.email, etc.
```

This is the same parsing that `Auth0Provider` performs internally. It's useful when you manage auth state yourself via the `Auth0` class and want to avoid the network round-trip of `auth.userInfo()`.

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

The `send` option controls how the user receives the challenge, and the two options complete differently. Make sure you use the one that matches how you started the flow:

- **`send: 'code'`** — the user receives a 6-digit one-time code that you collect in your app and exchange for tokens with `loginWithEmail` / `loginWithSMS`. This is fully handled by the SDK and is the recommended option for React Native / Expo.
- **`send: 'link'`** — the user receives a magic link (typically by email). Tapping it completes authentication server-side and redirects to your app's callback URL with the tokens already in the URL fragment (e.g. `myapp://callback#access_token=...`). There is **no** code to pass back to `loginWithEmail` in this case; instead your app must listen for the deep link and parse the tokens from the fragment yourself (see [Handling the magic link callback](#handling-the-magic-link-callback) below).

> [!NOTE]
> This SDK accepts only `'code'` or `'link'` for `send`. The underlying native SDKs (Auth0.swift / Auth0.Android) additionally expose platform-specific link types such as `link_ios` / `link_android`, but those are not surfaced through `react-native-auth0`.

#### Code flow (recommended)

To start the flow, request a code to be sent to the user's email or phone number:

```js
auth0.auth
  .passwordlessWithEmail({
    email: 'info@auth0.com',
    send: 'code',
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

Then, to complete the authentication, send back the received code along with the email or phone number used:

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

#### Magic link flow

To start the flow, request a link to be sent to the user's email:

```js
auth0.auth
  .passwordlessWithEmail({
    email: 'info@auth0.com',
    send: 'link',
  })
  .then(console.log)
  .catch(console.error);
```

##### Handling the magic link callback

With `send: 'link'`, tapping the link in the email completes authentication on the Auth0 server and redirects to your registered callback URL with the tokens in the URL fragment:

```text
myapp://callback#access_token=...&scope=openid%20profile%20email%20offline_access&expires_in=7200&token_type=Bearer
```

The SDK does not intercept this redirect, so do **not** call `loginWithEmail` here — there is no code to send back. Instead, listen for the incoming deep link in your app using React Native's [`Linking`](https://reactnative.dev/docs/linking) API (or [`expo-linking`](https://docs.expo.dev/versions/latest/sdk/linking/) on Expo) and parse the tokens from the URL fragment yourself:

```js
import { Linking } from 'react-native';

function parseTokensFromUrl(url) {
  const fragment = url.split('#')[1] ?? '';
  const params = new URLSearchParams(fragment);
  return {
    accessToken: params.get('access_token'),
    expiresIn: params.get('expires_in'),
    scope: params.get('scope'),
    tokenType: params.get('token_type'),
  };
}

// Handle the case where the app is opened from a cold start by the link
Linking.getInitialURL().then((url) => {
  if (url) {
    const tokens = parseTokensFromUrl(url);
    // store / use the tokens
  }
});

// Handle the case where the app is already running
const subscription = Linking.addEventListener('url', ({ url }) => {
  const tokens = parseTokensFromUrl(url);
  // store / use the tokens
});
```

> [!NOTE]
> For native and Expo apps, the **code flow is recommended** because the SDK handles the full exchange for you. Use the magic link flow only if your use case specifically requires magic links, and be aware that you are responsible for handling the deep link and securely storing the returned tokens.

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

## Credential Renewal Retry

> **Platform Support:** iOS only.

Automatic retry mechanism for credential renewal to improve reliability in unstable network conditions, particularly important for mobile applications with refresh token rotation enabled.

<a name="credential-renewal-retry-overview"></a>

### Overview

When your application operates on unstable mobile networks, credential renewal requests may fail due to transient network issues. The `maxRetries` configuration option enables automatic retry with exponential backoff for the following error scenarios:

- **Network errors**: Connection timeouts, DNS failures, unreachable hosts
- **Rate limiting**: HTTP 429 (Too Many Requests)
- **Server errors**: HTTP 5xx responses

> **Important:** While the retry mechanism is particularly valuable for refresh token rotation (RRT) scenarios, it can be used to improve credential renewal reliability in any configuration, including non-RRT deployments. The retry logic helps handle transient network failures regardless of your token rotation strategy.

**Example scenario with Refresh Token Rotation:**

1. Request A calls `getCredentials()` and starts a token refresh
2. Request A successfully hits the server and gets new credentials
3. Request A fails on the way back (network issue), never reaching the client
4. The retry mechanism automatically retries the failed request using the same (old) refresh token
5. The retry succeeds within the refresh token rotation overlap window

> **Critical for RRT:** If you have refresh token rotation enabled, you **must** configure a token overlap period of at least **180 seconds (3 minutes)** in your Auth0 tenant. This overlap window allows retries to succeed using the old refresh token before it expires, preventing users from being locked out due to network failures.

<a name="credential-renewal-retry-prerequisites"></a>

### Prerequisites

To use the retry mechanism:

1. **SDK Version**: Requires react-native-auth0 v5.4.0 or later
2. **Scope**: Ensure your authentication requests include the `offline_access` scope to receive refresh tokens

**Additional requirements for Refresh Token Rotation:**

If you have refresh token rotation enabled in your Auth0 tenant:

1. **Token Overlap Period**: Configure an overlap period of at least **180 seconds (3 minutes)** in your Auth0 tenant settings. This is **critical** to ensure retries can succeed using the old refresh token before it expires.

<a name="using-retry-with-hooks"></a>

### Using Retry with Hooks

```jsx
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';

function App() {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      maxRetries={2} // Configure retry mechanism at initialization (iOS only)
    >
      <MyComponent />
    </Auth0Provider>
  );
}

function MyComponent() {
  const { getCredentials } = useAuth0();

  const fetchCredentialsWithRetry = async () => {
    try {
      // The retry mechanism is automatically applied to all credential renewal attempts
      const credentials = await getCredentials();

      console.log('Access Token:', credentials.accessToken);
      // Use credentials for API calls...
    } catch (error) {
      console.error('Failed to get credentials after retries:', error);
      Alert.alert(
        'Error',
        'Unable to refresh credentials. Please log in again.'
      );
    }
  };

  return (
    <View>
      <Button title="Get Credentials" onPress={fetchCredentialsWithRetry} />
    </View>
  );
}
```

<a name="using-retry-with-auth0-class"></a>

### Using Retry with Auth0 Class

```js
import Auth0 from 'react-native-auth0';

// Configure retry mechanism at initialization (iOS only)
const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  maxRetries: 2, // Recommended maximum of 2 retries
});

// Get credentials - retry mechanism is automatically applied
try {
  const credentials = await auth0.credentialsManager.getCredentials();

  console.log('Access Token:', credentials.accessToken);
} catch (error) {
  console.error('Credential renewal failed after retries:', error);
}
```

<a name="credential-renewal-retry-platform-support"></a>

### Platform Support

| Platform    | Support              | Behavior                                                               |
| ----------- | -------------------- | ---------------------------------------------------------------------- |
| **iOS**     | ✅ Full Support      | Uses exponential backoff retry with Auth0.swift v2.14+                 |
| **Android** | ⚠️ Parameter Ignored | Auth0.Android SDK does not currently support retry configuration       |
| **Web**     | ⚠️ Parameter Ignored | @auth0/auth0-spa-js SDK does not currently support retry configuration |

**Default Behavior:**

- `maxRetries` defaults to **0** (no retries) to maintain backward compatibility
- Recommended maximum: **2 retries**
- Each retry uses exponential backoff to avoid overwhelming the server

<a name="credential-renewal-retry-error-handling"></a>

### Error Handling

The retry mechanism only retries on transient, recoverable errors. The following errors will **not** trigger a retry:

- Invalid refresh token
- Refresh token expired
- Refresh token revoked
- Client authentication failures
- Authorization errors (insufficient permissions)

Example with comprehensive error handling:

```jsx
import { useAuth0 } from 'react-native-auth0';

function MyComponent() {
  const { getCredentials, authorize } = useAuth0();

  const fetchCredentials = async () => {
    try {
      const credentials = await getCredentials(
        undefined,
        undefined,
        undefined,
        false,
        2
      );
      return credentials;
    } catch (error) {
      // Check if it's a non-retryable error that requires re-authentication
      if (
        error.code === 'NO_REFRESH_TOKEN' ||
        error.code === 'RENEW_FAILED' ||
        error.message?.includes('refresh token')
      ) {
        console.log('Refresh token invalid, re-authenticating...');
        // Trigger a new login flow
        await authorize({ scope: 'openid profile offline_access' });
      } else {
        console.error('Transient error after retries:', error);
        throw error;
      }
    }
  };

  // ...
}
```

**Best Practices:**

1. **Use moderate retry counts**: Recommended maximum of 2 retries to balance reliability with performance
2. **Configure adequate overlap period**: Ensure your Auth0 tenant has at least 180 seconds token overlap configured
3. **Test on real devices**: Simulate network instability during testing to validate retry behavior

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
import {
  Auth0Provider,
  BiometricPolicy,
  LocalAuthenticationStrategy,
  LocalAuthenticationLevel,
} from 'react-native-auth0';

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
import Auth0, {
  BiometricPolicy,
  LocalAuthenticationStrategy,
  LocalAuthenticationLevel,
} from 'react-native-auth0';

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

    // Or clear with specific scope
    await clearApiCredentials('https://first-api.example.com', 'read:data');
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

// Clear with specific scope
await auth0.credentialsManager.clearApiCredentials(
  'https://first-api.example.com',
  'read:data write:data'
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

## Custom Token Exchange (RFC 8693)

Custom Token Exchange allows you to exchange external identity provider tokens for Auth0 tokens using the [RFC 8693 OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693) specification. This enables scenarios where users authenticate with an external system and that token needs to be exchanged for Auth0 tokens.

> ⚠️ **Important**: The external token must be validated in Auth0 Actions using cryptographic verification. See the [Auth0 Custom Token Exchange documentation](https://auth0.com/docs/authenticate/custom-token-exchange) for setup instructions.

### Using Custom Token Exchange with Hooks

```typescript
import React from 'react';
import { Button, Alert } from 'react-native';
import {
  useAuth0,
  AuthenticationException,
  AuthenticationErrorCodes,
} from 'react-native-auth0';

function TokenExchangeScreen() {
  const { customTokenExchange, user, error } = useAuth0();

  const handleExchange = async () => {
    try {
      // Exchange an external token for Auth0 tokens
      const credentials = await customTokenExchange({
        subjectToken: 'token-from-external-provider',
        subjectTokenType: 'urn:acme:legacy-system-token',
        scope: 'openid profile email',
        audience: 'https://api.example.com',
      });

      Alert.alert('Success', `Logged in as ${user?.name}`);
    } catch (e) {
      if (e instanceof AuthenticationException) {
        switch (e.type) {
          case AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN:
            Alert.alert('Error', 'The external token is invalid or expired');
            break;
          case AuthenticationErrorCodes.UNSUPPORTED_TOKEN_TYPE:
            Alert.alert('Error', 'The token type is not supported');
            break;
          case AuthenticationErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED:
            Alert.alert(
              'Error',
              'Custom Token Exchange is not configured for this tenant'
            );
            break;
          case AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED:
            Alert.alert('Error', 'Token validation failed in Auth0 Action');
            break;
          case AuthenticationErrorCodes.NETWORK_ERROR:
            Alert.alert('Error', 'Network error. Please check your connection.');
            break;
          default:
            Alert.alert('Error', e.message);
        }
      } else {
        console.error('Token exchange failed:', e);
      }
    }
  };

  return <Button onPress={handleExchange} title="Exchange Token" />;
}
```

### Using Custom Token Exchange with Auth0 Class

```typescript
import Auth0, {
  AuthenticationException,
  AuthenticationErrorCodes,
} from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_CLIENT_ID',
});

async function exchangeExternalToken(externalToken: string) {
  try {
    const credentials = await auth0.customTokenExchange({
      subjectToken: externalToken,
      subjectTokenType: 'urn:acme:legacy-system-token',
      audience: 'https://api.example.com',
      scope: 'openid profile email',
    });

    console.log('Exchange successful:', credentials);
    return credentials;
  } catch (error) {
    if (error instanceof AuthenticationException) {
      // Access the underlying error details
      console.error('Error type:', error.type);
      console.error('Error message:', error.message);
      console.error('Underlying error code:', error.underlyingError.code);

      // Handle specific error types
      if (error.type === AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN) {
        // Token is invalid or expired - prompt user to re-authenticate
        throw new Error('Please authenticate again with the external provider');
      }
    }
    throw error;
  }
}
```

### With Organization Context

Exchange tokens within a specific organization context:

```typescript
const credentials = await customTokenExchange({
  subjectToken: 'external-provider-token',
  subjectTokenType: 'urn:acme:legacy-system-token',
  organization: 'org_123', // or organization name
  scope: 'openid profile email',
});
```

### Subject Token Type Requirements

The `subjectTokenType` parameter must be a **unique profile token type URI** starting with `https://` or `urn:`.

#### Valid Token Type Patterns

You control the token type namespace. Use one of these patterns:

**URN Format (Recommended):**

- `urn:yourcompany:token-type` - Company-specific token type
- `urn:acme:legacy-system-token` - Legacy system tokens
- `urn:example:external-idp` - External IdP tokens

**HTTPS URL Format:**

- `https://yourcompany.com/tokens/legacy` - Using your organization's domain
- `https://example.com/custom-token` - Custom token identifier

#### Reserved Namespaces (Forbidden)

The following namespaces are **reserved** and you **CANNOT use them**:

- ❌ `http://auth0.com/*`
- ❌ `https://auth0.com/*`
- ❌ `http://okta.com/*`
- ❌ `https://okta.com/*`
- ❌ `urn:ietf:*`
- ❌ `urn:auth0:*`
- ❌ `urn:okta:*`

#### Common Use Cases

1. **Seamless Migration from Legacy IdP**: Exchange legacy refresh tokens

   ```typescript
   await customTokenExchange({
     subjectToken: legacyRefreshToken,
     subjectTokenType: 'urn:acme:legacy-system-token',
     scope: 'openid profile email offline_access',
   });
   ```

2. **External Authentication Provider**: Exchange tokens from partner IdP

   ```typescript
   await customTokenExchange({
     subjectToken: externalProviderToken,
     subjectTokenType: 'urn:partner:auth-token',
     scope: 'openid profile email',
   });
   ```

3. **Custom JWT Tokens**: Exchange JWTs from your own system
   ```typescript
   await customTokenExchange({
     subjectToken: customJwt,
     subjectTokenType: 'urn:yourcompany:jwt-token',
     audience: 'https://api.example.com',
   });
   ```

### Error Codes Reference

Custom Token Exchange throws `AuthError` with specific error codes for different failure scenarios. Use the `code` property for programmatic error handling:

```typescript
try {
  await auth0.customTokenExchange({...});
} catch (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);

  // Handle specific errors
  if (error.code === 'invalid_grant') {
    // Handle invalid token
  }
}
```

| Error Code                          | Description                                                |
| ----------------------------------- | ---------------------------------------------------------- |
| `custom_token_exchange_failed`      | General token exchange failure                             |
| `invalid_grant`                     | The external token is invalid, malformed, or expired       |
| `invalid_request`                   | The request is missing required parameters or is malformed |
| `unsupported_token_type`            | The token type is not supported or recognized              |
| `unauthorized_client`               | Custom Token Exchange is not enabled for this client       |
| `invalid_target`                    | The requested audience is invalid or not allowed           |
| `invalid_scope`                     | The requested scope is invalid or not allowed              |
| `access_denied`                     | Token exchange was denied by the authorization server      |
| `server_error`                      | The authorization server encountered an internal error     |
| `temporarily_unavailable`           | The server is temporarily unable to handle the request     |
| `network_error`                     | Network connectivity issue occurred                        |
| `a0.token_exchange_failed`          | Auth0-specific token exchange failure                      |
| `a0.action_failed`                  | The token validation in Auth0 Action failed                |
| `a0.invalid_subject_token`          | Subject token validation failed                            |
| `a0.unsupported_subject_token_type` | Subject token type is not supported                        |

These error codes follow:

- **RFC 8693 standard**: `invalid_grant`, `invalid_request`, `unsupported_token_type`, `access_denied`, etc.
- **Auth0-specific codes**: `a0.token_exchange_failed`, `a0.action_failed`, etc.

### Auth0 Actions Validation

Custom Token Exchange requires validation of the subject token in Auth0 Actions. The Action must:

1. **Validate the subject token** cryptographically (verify signature, expiration, issuer, etc.)
2. **Apply authorization policy** to determine if the exchange is allowed
3. **Set the user** using one of the `api.authentication.setUser*()` methods

For detailed examples of validating different token types in Actions, see:

- [Auth0 Custom Token Exchange Documentation](https://auth0.com/docs/authenticate/custom-token-exchange)
- [Example Use Cases](https://auth0.com/docs/authenticate/custom-token-exchange/cte-example-use-cases)

**Security Best Practices:**

- Use asymmetric algorithms (RS256, ES256) whenever possible
- Store secrets in Actions Secrets, never hardcode them
- Cache JWKS keys using `api.cache.set()` to improve performance
- Validate token expiration, issuer, and audience claims
- Implement rate limiting for failed validations using `api.access.rejectInvalidSubjectToken()`

## Passkeys

<a name="passkeys-overview"></a>

### Overview

Passkeys provide a passwordless authentication experience using platform biometrics (Face ID, Touch ID, fingerprint) backed by public-key cryptography. The SDK provides the Auth0 challenge and token exchange steps, while you handle the platform credential manager interaction using native modules or libraries like `react-native-passkey`.

The passkey flow has three steps:

1. **Challenge** — Request a WebAuthn challenge from Auth0 (`passkeySignupChallenge` or `passkeyLoginChallenge`)
2. **Credential Manager** — Present the OS credential manager UI to create or assert a passkey (using your own native module or a library)
3. **Exchange** — Send the credential response back to Auth0 to get tokens (`getTokenByPasskey`)

> **Platform Support:** Native only (iOS 16.6+ / Android). Not supported on Web.

<a name="passkeys-prerequisites"></a>

### Prerequisites

Before using passkeys:

1. **Enable the Passkey Grant Type** for your Auth0 application in the Auth0 Dashboard
2. **Configure a custom domain** on your Auth0 tenant (required for passkeys)
3. **iOS:** Requires iOS 16.6 or later. Add an Associated Domain with the `webcredentials` service pointing to your Auth0 custom domain
4. **Android:** Requires Android API 28+. Configure your app's Digital Asset Links for the Auth0 custom domain

> **Important:** `passkeySignupChallenge` is for creating **new** user accounts with a passkey. It will fail if the email already exists in the database connection. Use `passkeyLoginChallenge` for existing users who have already registered a passkey.

### Signup with Passkey

The signup flow requests a registration challenge from Auth0, then you use the platform credential manager (via a native module or library like `react-native-passkey`) to create a new passkey, and finally exchange the credential for Auth0 tokens.

```tsx
import { useAuth0, PasskeyError } from 'react-native-auth0';

function PasskeySignupScreen() {
  const { passkeySignupChallenge, getTokenByPasskey } = useAuth0();

  const handleSignup = async () => {
    try {
      // Step 1: Get the signup challenge from Auth0
      const challenge = await passkeySignupChallenge({
        email: 'user@example.com',
        name: 'John Doe',
        realm: 'Username-Password-Authentication',
      });

      // Step 2: Use the platform credential manager to create a passkey
      // challenge.authParamsPublicKey contains the WebAuthn PublicKeyCredentialCreationOptions
      // Use your preferred library (e.g., react-native-passkey) or native module
      const credentialJson = await yourCredentialManagerCreate(
        challenge.authParamsPublicKey
      );

      // Step 3: Exchange the credential response for Auth0 tokens
      const credentials = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credentialJson,
        realm: 'Username-Password-Authentication',
        audience: 'https://api.example.com',
        scope: 'openid profile email offline_access',
      });

      console.log('Signed up with passkey:', credentials.accessToken);
    } catch (error) {
      if (error instanceof PasskeyError) {
        console.error('Passkey signup failed:', error.type, error.message);
      }
    }
  };

  return <Button title="Sign Up with Passkey" onPress={handleSignup} />;
}
```

### Signin with Passkey

The login flow requests an assertion challenge from Auth0, then you use the platform credential manager to assert an existing passkey, and finally exchange the credential for Auth0 tokens.

```tsx
import { useAuth0, PasskeyError } from 'react-native-auth0';

function PasskeySigninScreen() {
  const { passkeyLoginChallenge, getTokenByPasskey } = useAuth0();

  const handleSignin = async () => {
    try {
      // Step 1: Get the login challenge from Auth0
      const challenge = await passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
      });

      // Step 2: Use the platform credential manager to assert an existing passkey
      // challenge.authParamsPublicKey contains the WebAuthn PublicKeyCredentialRequestOptions
      // Use your preferred library (e.g., react-native-passkey) or native module
      const credentialJson = await yourCredentialManagerGet(
        challenge.authParamsPublicKey
      );

      // Step 3: Exchange the credential response for Auth0 tokens
      const credentials = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credentialJson,
        realm: 'Username-Password-Authentication',
        audience: 'https://api.example.com',
        scope: 'openid profile email offline_access',
      });

      console.log('Signed in with passkey:', credentials.accessToken);
    } catch (error) {
      if (error instanceof PasskeyError) {
        console.error('Passkey signin failed:', error.type, error.message);
      }
    }
  };

  return <Button title="Sign In with Passkey" onPress={handleSignin} />;
}
```

### Auth Response Format

The `authResponse` parameter passed to `getTokenByPasskey` must be a JSON string representing the [PublicKeyCredential](https://www.w3.org/TR/webauthn-2/#publickeycredential) response from the platform credential manager.

**For registration (signup):**

```json
{
  "id": "<base64url-encoded credential ID>",
  "rawId": "<base64url-encoded credential ID>",
  "type": "public-key",
  "response": {
    "clientDataJSON": "<base64url-encoded>",
    "attestationObject": "<base64url-encoded>"
  },
  "authenticatorAttachment": "platform"
}
```

**For assertion (login):**

```json
{
  "id": "<base64url-encoded credential ID>",
  "rawId": "<base64url-encoded credential ID>",
  "type": "public-key",
  "response": {
    "clientDataJSON": "<base64url-encoded>",
    "authenticatorData": "<base64url-encoded>",
    "signature": "<base64url-encoded>",
    "userHandle": "<base64url-encoded>"
  },
  "authenticatorAttachment": "platform"
}
```

### Using Passkeys with Auth0 Class

```typescript
import Auth0, { PasskeyError } from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// Signup flow
const signupChallenge = await auth0.passkeySignupChallenge({
  email: 'user@example.com',
  name: 'John Doe',
  realm: 'Username-Password-Authentication',
});

// Use your credential manager library to create the passkey
// signupChallenge.authParamsPublicKey has the WebAuthn creation options
const registrationJson = await yourCredentialManagerCreate(
  signupChallenge.authParamsPublicKey
);

const signupCredentials = await auth0.getTokenByPasskey({
  authSession: signupChallenge.authSession,
  authResponse: registrationJson,
  realm: 'Username-Password-Authentication',
});

// Login flow
const loginChallenge = await auth0.passkeyLoginChallenge({
  realm: 'Username-Password-Authentication',
});

// Use your credential manager library to assert the passkey
// loginChallenge.authParamsPublicKey has the WebAuthn request options
const assertionJson = await yourCredentialManagerGet(
  loginChallenge.authParamsPublicKey
);

const loginCredentials = await auth0.getTokenByPasskey({
  authSession: loginChallenge.authSession,
  authResponse: assertionJson,
  realm: 'Username-Password-Authentication',
});
```

### Signup Challenge Parameters

The `passkeySignupChallenge` method accepts the following parameters to create a user profile along with the passkey:

| Parameter      | Type                      | Description                          |
| -------------- | ------------------------- | ------------------------------------ |
| `email`        | `string?`                 | User's email address                 |
| `phoneNumber`  | `string?`                 | User's phone number                  |
| `username`     | `string?`                 | Username                             |
| `name`         | `string?`                 | Full name                            |
| `givenName`    | `string?`                 | First/given name                     |
| `familyName`   | `string?`                 | Last/family name                     |
| `nickname`     | `string?`                 | Nickname                             |
| `picture`      | `string?`                 | Profile picture URL                  |
| `userMetadata` | `Record<string, string>?` | Custom user metadata key-value pairs |
| `realm`        | `string?`                 | Database connection name             |
| `organization` | `string?`                 | Auth0 organization ID                |

<a name="passkeys-error-handling"></a>

### Error Handling

Passkey operations throw `PasskeyError` (extends `AuthError`) with a normalized `type` property. Use `PasskeyErrorCodes` for type-safe error handling:

| Error Code                     | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| `PASSKEY_CHALLENGE_FAILED`     | Auth0 challenge request failed                      |
| `PASSKEY_EXCHANGE_FAILED`      | Token exchange with credential response failed      |
| `PASSKEY_NOT_AVAILABLE`        | Passkeys not available on this device or OS version |
| `PASSKEY_UNSUPPORTED_PLATFORM` | Passkeys not supported on this platform (Web)       |
| `PASSKEY_UNKNOWN_ERROR`        | Unknown or uncategorized passkey error              |

```typescript
import { PasskeyError, PasskeyErrorCodes } from 'react-native-auth0';

try {
  const challenge = await auth0.passkeyLoginChallenge({
    realm: 'Username-Password-Authentication',
  });
} catch (error) {
  if (error instanceof PasskeyError) {
    console.log('Error type:', error.type); // e.g. "PASSKEY_CHALLENGE_FAILED"
    console.log('Error message:', error.message);
    console.log('Error code:', error.code); // Raw native error code
  }
}
```

<a name="passkeys-platform-support"></a>

### Platform Support

| Platform    | Support          | Requirements                                              |
| ----------- | ---------------- | --------------------------------------------------------- |
| **iOS**     | ✅ Supported     | iOS 16.6+, Associated Domains with `webcredentials`       |
| **Android** | ✅ Supported     | Android API 28+, Digital Asset Links configured           |
| **Web**     | ❌ Not Supported | Throws `PasskeyError` with `PASSKEY_UNSUPPORTED_PLATFORM` |

> **Note:** Passkeys require a real device for the full flow. Simulators/emulators may have limited support.

## My Account API

### Overview

The My Account API allows authenticated users to manage their own authentication methods (passkeys, phone, email, TOTP, push notifications, recovery codes). It provides endpoints for enrolling new factors, confirming enrollments with OTP, listing/updating/deleting authentication methods, and querying available factors.

Access the My Account client via the `myAccount` property from `useAuth0()` or the `Auth0` class instance.

### Prerequisites

- A [custom domain](https://auth0.com/docs/customize/custom-domains) must be configured on your Auth0 tenant
- **iOS**: Associated Domains entitlement must be configured with `webcredentials:<your-custom-domain>` for passkey support
- **Android**: App Links must be set up with your custom domain via an `assetlinks.json` file for passkey support
- The user must be authenticated
- An access token with the appropriate My Account API scopes is required:
  - `read:me:authentication_methods`
  - `create:me:authentication_methods`
  - `update:me:authentication_methods`
  - `delete:me:authentication_methods`
  - `read:me:factors`

Use `getApiCredentials` with the `https://<domain>/me/` audience to obtain a scoped token:

```typescript
const credentials = await getApiCredentials(
  `https://${domain}/me/`,
  'read:me:authentication_methods create:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors'
);
const accessToken = credentials.accessToken;
```

### Passkey Enrollment

Passkey enrollment is a two-step process: request a challenge, then verify with the credential response.

```typescript
import { useAuth0 } from 'react-native-auth0';
import { createPasskey } from './PasskeyModule'; // Your native passkey module

const { myAccount, getApiCredentials } = useAuth0();

// Step 1: Request the enrollment challenge
const accessToken = (await getApiCredentials(`https://${domain}/me/`, scopes))
  .accessToken;
const challenge = await myAccount.passkeyEnrollmentChallenge({ accessToken });

// Step 2: Create a passkey using the platform credential manager
const credentialJson = await createPasskey(challenge.authParamsPublicKey);

// Step 3: Verify the enrollment
const method = await myAccount.enrollPasskey({
  accessToken,
  authenticationMethodId: challenge.authenticationMethodId,
  authSession: challenge.authSession,
  authResponse: credentialJson,
  authParamsPublicKey: challenge.authParamsPublicKey,
});

console.log('Enrolled passkey:', method.id, method.keyId);
```

### Phone Enrollment

```typescript
import { PreferredAuthenticationMethods } from 'react-native-auth0';

const { myAccount } = useAuth0();

// Step 1: Enroll the phone number (sends OTP)
const challenge = await myAccount.enrollPhone({
  accessToken,
  phoneNumber: '+1234567890',
  preferredAuthenticationMethod: PreferredAuthenticationMethods.SMS, // or VOICE
});

// Step 2: Confirm with OTP
const method = await myAccount.confirmPhoneEnrollment({
  accessToken,
  id: challenge.id,
  authSession: challenge.authSession,
  otpCode: '123456',
});
```

### Email Enrollment

```typescript
// Step 1: Enroll the email (sends OTP)
const challenge = await myAccount.enrollEmail({
  accessToken,
  emailAddress: 'user@example.com',
});

// Step 2: Confirm with OTP
const method = await myAccount.confirmEmailEnrollment({
  accessToken,
  id: challenge.id,
  authSession: challenge.authSession,
  otpCode: '123456',
});
```

### TOTP Enrollment

```typescript
// Step 1: Enroll TOTP (returns QR code / manual code)
const challenge = await myAccount.enrollTOTP({ accessToken });
// Display challenge.barcodeUri as a QR code, or show challenge.manualInputCode

// Step 2: Confirm with OTP from authenticator app
const method = await myAccount.confirmTOTPEnrollment({
  accessToken,
  id: challenge.id,
  authSession: challenge.authSession,
  otpCode: '123456',
});
```

### Recovery Code Enrollment

```typescript
// Step 1: Enroll recovery code
const challenge = await myAccount.enrollRecoveryCode({ accessToken });
// Store challenge.recoveryCode securely

// Step 2: Confirm enrollment
const method = await myAccount.confirmRecoveryCodeEnrollment({
  accessToken,
  id: challenge.id,
  authSession: challenge.authSession,
});
```

### Managing Authentication Methods

```typescript
import { AuthenticationMethodTypes } from 'react-native-auth0';

// List all methods
const methods = await myAccount.getAuthenticationMethods({ accessToken });

// List only passkey methods
const passkeys = await myAccount.getAuthenticationMethods({
  accessToken,
  type: AuthenticationMethodTypes.PASSKEY,
});

// Get a specific method
const method = await myAccount.getAuthenticationMethodById({
  accessToken,
  id: 'authentication-method-id',
});

// Update a method name
const updated = await myAccount.updateAuthenticationMethodById({
  accessToken,
  id: 'authentication-method-id',
  name: 'My Work Phone',
});

// Delete a method
await myAccount.deleteAuthenticationMethodById({
  accessToken,
  id: 'authentication-method-id',
});
```

### Getting Available Factors

```typescript
const factors = await myAccount.getFactors({ accessToken });
// Returns available factor types (e.g., sms, email, totp, push-notification, webauthn-platform)
```

### Error Handling

```typescript
import { MyAccountError, MyAccountErrorCodes, PasskeyError, PasskeyErrorCodes } from 'react-native-auth0';

try {
  await myAccount.enrollPasskey({ ... });
} catch (e) {
  if (e instanceof PasskeyError) {
    switch (e.type) {
      case PasskeyErrorCodes.NOT_AVAILABLE:
        // Passkeys not supported on this device
        break;
      default:
        console.error(`Passkey error: [${e.type}] ${e.message}`);
    }
  } else if (e instanceof MyAccountError) {
    switch (e.type) {
      case MyAccountErrorCodes.ENROLLMENT_FAILED:
        // Enrollment failed
        break;
      case MyAccountErrorCodes.VERIFICATION_FAILED:
        // OTP verification failed
        break;
      case MyAccountErrorCodes.UNAUTHORIZED:
        // Token expired or insufficient scopes
        break;
      default:
        console.error(`My Account error: [${e.type}] ${e.message}`);
    }
  }
}
```

### Platform Support

| Platform    | Support          | Notes                                                     |
| ----------- | ---------------- | --------------------------------------------------------- |
| **iOS**     | ✅ Supported     | Passkey enrollment requires iOS 16.6+                     |
| **Android** | ✅ Supported     | Passkey enrollment requires Android API 28+               |
| **Web**     | ❌ Not Supported | Throws `PasskeyError` with `PASSKEY_UNSUPPORTED_PLATFORM` |

## Native to Web SSO

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

### SSO Exchange via Authentication API

If your app manages tokens independently (without using the Credentials Manager), you can use `auth.ssoExchange()` to exchange a refresh token for a session transfer token directly via the Authentication API.

This is useful when:

- Your app stores tokens outside of the built-in Credentials Manager
- You need more control over the token exchange process
- You want to perform the exchange as a standalone API call

> **Note:** This method is only available on native platforms (iOS/Android). It is not supported on the web platform.

#### Using SSO Exchange with Hooks

```js
import { useAuth0 } from 'react-native-auth0';
import { Linking } from 'react-native';

function SSOExchangeScreen() {
  const { ssoExchange } = useAuth0();

  const handleSSOExchange = async (refreshToken) => {
    try {
      const ssoCredentials = await ssoExchange({ refreshToken });

      console.log('Session Transfer Token:', ssoCredentials.sessionTransferToken);
      console.log('Token Type:', ssoCredentials.tokenType);
      console.log('Expires In:', ssoCredentials.expiresIn);

      // Open your web application with the session transfer token
      const webAppUrl = `https://your-web-app.com/login?session_transfer_token=${ssoCredentials.sessionTransferToken}`;
      await Linking.openURL(webAppUrl);
    } catch (error) {
      console.error('SSO Exchange failed:', error);
    }
  };

  return (
    // Your UI components
  );
}
```

#### Using SSO Exchange with Auth0 Class

```js
import Auth0 from 'react-native-auth0';
import { Linking } from 'react-native';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// You must already have a refresh token (e.g., from a previous login with offline_access scope)
const refreshToken = 'YOUR_REFRESH_TOKEN';

// Exchange the refresh token for a session transfer token
const ssoCredentials = await auth0.auth.ssoExchange({ refreshToken });

console.log('Session Transfer Token:', ssoCredentials.sessionTransferToken);
console.log('Token Type:', ssoCredentials.tokenType);
console.log('Expires In:', ssoCredentials.expiresIn);

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

#### Switching tenants at runtime

The configuration above is **build-time** setup: it registers the redirect callback for every domain you intend to use. Switching the _active_ tenant while the app is running is done in JavaScript by changing the `domain`/`clientId` you pass to the SDK.

When you change an identity-defining prop on `Auth0Provider` — `domain`, `clientId`, `localAuthenticationOptions`, `timeout`, or `useDPoP` — the provider rebuilds its underlying client so subsequent calls target the newly selected configuration. An unchanged config (or a change limited to options like `headers` or `maxRetries`) reuses the same client instance. Keep the props in state and update them to switch:

```jsx
import React, { useState } from 'react';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';

const TENANTS = [
  { domain: 'tenant-a.us.auth0.com', clientId: 'CLIENT_ID_A' },
  { domain: 'tenant-b.us.auth0.com', clientId: 'CLIENT_ID_B' },
];

const App = () => {
  const [index, setIndex] = useState(0);
  const tenant = TENANTS[index];

  return (
    // Changing domain/clientId recreates the client for the new tenant.
    <Auth0Provider domain={tenant.domain} clientId={tenant.clientId}>
      <Button
        title="Switch Tenant"
        onPress={() => setIndex((i) => (i + 1) % TENANTS.length)}
      />
      <LoginScreen />
    </Auth0Provider>
  );
};
```

After switching, the next `authorize()` call opens the login page for the newly selected tenant and the redirect resolves correctly, provided that tenant's domain/scheme was registered using the build-time configuration shown above.

> Note: Switching tenants does not immediately clear the displayed auth state. The provider re-runs its initialization for the new tenant and updates `user` once that check completes, so the previously shown user may briefly remain until then.
>
> **Important — credentials are shared across tenants by default.** The native credentials store (Android `SharedPreferences`, iOS Keychain) is **not** keyed by `domain`/`clientId`. With no extra configuration, every client reads and writes the **same** store, so after switching tenants `getCredentials()` / `hasValidCredentials()` return whatever was saved last — i.e. the _previous_ tenant's session — and a fresh login on the new tenant overwrites it. To give each tenant its own isolated store, set [`credentialsManagerStorageKey`](#isolating-credentials-per-tenant-credentialsmanagerstoragekey) (below).

If you are using the `Auth0` class directly instead of the hooks, simply create (or reuse) an instance per tenant and call the one matching the active tenant:

```js
import Auth0 from 'react-native-auth0';

const clients = {
  tenantA: new Auth0({
    domain: 'tenant-a.us.auth0.com',
    clientId: 'CLIENT_ID_A',
  }),
  tenantB: new Auth0({
    domain: 'tenant-b.us.auth0.com',
    clientId: 'CLIENT_ID_B',
  }),
};

// Use whichever client corresponds to the active tenant.
const credentials = await clients[activeTenant].webAuth.authorize();
```

#### Isolating credentials per tenant (`credentialsManagerStorageKey`)

By default all clients share a single native credentials store, so credentials from one tenant are visible to another after a switch (see the important note above). To keep each tenant's session separate, pass a unique `credentialsManagerStorageKey`. It maps to the **Android `SharedPreferences` file name** and the **iOS Keychain service**, so a distinct value gives that client its own physically separate store for `saveCredentials` / `getCredentials` / `hasValidCredentials` / `clearCredentials`.

```jsx
const TENANTS = [
  // No key → uses the default shared store (keeps any existing logged-in user).
  { domain: 'tenant-a.us.auth0.com', clientId: 'CLIENT_ID_A' },
  // Distinct key → isolated store for this tenant.
  {
    domain: 'tenant-b.us.auth0.com',
    clientId: 'CLIENT_ID_B',
    credentialsManagerStorageKey: 'tenant-b',
  },
];

// Hooks: pass it as a prop. Changing it rebuilds the client.
<Auth0Provider
  domain={tenant.domain}
  clientId={tenant.clientId}
  credentialsManagerStorageKey={tenant.credentialsManagerStorageKey}
>
  <LoginScreen />
</Auth0Provider>;
```

```js
// Auth0 class: pass it in the constructor options.
const auth0 = new Auth0({
  domain: 'tenant-b.us.auth0.com',
  clientId: 'CLIENT_ID_B',
  credentialsManagerStorageKey: 'tenant-b',
});
```

With the keys above, logging in to Tenant A and switching to Tenant B no longer surfaces Tenant A's credentials, and each tenant's login persists independently. Switching back to Tenant A restores its session without re-login.

**Recommended usage**

- Leave the **primary/default** tenant **without** a key so existing installs keep using the store they already wrote to — those users are not logged out on upgrade.
- Give every **additional** tenant a **unique, stable** key (e.g. the tenant slug or client ID).
- Treat the key as permanent: it is the address of the store, not data inside it.

**When does this make existing users log in again?**

There is **no automatic migration** between stores — a client only ever reads the store its key points to. Changing which store a client uses therefore makes it start from an _empty_ store, requiring a fresh login:

| Scenario                                                                                  | Existing logged-in user re-login required?                                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Upgrade to this version, **no** `credentialsManagerStorageKey` set anywhere               | **No** — still the default shared store.                                                      |
| Add a key to a client that previously had **none** (e.g. you now key your primary tenant) | **Yes** — its old session lives in the default store, which the keyed client no longer reads. |
| **Change** an existing key to a different value                                           | **Yes** — points at a different (empty) store.                                                |
| **Remove** a key that was previously set                                                  | **Yes** — falls back to the default store, not the keyed one.                                 |
| Add a **new** tenant with its **own new** key (others unchanged)                          | **No** for the others; the new tenant simply starts logged out.                               |

> Because changing or removing a key strands the credentials saved under the old key, choose each tenant's key once and keep it stable across releases. If you must change it, call `clearCredentials()` on the old configuration first (or accept that those credentials become orphaned in the old store).

## Allowed Browsers (Android)

On Android, some browsers do not correctly handle App Link redirects. For example, Firefox renders the callback URL as a web page instead of handing the redirect back to your app, causing the authentication flow to fail silently.

You can restrict which browsers are allowed to handle the web authentication flow by passing `allowedBrowserPackages` in the options object. When set, only browsers whose package names appear in the list will be used.

**Behaviour:**

- If the user's default browser is in the list, it is used.
- If the user's default browser is not in the list but another allowed browser is installed, that browser is used instead.
- If no allowed browser is installed, an `a0.browser_not_available` error is returned.

> **Platform Support:** Android only. This option is ignored on iOS.

### Using with Hooks

```typescript
import { useAuth0 } from 'react-native-auth0';

const { authorize } = useAuth0();

await authorize(
  { scope: 'openid profile email' },
  {
    allowedBrowserPackages: [
      'com.android.chrome',
      'com.chrome.beta',
      'com.microsoft.emmx', // Edge
      'com.brave.browser',
      'com.sec.android.app.sbrowser', // Samsung Internet
    ],
  }
);
```

### Using with Auth0 Class

```typescript
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

await auth0.webAuth.authorize(
  { scope: 'openid profile email' },
  {
    allowedBrowserPackages: [
      'com.android.chrome',
      'com.chrome.beta',
      'com.microsoft.emmx', // Edge
      'com.brave.browser',
      'com.sec.android.app.sbrowser', // Samsung Internet
    ],
  }
);
```

The same `allowedBrowserPackages` option is also accepted by `clearSession` to restrict which browser handles the logout flow.

## Recovering Login After Process Death (Android)

On Android, the OS can kill your app's process while the user is completing login in the browser — this is common on devices with aggressive memory management (e.g. Samsung One UI, Xiaomi MIUI), especially during MFA when the user switches apps to fetch a code. When the user finishes and the browser redirects back, the app cold-starts and, without recovery, the in-flight login is lost and the user lands back on the login screen.

`resumeSession()` recovers that login. The underlying native SDK finishes the token exchange after the process restarts and buffers the result; calling `resumeSession()` once on cold start drains it and returns the recovered `Credentials` (or `null` if there was nothing to recover).

> This is an Android-only concern. On iOS and web `resumeSession()` is a no-op that resolves with `null`, so it is safe to call unconditionally. It requires `react-native-auth0` bundling Auth0.Android 3.19.0+ (included). No native `MainActivity` changes are needed, so it works the same in bare React Native and Expo.

### Recovering Login Using Hooks

Call `resumeSession()` once when your app mounts. If it returns credentials, the hook updates the auth state and persists them automatically, so `user` becomes populated.

```js
import { useEffect } from 'react';
import { useAuth0 } from 'react-native-auth0';

const App = () => {
  const { resumeSession } = useAuth0();

  useEffect(() => {
    resumeSession()
      .then((credentials) => {
        if (credentials) {
          // A login interrupted by process death was recovered.
          console.log('Recovered session', credentials.accessToken);
        }
      })
      .catch((error) => {
        console.log('Failed to recover session', error);
      });
  }, [resumeSession]);

  // ...
};
```

### Recovering Login Using the Auth0 Class

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_AUTH0_DOMAIN',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
});

// Call once on cold start, before showing the login screen.
const credentials = await auth0.webAuth.resumeSession();
if (credentials) {
  await auth0.credentialsManager.saveCredentials(credentials);
  // The user is logged in — route them into the app.
}
```

## DPoP (Demonstrating Proof-of-Possession)

[DPoP](https://datatracker.ietf.org/doc/html/rfc9449) (Demonstrating Proof-of-Possession) is an OAuth 2.0 extension that cryptographically binds access and refresh tokens to a client-specific key pair. This prevents token theft and replay attacks by ensuring that even if a token is intercepted, it cannot be used from a different device.

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
