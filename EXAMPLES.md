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
- [Management API (Users)](#management-api-users)
  - [Patch user with user_metadata](#patch-user-with-user_metadata)
  - [Get full user profile](#get-full-user-profile)
- [Organizations](#organizations)
  - [Log in to an organization](#log-in-to-an-organization)
  - [Accept user invitations](#accept-user-invitations)
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
  login_hint: email,
  screen_hint: 'signup', // 👈🏻
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
