# react-native-auth0

[![NPM version][npm-image]][npm-url]

React Native toolkit for Auth0 API

> This library is currently in Beta and it's missing some Authentication API methods. Feel free to contribute

## Requirements

React Native 0.26+

## Installation

```
npm install react-native-auth0@beta --save
```

## Usage

```js
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0('{YOUR_DOMAIN}');
```

### Authentication API

#### Login with database connection

```js
auth0
    .authentication('{YOUR_CLIENT_ID}')
    .login("info@auth0.com", "password", "myconnection")
    .then(credentials => console.log(credentials))
    .catch(error => console.log(error));
```

#### Create user in database connection

```js
auth0
    .authentication('{YOUR_CLIENT_ID}')
    .createUser('info@auth0.com', 'username', 'password', 'myconnection')
    .then(user => console.log(user))
    .catch(error => console.log(error));
```

#### Get user information

```js
auth0
    .authentication('{YOUR_CLIENT_ID}')
    .tokenInfo('user id_token')
    .then(profile => console.log(profile))
    .catch(error => console.log(error));
```

#### Using refresh token
```js
auth0
    .authentication('{YOUR_CLIENT_ID}')
    .refreshToken('user refresh_token')
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Management API (Users)

#### Patch user with user_metadata

```js
auth0
    .users('user token')
    .patch('user_id', {'first_name': 'John', 'last_name': 'Doe'})
    .then(response => console.log(response))
    .catch(error => console.log(error));
```

### Link users

```js
auth0
    .users('user token')
    .link("user_id", "other user token")
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
