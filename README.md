# react-native-auth0

[![NPM version][npm-image]][npm-url]

React Native toolkit for Auth0 API

> This library is currently in Beta and it's missing some Authentication API methods. Feel free to contribute

## Requirements

React Native 0.26+

## Installation

```
npm install react-native-auth0 --save
```

## Usage

```
const Auth0 = require('react-native-auth0');
const auth0 = new Auth0('samples.auth0.com');
```

### Delegation
```js
auth0
    .authentication("client_id")
    .delegation({
        "id_token": "user token",
        // Other Delegation parameters
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

The valid parameters are:

* **idToken** (`string`): valid user id_token obtained during login.
* **refreshToken** (`string`): user's refresh_token used to request new id_token.
* **apiType** (`string`): for what api the new token will be for. e.g. `firebase` or `aws`.
* **target** (`string`): what Auth0 client the token will be requested from.
* **scope** (`string`): scope required in the token.

### Refresh token
```js
auth0
    .authentication("client_id")
    .refreshToken("user refresh token")
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Get User Info
```js
auth0
    .authentication("client_id")
    .userInfo("user access token")
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Patch user with user_metadata
```js
auth0
    .users("user token")
    .patch("user id", {"first_name": "John", "last_name": "Doe"})
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.

<!-- Variables -->
[npm-image]: https://img.shields.io/npm/v/react-native-auth0.svg?style=flat
[npm-url]: https://npmjs.org/package/react-native-auth0
[travis-image]: http://img.shields.io/travis/auth0/react-native-auth0.svg?style=flat
[travis-url]: https://travis-ci.org/auth0/react-native-auth0
