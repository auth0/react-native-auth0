# Change Log

## [v2.6.0](https://github.com/auth0/react-native-auth0/tree/v2.6.0) (2020-08-11)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.5.0...v2.6.0)

**Added**

- Add compileOptions for JDK 8 [\#323](https://github.com/auth0/react-native-auth0/pull/323) ([immackay](https://github.com/immackay))

**Fixed**

- Fix the www-authenticate header parsing logic [\#329](https://github.com/auth0/react-native-auth0/pull/329) ([lbalmaceda](https://github.com/lbalmaceda))

**Security**

- Bump lodash from 4.17.15 to 4.17.19 [\#320](https://github.com/auth0/react-native-auth0/pull/320) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v2.5.0](https://github.com/auth0/react-native-auth0/tree/v2.5.0) (2020-06-09)

This release requires at minimum React Native SDK version 0.62.2. If you need to run it on a different version, check the Compatibility Matrix on the README for reference.

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.4.0...v2.5.0)

**Added**

- Warn when bundle identifier contains uppercase characters [\#316](https://github.com/auth0/react-native-auth0/pull/316) ([lbalmaceda](https://github.com/lbalmaceda))

**Security**

- Breaking: Require ReactNative version 0.62.2 [\#315](https://github.com/auth0/react-native-auth0/pull/315) ([lbalmaceda](https://github.com/lbalmaceda))

## [v2.4.0](https://github.com/auth0/react-native-auth0/tree/v2.4.0) (2020-06-05)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.3.1...v2.4.0)

**Added**

- Added support for ephemeral sessions [SDK-1412][\#305](https://github.com/auth0/react-native-auth0/pull/305) ([Widcket](https://github.com/Widcket))

**Security**

- Bump dependencies in the lock file [\#313](https://github.com/auth0/react-native-auth0/pull/313) ([lbalmaceda](https://github.com/lbalmaceda))

## [v2.3.1](https://github.com/auth0/react-native-auth0/tree/v2.3.1) (2020-04-29)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.3.0...v2.3.1)

**Fixed**

- Fixed tag in Podspec [\#300](https://github.com/auth0/react-native-auth0/pull/300) ([Widcket](https://github.com/Widcket))
- handle invalid token error [\#285](https://github.com/auth0/react-native-auth0/pull/285) ([emiliokyp](https://github.com/emiliokyp))

**Security**

- [Snyk] Security upgrade crypto-js from 3.1.9-1 to 3.3.0 [\#299](https://github.com/auth0/react-native-auth0/pull/299) ([crew-security](https://github.com/crew-security))
- Bump acorn from 5.7.3 to 5.7.4 [\#287](https://github.com/auth0/react-native-auth0/pull/287) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v2.3.0](https://github.com/auth0/react-native-auth0/tree/v2.3.0) (2020-02-10)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.2.0...v2.3.0)

**Added**

- Added token exchange for native social endpoint [SDK-1307][\#273](https://github.com/auth0/react-native-auth0/pull/273) ([Widcket](https://github.com/Widcket))

## [v2.2.0](https://github.com/auth0/react-native-auth0/tree/v2.2.0) (2020-01-30)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.1.1...v2.2.0)

**Added**

- Add passwordless endpoints [\#270](https://github.com/auth0/react-native-auth0/pull/270) ([lbalmaceda](https://github.com/lbalmaceda))
- Handle missing kid (key id) on the JWKS [\#269](https://github.com/auth0/react-native-auth0/pull/269) ([lbalmaceda](https://github.com/lbalmaceda))

**Changed**

- Refactor RSA verification: Replace jsrsasign with crypto-js [\#268](https://github.com/auth0/react-native-auth0/pull/268) ([lbalmaceda](https://github.com/lbalmaceda))

## [v2.1.1](https://github.com/auth0/react-native-auth0/tree/v2.1.1) (2020-01-10)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.1.0...v2.1.1)

**Removed**

- Remove issued_at claim value check [\#266](https://github.com/auth0/react-native-auth0/pull/266) ([lbalmaceda](https://github.com/lbalmaceda))

**Fixed**

- Fix gradle javaCompile warning [\#265](https://github.com/auth0/react-native-auth0/pull/265) ([lbalmaceda](https://github.com/lbalmaceda))

**Security**

- Bump handlebars from 4.2.0 to 4.5.3 [\#262](https://github.com/auth0/react-native-auth0/pull/262) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v2.1.0](https://github.com/auth0/react-native-auth0/tree/v2.1.0) (2019-10-23)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v2.0.0...v2.1.0)

**Security**

- Improved OIDC compliance [\#243](https://github.com/auth0/react-native-auth0/pull/243) ([jimmyjames](https://github.com/jimmyjames))

## [v2.0.0](https://github.com/auth0/react-native-auth0/tree/v2.0.0) (2019-10-08)

This is a major release that supports **CocoaPods** and **Android X**.

It requires at minimum React Native SDK version 0.60.5. If you need to run it on a different version, check the Compatibility Matrix on the README for reference.

### Migration notes:

- Install the SDK with yarn `add react-native-auth0` or npm `npm install react-native-auth0 --save`.
- Install the Pod for the iOS native module. Change into the `ios` directory of your application and run `pod install`.

Every iOS application after React Native SDK version 0.60.0 has a `podfile` file. If yours doesn't, please check the [documentation](https://facebook.github.io/react-native/docs/integration-with-existing-apps) on how to generate a valid one.

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.6.0...v2.0.0)

## [v1.6.0](https://github.com/auth0/react-native-auth0/tree/v1.6.0) (2019-09-23)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.5.0...v1.6.0)

**Added**

- Support for iOS 13 Web Authentication [\#234](https://github.com/auth0/react-native-auth0/pull/234) ([cocojoe](https://github.com/cocojoe))

## [v1.5.0](https://github.com/auth0/react-native-auth0/tree/v1.5.0) (2019-07-15)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.4.2...v1.5.0)

**Changed**

- Enable WebAuth Logout for Android & Fix iOS Logout. [\#223](https://github.com/auth0/react-native-auth0/pull/223) ([lbalmaceda](https://github.com/lbalmaceda))

**Fixed**

- Fix error handling by using authentication error class [\#228](https://github.com/auth0/react-native-auth0/pull/228) ([lbalmaceda](https://github.com/lbalmaceda))

## [v1.4.2](https://github.com/auth0/react-native-auth0/tree/v1.4.2) (2019-04-24)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.4.2...v1.4.2)

**Changed**

- Update telemetry format [\#213](https://github.com/auth0/react-native-auth0/pull/213) ([lbalmaceda](https://github.com/lbalmaceda))

## [v1.4.1](https://github.com/auth0/react-native-auth0/tree/v1.4.1) (2019-04-18)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.4.0...v1.4.1)

**Fixed**

- Podspec restore react dependency [\#214](https://github.com/auth0/react-native-auth0/pull/214) ([cocojoe](https://github.com/cocojoe))

## [v1.4.0](https://github.com/auth0/react-native-auth0/tree/v1.4.0) (2019-02-07)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.3.1...v1.4.0)

**Changed**

- Remove obsolete React dependency from podspec. [\#192](https://github.com/auth0/react-native-auth0/pull/192) ([rnevius](https://github.com/rnevius))
- Added iOS SF/ASWeb AuthenticationSession support [\#187](https://github.com/auth0/react-native-auth0/pull/187) ([cocojoe](https://github.com/cocojoe))
- Allow authorize options to override default values [\#177](https://github.com/auth0/react-native-auth0/pull/177) ([kenzic](https://github.com/kenzic))

## [v1.3.1](https://github.com/auth0/react-native-auth0/tree/v1.3.1) (2018-10-01)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.3.0...v1.3.1)

**Changed**

- Update Minimum iOS Deployment Target, inline with React Libs [\#176](https://github.com/auth0/react-native-auth0/pull/176) ([coosamatt](https://github.com/coosamatt))

## [v1.3.0](https://github.com/auth0/react-native-auth0/tree/v1.3.0) (2018-07-17)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.2.2...v1.3.0)

**Added**

- android: allow root project to specify dependency versions [\#149](https://github.com/auth0/react-native-auth0/pull/149) ([mlc](https://github.com/mlc))

**Fixed**

- Add requiresMainQueueSetup to fix warning in RN 0.49+ [\#165](https://github.com/auth0/react-native-auth0/pull/165) ([frankrowe](https://github.com/frankrowe))
- Fixed broken podspec for Cocoapods installations [\#136](https://github.com/auth0/react-native-auth0/pull/136) ([danieljvdm](https://github.com/danieljvdm))

## [v1.2.2](https://github.com/auth0/react-native-auth0/tree/v1.2.2) (2018-01-31)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.2.1...v1.2.2)

**Fixed**

- Fix android web authentication [\#126](https://github.com/auth0/react-native-auth0/pull/126) ([lbalmaceda](https://github.com/lbalmaceda))

## [v1.2.1](https://github.com/auth0/react-native-auth0/tree/v1.2.1) (2017-10-11)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.2.0...v1.2.1)

**Fixed**

- Fixed race condition in callback when using React Native Navigation [\#100](https://github.com/auth0/react-native-auth0/pull/100) ([cocojoe](https://github.com/cocojoe))

## [v1.2.0](https://github.com/auth0/react-native-auth0/tree/v1.2.0) (2017-09-11)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.1.1...v1.2.0)
**Closed issues**

- Browser tabs not closed upon webauth success/failure [\#87](https://github.com/auth0/react-native-auth0/issues/87)
- WebAuth never opens safari on iOS [\#84](https://github.com/auth0/react-native-auth0/issues/84)

**Added**

- Close Browser app tab after finishing Auth [\#90](https://github.com/auth0/react-native-auth0/pull/90) ([cocojoe](https://github.com/cocojoe))

**Fixed**

- Fix Present SFSafariViewController from Top ViewController [\#89](https://github.com/auth0/react-native-auth0/pull/89) ([cocojoe](https://github.com/cocojoe))

## [v1.1.1](https://github.com/auth0/react-native-auth0/tree/v1.1.1) (2017-08-18)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.1.0...v1.1.1)

**Fixed**

- Call resolve on logout load [\#80](https://github.com/auth0/react-native-auth0/pull/80) ([hzalaz](https://github.com/hzalaz))

## [v1.1.0](https://github.com/auth0/react-native-auth0/tree/v1.1.0) (2017-08-18)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.0.4...v1.1.0)
**Closed issues**

- Could not invoke A0Auth.showUrl [\#67](https://github.com/auth0/react-native-auth0/issues/67)

**Added**

- Added clearSession iOS Safari Method [\#65](https://github.com/auth0/react-native-auth0/pull/65) ([cocojoe](https://github.com/cocojoe))

**Fixed**

- Change customtabs version to the same as default build tools [\#78](https://github.com/auth0/react-native-auth0/pull/78) ([lukecwilliams](https://github.com/lukecwilliams))

## [v1.0.4](https://github.com/auth0/react-native-auth0/tree/v1.0.4) (2017-08-13)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.0.3...v1.0.4)

**Changed**

- Remove override annotation on createJSModules method [\#70](https://github.com/auth0/react-native-auth0/pull/70) ([lukecwilliams](https://github.com/lukecwilliams))

## [v1.0.3](https://github.com/auth0/react-native-auth0/tree/v1.0.3) (2017-06-26)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.0.2...v1.0.3)

**Fixed**

- Add missing import to the WebAuth controller file [\#50](https://github.com/auth0/react-native-auth0/pull/50) ([lbalmaceda](https://github.com/lbalmaceda))

## [v1.0.2](https://github.com/auth0/react-native-auth0/tree/v1.0.2) (2017-06-16)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.0.1...v1.0.2)

**Fixed**

- Fix options not found error [\#43](https://github.com/auth0/react-native-auth0/pull/43) ([sebirdman](https://github.com/sebirdman))

## [v1.0.1](https://github.com/auth0/react-native-auth0/tree/v1.0.1) (2017-06-15)

[Full Changelog](https://github.com/auth0/react-native-auth0/compare/v1.0.0...v1.0.1)

**Fixed**

- Bundle identifier must be made lowercase [\#38](https://github.com/auth0/react-native-auth0/pull/38) ([trondwernerhansen](https://github.com/trondwernerhansen))

## [v1.0.0](https://github.com/auth0/auth0.js/tree/v1.0.0) (2017-06-14)

[Full Changelog](https://github.com/auth0/auth0.js/tree/v1.0.0)

### Installation

Install `react-native-auth0` using [npm](https://www.npmjs.com)

```bash
npm install react-native-auth0 --save
```

Or via [yarn](https://yarnpkg.com/en/package/jest)

```bash
yarn add --dev react-native-auth0
```

then you need to link the native module in `react-native-auth0`

```bash
react-native link react-native-auth0
```

#### Configuration

> This section is for those that want to use [WebAuth](#webauth), if you dont need it just ignore this section.

##### Android

In the file `android/src/app/AndroidManifest.xml` you must make sure the main activity of the app has launch mode value of `singleTask` and that it has the following intent filter

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

So if you have `samples.auth0.com` as your Auth0 domain you would have the following activity configuration:

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

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

##### iOS

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

Then in your `Info.plist` file, find the value of the entry of `CFBundleIdentifier`, e.g.

```xml
<key>CFBundleIdentifier</key>
<string>org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)</string>
```

and then register a URL type entry using the value of `CFBundleIdentifier` as the value of `CFBundleURLSchemes`

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
            <string>org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)</string>
        </array>
    </dict>
</array>
```

> The value `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)` is the default for apps created with RN cli, you will probably have a different value.

> For more info please read [react native docs](https://facebook.github.io/react-native/docs/linking.html)

### Usage

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: '{YOUR_AUTH0_DOMAIN}',
  clientId: '{YOUR_CLIENT_ID}',
});
```

#### WebAuth

```js
auth0.webAuth
  .authorize({scope: 'openid email'})
  .then(credentials => console.log(credentials))
  .catch(error => console.log(error));
```
