# Frequently Asked Questions

1. [How can I have separate Auth0 domains for each environment on Android?](#1-how-can-i-have-separate-auth0-domains-for-each-environment-on-android)
2. [How can I disable the iOS _login_ alert box?](#2-how-can-i-disable-the-ios-login-alert-box)
3. [How can I disable the iOS _logout_ alert box?](#3-how-can-i-disable-the-ios-logout-alert-box)
4. [Is there a way to disable the iOS _login_ alert box without `ephemeralSession`?](#4-is-there-a-way-to-disable-the-ios-login-alert-box-without-ephemeralsession)
5. [How can I change the message in the iOS alert box?](#5-how-can-i-change-the-message-in-the-ios-alert-box)
6. [How can I programmatically close the iOS alert box?](#6-how-can-i-programmatically-close-the-ios-alert-box)

## 1. How can I have separate Auth0 domains for each environment on Android?

This library internally declares a `RedirectActivity` along with an **intent-filter** in its Android Manifest file to handle the Web Auth callback and logout URLs. While this approach prevents the developer from adding an activity declaration to their apps's Android Manifest file, it requires the use of [Manifest Placeholders](https://developer.android.com/studio/build/manage-manifests#inject_build_variables_into_the_manifest).

Alternatively, you can re-declare the `RedirectActivity` in the `AndroidManifest.xml` file with your own **intent-filter** so it overrides the library's default one. If you do this then the `manifestPlaceholders` don't need to be set as long as the activity contains `tools:node="replace"` like in the snippet below.

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="your.app.package">
    <application android:theme="@style/AppTheme">

        <!-- ... -->

        <activity
            android:name="com.auth0.android.provider.RedirectActivity"
            tools:node="replace">
            <intent-filter
                android:autoVerify="true"
                tools:targetApi="m">
                <action android:name="android.intent.action.VIEW" />

                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <!-- add a data tag for each environment -->

                <data
                    android:host="example.com"
                    android:pathPrefix="/android/${applicationId}/callback"
                    android:scheme="${auth0Scheme}" />
                <data
                    android:host="qa.example.com"
                    android:pathPrefix="/android/${applicationId}/callback"
                    android:scheme="${auth0Scheme}" />
            </intent-filter>
        </activity>

        <!-- ... -->

    </application>
</manifest>
```

## 2. How can I disable the iOS _login_ alert box?

![ios-sso-alert](assets/ios-sso-alert.png)

Under the hood, react-native-auth0 uses `ASWebAuthenticationSession` by default to perform web-based authentication, which is the [API provided by Apple](https://developer.apple.com/documentation/authenticationservices/aswebauthenticationsession) for such purpose.

That alert box is displayed and managed by `ASWebAuthenticationSession`, not by react-native-auth0, because by default this API will store the session cookie in the shared Safari cookie jar. This makes single sign-on (SSO) possible. According to Apple, that requires user consent.

> **Note**
> See [this blog post](https://developer.okta.com/blog/2022/01/13/mobile-sso) for a detailed overview of SSO on iOS.

### Use ephemeral sessions

If you don't need SSO, you can disable this behavior by adding `ephemeralSession: true` to the login call. This will configure `ASWebAuthenticationSession` to not store the session cookie in the shared cookie jar, as if using an incognito browser window. With no shared cookie, `ASWebAuthenticationSession` will not prompt the user for consent.

```js
auth0.webAuth
  .authorize(
    { scope: 'openid profile email' },
    { ephemeralSession: true } // No SSO, therefore no alert box
  )
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

Note that with `ephemeralSession: true` you don't need to call `clearSession` at all. Just clearing the credentials from the app will suffice. What `clearSession` does is clear the shared session cookie, so that in the next login call the user gets asked to log in again. But with `ephemeralSession: true` there will be no shared cookie to remove.

You still need to call `clearSession` on Android, though, as `ephemeralSession` is iOS-only.

### Use `SFSafariViewController`

An alternative is to use `SFSafariViewController` instead of `ASWebAuthenticationSession`. You can do so with the built-in `SFSafariViewController` Web Auth provider:

```js
auth0.webAuth
  .authorize(
    { scope: 'openid profile email' },
    { useSFSafariViewController: true } // Use SFSafariViewController
  )
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

> **Note**
> Since `SFSafariViewController` does not share cookies with the Safari app, SSO will not work either. But it will keep its own cookies, so you can use it to perform SSO between your app and your website as long as you open it inside your app using `SFSafariViewController`. This also means that any feature that relies on the persistence of cookies will work as expected.

## 3. How can I disable the iOS _logout_ alert box?

![ios-sso-alert](assets/ios-sso-alert.png)

Since `clearSession` needs to use `ASWebAuthenticationSession` as well to clear the shared session cookie, the same alert box will be displayed.

If you need SSO and/or are willing to tolerate the alert box on the login call, but would prefer to get rid of it when calling `clearSession`, you can simply not call `clearSession` and just clear the credentials from the app. This means that the shared session cookie will not be removed, so to get the user to log in again you need to add the `prompt: 'login'` parameter to the _login_ call.

```js
auth0.webAuth
  .authorize(
    { additionalParameters: { prompt: 'login' } }, // Ignore the cookie (if present) and show the login page
    { ephemeralSession: true }
  )
  .then((credentials) => console.log(credentials))
  .catch((error) => console.log(error));
```

Otherwise, the browser modal will close right away and the user will be automatically logged in again, as the cookie will still be there.

> **Warning**
> Keeping the shared session cookie may not be an option if you have strong privacy and/or security requirements, for example in the case of a banking app.

## 4. Is there a way to disable the iOS _login_ alert box without `ephemeralSession`?

No. According to Apple, storing the session cookie in the shared Safari cookie jar requires user consent. The only way to not have a shared cookie is to configure `ASWebAuthenticationSession` with `prefersEphemeralWebBrowserSession` set to `true`, which is what `ephemeralSession: true` does.

## 5. How can I change the message in the iOS alert box?

This library has no control whatsoever over the alert box. Its contents cannot be changed. Unfortunately, that's a limitation of `ASWebAuthenticationSession`.

## 6. How can I programmatically close the iOS alert box?

This library has no control whatsoever over the alert box. It cannot be closed programmatically. Unfortunately, that's a limitation of `ASWebAuthenticationSession`.
