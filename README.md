# react-native-auth0

React Native toolkit for Auth0 API, compliant with [RFC 8252](https://tools.ietf.org/html/rfc8252)

[![Build Status][circleci-image]][circleci-url]
[![NPM version][npm-image]][npm-url]
[![Coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fauth0%2Freact-native-auth0.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fauth0%2Freact-native-auth0?ref=badge_shield)

## Important Notices

Version **2.9.0** introduced a **breaking change** to the Android configuration. Previously it was required to add an intent filter in the definition of the Activity that receives the authentication result, and to use the `singleTask` **launchMode** in that activity. Now both the intent filter and the launch mode **must be removed** and instead you need to add a couple of manifest placeholders. Check out the [Android](#android) section for more details.

## Table of Contents

- [Documentation](#documentation)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Support + Feedback](#support--feedback)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Thank You](#thank-you)
- [What is Auth0](#what-is-auth0)
- [License](#license)

## Documentation

- The [React Native Quickstart](https://auth0.com/docs/quickstart/native/react-native) shows how to get an iOS or Android app running from scratch.
- The [React Native Sample](https://github.com/auth0-samples/auth0-react-native-sample/tree/master/00-Login) has complete, running iOS and Android applications you can try.
- The [Usage](#usage) section below covers specific use cases outside of basic authentication.
- The [API documentation](https://auth0.github.io/react-native-auth0/) is generated from the code and explains all methods that are able to be used.

## Requirements

This SDK targets apps that are using React Native SDK version `0.60.5` and up. If you're using an older React Native version, see the compatibility matrix below.

### Compatibility Matrix

This SDK attempts to follow [semver](https://semver.org/) in a best-effort basis, but React Native is still making releases that eventually include breaking changes on it making this approach difficult for any React Native library module. Use the table below to find the version that best suites your application.

| React Native SDK | Auth0 SDK |
| :--------------: | :-------: |
|     v0.62.2      |  v2.5.0   |
|     v0.60.5      |  v2.0.0   |
| v0.59.0 or lower |  v1.6.0   |

The contents of previous release can be found on the [branch v1](https://github.com/auth0/react-native-auth0/tree/v1).

## Getting Started

First install the native library module:

### With [npm](https://www.npmjs.com)

`$ npm install react-native-auth0 --save`

### With [Yarn](https://yarnpkg.com/en/)

`$ yarn add react-native-auth0`

Then, you need to run the following command to install the ios app pods with Cocoapods. That will auto-link the iOS library:

`$ cd ios && pod install`

### Configuration

You need make your Android and iOS applications aware that an authentication result will be received from the browser. This SDK makes use of the Android's Package Name and its analogous iOS's Product Bundle Identifier to generate the redirect URL. Each platform has its own set of instructions.

#### Android

> Before version 2.9.0, this SDK required you to add an intent filter to the Activity on which you're going to receive the authentication result, and to use the `singleTask` **launchMode** in that activity. To migrate your app to version 2.9.0+, **remove both** and continue with the instructions below.
> You can also check out a sample migration diff [here](https://github.com/auth0-samples/auth0-react-native-sample/commit/69f79c83ceed40f44b239bbd16e79ecaa70ef70a).

Open your app's `build.gradle` file (typically at `android/app/build.gradle`) and add the following manifest placeholders:

```groovy
android {
    defaultConfig {
        // Add the next line
        manifestPlaceholders = [auth0Domain: "YOUR_AUTH0_DOMAIN", auth0Scheme: "${applicationId}"]
    }
    ...
}
```

The `auth0Domain` value must be replaced with your Auth0 domain value. So if you have `samples.auth0.com` as your Auth0 domain you would have a configuration like the following:

```groovy
android {
    defaultConfig {
        manifestPlaceholders = [auth0Domain: "samples.auth0.com", auth0Scheme: "${applicationId}"]
    }
    ...
}
```

The `applicationId` value will be auto-replaced at runtime with the package name or ID of your application (e.g. `com.example.app`). You can change this value from the `build.gradle` file. You can also check it at the top of your `AndroidManifest.xml` file.

> Note that if your Android application is using [product flavors](https://developer.android.com/studio/build/build-variants#product-flavors), you might need to specify different manifest placeholders for each flavor.

If you use a value other than `applicationId` in `auth0Scheme` you will also need to pass it as the `customScheme` option parameter of the `authorize` and `clearSession` methods.

Take note of this value as you'll be requiring it to define the callback URLs below.

> For more info please read the [React Native docs](https://facebook.github.io/react-native/docs/linking.html).

##### Skipping the Web Authentication setup

If you don't plan to use Web Authentication, you will notice that the compiler will still prompt you to provide the `manifestPlaceholders` values, since the `RedirectActivity` included in this library will require them, and the Gradle tasks won't be able to run without them.

Re-declare the activity manually with `tools:node="remove"` in your app's Android Manifest in order to make the manifest merger remove it from the final manifest file. Additionally, one more unused activity can be removed from the final APK by using the same process. A complete snippet to achieve this is:

```xml
<activity
    android:name="com.auth0.react.AuthenticationActivity"
    tools:node="remove"/>
<!-- Optional: Remove RedirectActivity -->
<activity
    android:name="com.auth0.react.RedirectActivity"
    tools:node="remove"/>
```

#### iOS

Inside the `ios` folder find the file `AppDelegate.[swift|m]` add the following to it:

```objc
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  return [RCTLinkingManager application:app openURL:url options:options];
}
```

Inside the `ios` folder open the `Info.plist` and locate the value for `CFBundleIdentifier`, e.g.

```xml
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
```

and then below it register a URL type entry using the value of `CFBundleIdentifier` as the value for `CFBundleURLSchemes`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>None</string>
        <key>CFBundleURLName</key>
        <string>auth0</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        </array>
    </dict>
</array>
```

If your application is generated using the React Native CLI, the default value of `$(PRODUCT_BUNDLE_IDENTIFIER)` matches `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)`. Take note of this value as you'll be requiring it to define the callback URLs below. If desired, you can change its value using XCode in the following way:

- Open the `ios/TestApp.xcodeproj` file replacing 'TestApp' with the name of your app or run `xed ios` from a Terminal.
- Open your project's or desired target's **Build Settings** tab and on the search bar at the right type "Product Bundle Identifier".
- Replace the **Product Bundle Identifier** value with your desired application's bundle identifier name (e.g. `com.example.app`).
- If you've changed the project wide settings, make sure the same were applied to each of the targets your app has.

If you use a value other than `$(PRODUCT_BUNDLE_IDENTIFIER)` in the `CFBundleURLSchemes` field of the `Info.plist` you will also need to pass it as the `customScheme` option parameter of the `authorize` and `clearSession` methods.

> For more info please read the [React Native docs](https://facebook.github.io/react-native/docs/linking.html).

### Callback URL(s)

Callback URLs are the URLs that Auth0 invokes after the authentication process. Auth0 routes your application back to this URL and appends additional parameters to it, including a token. Since callback URLs can be manipulated, you will need to add this URL to your Application's **Allowed Callback URLs** for security. This will enable Auth0 to recognize these URLs as valid. If omitted, authentication will not be successful.

On the Android platform this URL is case-sensitive. Because of that, this SDK will auto convert the Bundle Identifier (iOS) and Application ID (Android) values to lowercase in order to build the Callback URL with them. If any of these values contains uppercase characters a warning message will be printed in the console. Make sure to check that the right Callback URL is whitelisted in the Auth0 dashboard or the browser will not route succesfully back to your application.

Go to the [Auth0 Dashboard](https://manage.auth0.com/#/applications), select your application and make sure that **Allowed Callback URLs** contains the URLs defined below.

If in addition you plan to use the log out method, you must also add these URLs to the **Allowed Logout URLs**.

#### Android

```text
{YOUR_APP_PACKAGE_NAME_OR_CUSTOM_SCHEME}://{YOUR_AUTH0_DOMAIN}/android/{YOUR_APP_PACKAGE_NAME}/callback
```

> Make sure to replace {YOUR_APP_PACKAGE_NAME_OR_CUSTOM_SCHEME} and {YOUR_AUTH0_DOMAIN} with the actual values for your application.

#### iOS

```text
{YOUR_BUNDLE_IDENTIFIER_OR_CUSTOM_SCHEME}://{YOUR_AUTH0_DOMAIN}/ios/{YOUR_BUNDLE_IDENTIFIER}/callback
```

> Make sure to replace {YOUR_BUNDLE_IDENTIFIER_OR_CUSTOM_SCHEME} and {YOUR_AUTH0_DOMAIN} with the actual values for your application.

## Usage

Create a new instance of the client using the Auth0 domain and client ID values from your Application's [dashboard page](https://manage.auth0.com/).

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: '{YOUR_AUTH0_DOMAIN}',
  clientId: '{YOUR_CLIENT_ID}',
});
```

> This SDK is OIDC compliant. To ensure OIDC compliant responses from the Auth0 servers enable the **OIDC Conformant** switch in your Auth0 dashboard under `Application / Settings / Advanced OAuth`. For more information please check [this documentation](https://auth0.com/docs/api-auth/intro#how-to-use-the-new-flows).

### Web Authentication

#### Login

```js
auth0.webAuth
  .authorize({scope: 'openid email profile'})
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```

> Web Authentication flows require a Browser application installed on the device. When no Browser is available, an error of type `a0.browser_not_available` will be raised via the provided callback.

##### Disable Single Sign On (iOS 13+ only)

Use the `ephemeralSession` parameter to disable SSO on iOS 13+. This way iOS will not display the consent popup that otherwise shows up when SSO is enabled. It has no effect on older versions of iOS or Android.

```js
auth0.webAuth
  .authorize({scope: 'openid email profile'}, {ephemeralSession: true})
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```

#### Logout

```js
auth0.webAuth.clearSession().catch(error => console.log(error));
```

If you're using the `ephemeralSession` parameter, you do not need to call `clearSession()` to perform logout on iOS, as there will be no cookies to remove. Just deleting the credentials will suffice. You will still need to call `clearSession()` on Android, though, as `ephemeralSession` is iOS-only.

### Authentication API

### Important: Database Connection Authentication

Since June 2017 new Clients no longer have the **Password Grant Type** enabled by default.
If you are accessing a Database Connection using `passwordRealm` then you will need to enable the Password Grant Type, please follow [this guide](https://auth0.com/docs/clients/client-grant-types#how-to-edit-the-client-grant_types-property).

#### Login with Password Realm Grant

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

#### Get user information using user's access_token

```js
auth0.auth
  .userInfo({token: 'the user access_token'})
  .then(console.log)
  .catch(console.error);
```

This endpoint requires an Access Token that was granted the `/userinfo` audience. Check that the authentication request that returned the Access Token included an audience value of `https://{YOUR_AUTH0_DOMAIN}.auth0.com/userinfo`.

#### Getting new access token with refresh token

```js
auth0.auth
  .refreshToken({refreshToken: 'the user refresh_token'})
  .then(console.log)
  .catch(console.error);
```

#### Login with Passwordless

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
    phoneNumber: 'info@auth0.com',
    code: '123456',
  })
  .then(console.log)
  .catch(console.error);
```

#### Create user in database connection

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

### Management API (Users)

#### Patch user with user_metadata

```js
auth0
  .users('the user access_token')
  .patchUser({id: 'user_id', metadata: {first_name: 'John', last_name: 'Doe'}})
  .then(console.log)
  .catch(console.error);
```

### Get full user profile

```js
auth0
  .users('the user access_token')
  .getUser({id: 'user_id'})
  .then(console.log)
  .catch(console.error);
```

For more info please check our generated [documentation](https://auth0.github.io/react-native-auth0/index.html)

### Organizations

[Organizations](https://auth0.com/docs/organizations) is a set of features that provide better support for developers who build and maintain SaaS and Business-to-Business (B2B) applications.

Using Organizations, you can:

- Represent teams, business customers, partner companies, or any logical grouping of users that should have different ways of accessing your applications, as organizations.
- Manage their membership in a variety of ways, including user invitation.
- Configure branded, federated login flows for each organization.
- Implement role-based access control, such that users can have different roles when authenticating in the context of different organizations.
- Build administration capabilities into your products, using Organizations APIs, so that those businesses can manage their own organizations.

Note that Organizations is currently only available to customers on our Enterprise and Startup subscription plans.

#### Log in to an organization

```js
auth0.webAuth
  .authorize({organization: 'organization-id'})
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```

#### Accept user invitations

Users can be invited to your organization via a link. Tapping on the invitation link should open your app. Since invitations links are `https` only, is recommended that your Android app supports [Android App Links](https://developer.android.com/training/app-links). In the case of iOS, your app must support [Universal Links](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/supporting_universal_links_in_your_app).

In [Enable Android App Links Support](https://auth0.com/docs/applications/enable-android-app-links-support) and [Enable Universal Links Support](https://auth0.com/docs/enable-universal-links-support-in-apple-xcode), you will find how to make the Auth0 server publish the Digital Asset Links file required by your applications.

When your app gets opened by an invitation link, grab the invitation URL and pass it as a parameter to the webauth call. Use the [Linking Module](https://reactnative.dev/docs/linking) method called `getInitialUrl()` to obtain the URL that launched your application.

```js
auth0.webAuth
  .authorize({
    invitationUrl:
      'https://myapp.com/login?invitation=inv123&organization=org123',
  })
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```

If the URL doesn't contain the expected values, an error will be raised through the provided callback.

### Bot Protection

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
  .then(credentials => {
    // Logged in!
  })
  .catch(error => {
    if (error.name === 'requires_verification') {
      auth0.webAuth
        .authorize({
          connection: realm,
          scope: scope,
          login_hint: email, // So the user doesn't have to type it again
        })
        .then(credentials => {
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

Check out how to set up Universal Login in the [Getting Started](#getting-started) section.

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/.github/blob/master/CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's development guide](DEVELOPMENT.md)

## Support + Feedback

- Use [Issues](https://github.com/auth0/react-native-auth0/issues) for code-level support
- Use [Community](https://community.auth0.com/) for usage, questions, specific cases

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy/) details the procedure for disclosing security issues.

## What is Auth0?

Auth0 helps you to easily:

- implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- log in users with username/password databases, passwordless, or multi-factor authentication
- link multiple user accounts together
- generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- access demographics and analytics detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript rules

[Why Auth0?](https://auth0.com/why-auth0)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

<!-- Variables -->

[npm-image]: https://img.shields.io/npm/v/react-native-auth0.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-native-auth0
[circleci-image]: https://img.shields.io/circleci/project/github/auth0/react-native-auth0.svg?branch=master&style=flat-square
[circleci-url]: https://circleci.com/gh/auth0/react-native-auth0
[codecov-image]: https://img.shields.io/codecov/c/github/auth0/react-native-auth0.svg?style=flat-square
[codecov-url]: https://codecov.io/github/auth0/react-native-auth0
[license-image]: https://img.shields.io/npm/l/react-native-auth0.svg?style=flat-square
[license-url]: #license
[downloads-image]: https://img.shields.io/npm/dm/react-native-auth0.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-native-auth0
