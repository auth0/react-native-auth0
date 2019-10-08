# react-native-auth0

[![Build Status][circleci-image]][circleci-url]
[![NPM version][npm-image]][npm-url]
[![Coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

React Native toolkit for Auth0 API, compliant with [RFC 8252](https://tools.ietf.org/html/rfc8252)

## Requirements

This SDK targets apps that are using React Native SDK version `0.60.5` and up. If you're using an older React Native version, see the compatibility matrix below.

### Compatibility Matrix

This SDK attempts to follow [semver](https://semver.org/) in a best-effort basis, but React Native is still making releases that eventually include breaking changes on it making this approach difficult for any React Native library module. Use the table below to find the version that best suites your application.

| React Native SDK | Auth0 SDK |
| :--------------: | :-------: |
|     v0.60.5      |  v2.0.0   |
| v0.59.0 or lower |  v1.6.0   |

The contents of previous release can be found on the [branch v1](https://github.com/auth0/react-native-auth0/tree/v1).

## Getting started

First install the native library module:

Using [npm](https://www.npmjs.com)

`$ npm install react-native-auth0 --save`

or [yarn](https://yarnpkg.com/en/)

`$ yarn add react-native-auth0`

Then, you need to run the following command to install the ios app pods with Cocoapods. That will auto-link the iOS library.

`$ cd ios && pod install`

### Configuration

You need make your Android and iOS applications aware that an authentication result will be received from the browser. This SDK makes use of the Android's Package Name and its analogous iOS's Product Bundle Identifier to generate the redirect URL. Each platform has its own set of instructions.

#### Android

Open the `AndroidManifest.xml` file of your application typically at `android/app/src/main/AndroidManifest.xml` and **make sure** the Activity on which you're going to receive the authentication result has a **launchMode** of `singleTask`. Additionally inside this Activity definition include the following intent filter.

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:host="YOUR_AUTH0_DOMAIN"
        android:pathPrefix="/android/${applicationId}/callback"
        android:scheme="${applicationId}" />
</intent-filter>
```

The `android:host` value must be replaced with your Auth0 domain value. So if you have `samples.auth0.com` as your Auth0 domain you would have the following **MainActivity** configuration:

```xml
<activity
android:name=".MainActivity"
android:label="@string/app_name"
android:launchMode="singleTask"
android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
android:windowSoftInputMode="adjustResize">
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:host="samples.auth0.com"
        android:pathPrefix="/android/${applicationId}/callback"
        android:scheme="${applicationId}" />
</intent-filter>
</activity>
```

The `applicationId` value will be auto-replaced on runtime with the package name or id of your application (e.g. `com.example.app`). You can change this value from the `build.gradle` file. You can also check it at the top of your `AndroidManifest.xml` file. Take note of this value as you'll be requiring it to define the callback URLs below.

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

#### iOS

Inside the `ios` folder find the file `AppDelegate.[swift|m]` add the following to it

```objc
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}
```

Inside the `ios` folder open the `Info.plist` and locate the value for `CFBundleIdentifier`, e.g.

```xml
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
```

and then below it register a URL type entry using the value of `CFBundleIdentifier` as the value for `CFBundleURLSchemes`

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

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

### Callback URL(s)

Callback URLs are the URLs that Auth0 invokes after the authentication process. Auth0 routes your application back to this URL and appends additional parameters to it, including a token. Since callback URLs can be manipulated, you will need to add this URL to your Application's **Allowed Callback URLs** for security. This will enable Auth0 to recognize these URLs as valid. If omitted, authentication will not be successful.

> Callback URLs must have a valid scheme value as defined by the [specification](https://tools.ietf.org/html/rfc3986#page-17). Note however that platforms like Android don't follow this RFC and define the scheme and host values as case-sensitive. Since this SDK makes use of the Android's Package Name and its analogous iOS's Product Bundle Identifier to generate the redirect URL, it's advised to use lower case values for such. A "Redirect URI is not valid" error will raise if this format is not respected.

Go to the [Auth0 Dashboard](https://manage.auth0.com/#/applications), select your application and make sure that **Allowed Callback URLs** contains the URLs defined below.

If in addition you plan to use the log out method, you must also add these URLs to the **Allowed Logout URLs**.

#### Android

```text
{YOUR_APP_PACKAGE_NAME}://{YOUR_AUTH0_DOMAIN}/android/{YOUR_APP_PACKAGE_NAME}/callback
```

> Make sure to replace {YOUR_APP_PACKAGE_NAME} and {YOUR_AUTH0_DOMAIN} with the actual values for your application.

#### iOS

```text
{YOUR_BUNDLE_IDENTIFIER}://{YOUR_AUTH0_DOMAIN}/ios/{YOUR_BUNDLE_IDENTIFIER}/callback
```

> Make sure to replace {YOUR_BUNDLE_IDENTIFIER} and {YOUR_AUTH0_DOMAIN} with the actual values for your application.

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

#### Log in

```js
auth0.webAuth
  .authorize({scope: 'openid email profile'})
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```

#### Log out

```js
auth0.webAuth.clearSession().catch(error => console.log(error));
```

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

For more info please check our generated [documentation](http://auth0.github.io/react-native-auth0/index.html)

## What is Auth0?

Auth0 helps you to:

- Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
- Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
- Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
- Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
- Analytics of how, when and where users are logging in.
- Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

<!-- Variables -->

[npm-image]: https://img.shields.io/npm/v/react-native-auth0.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-native-auth0
[circleci-image]: http://img.shields.io/circleci/project/github/auth0/react-native-auth0.svg?branch=master&style=flat-square
[circleci-url]: https://circleci.com/gh/auth0/react-native-auth0
[codecov-image]: https://img.shields.io/codecov/c/github/auth0/react-native-auth0.svg?style=flat-square
[codecov-url]: https://codecov.io/github/auth0/react-native-auth0
[license-image]: http://img.shields.io/npm/l/react-native-auth0.svg?style=flat-square
[license-url]: #license
[downloads-image]: http://img.shields.io/npm/dm/react-native-auth0.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-native-auth0
