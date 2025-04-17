[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / Auth

# Class: Auth

Defined in: [auth/index.ts:65](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L65)

Class for interfacing with the Auth0 Authentication API endpoints.

## See

https://auth0.com/docs/api/authentication

## Properties

### clientId

> `readonly` **clientId**: `string`

Defined in: [auth/index.ts:70](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L70)

The Auth0 client ID

---

### domain

> `readonly` **domain**: `string`

Defined in: [auth/index.ts:74](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L74)

The Auth0 tenant domain

## Methods

### authorizeUrl()

> **authorizeUrl**(`parameters`): `string`

Defined in: [auth/index.ts:104](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L104)

Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.

#### Parameters

##### parameters

[`AuthorizeUrlOptions`](../../interfaces/AuthorizeUrlOptions.md)

#### Returns

`string`

A URL to the authorize endpoint with specified parameters to redirect to for AuthZ/AuthN.

#### See

https://auth0.com/docs/api/authentication#authorize-client

---

### createUser()

> **createUser**(`parameters`): `Promise`\<`Partial`\<[`User`](../../type-aliases/User.md)\>\>

Defined in: [auth/index.ts:585](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L585)

Creates a new user using the options provided.

#### Parameters

##### parameters

[`CreateUserOptions`](../../interfaces/CreateUserOptions.md)

#### Returns

`Promise`\<`Partial`\<[`User`](../../type-aliases/User.md)\>\>

An instance of [User](../../type-aliases/User.md).

---

### exchange()

> **exchange**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:149](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L149)

Exchanges a code obtained via `/authorize` (w/PKCE) for the user's tokens

#### Parameters

##### parameters

[`ExchangeOptions`](../../interfaces/ExchangeOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A prominse for a populated instance of [Credentials](../../type-aliases/Credentials.md).

#### See

https://auth0.com/docs/api-auth/grant/authorization-code-pkce

---

### exchangeNativeSocial()

> **exchangeNativeSocial**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:179](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L179)

Exchanges an external token obtained via a native social authentication solution for the user's tokens

#### Parameters

##### parameters

[`ExchangeNativeSocialOptions`](../../interfaces/ExchangeNativeSocialOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

#### See

https://auth0.com/docs/api/authentication#token-exchange-for-native-social

---

### loginWithEmail()

> **loginWithEmail**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:305](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L305)

Completes the Passworldess authentication with an email connection that was started using [passwordlessWithEmail](#passwordlesswithemail).

#### Parameters

##### parameters

[`LoginWithEmailOptions`](../../interfaces/LoginWithEmailOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### loginWithOOB()

> **loginWithOOB**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:406](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L406)

Log in a user using an Out Of Band authentication code after they have received the 'mfa_required' error.
The MFA token tells the server the username or email, password, and realm values sent on the first request.

Requires your client to have the **MFA OOB** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.

#### Parameters

##### parameters

[`LoginWithOOBOptions`](../../interfaces/LoginWithOOBOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### loginWithOTP()

> **loginWithOTP**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:373](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L373)

Log in a user using the One Time Password code after they have received the 'mfa_required' error.
The MFA token tells the server the username or email, password, and realm values sent on the first request.

Requires your client to have the **MFA OTP** Grant Type enabled.
See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.

#### Parameters

##### parameters

[`LoginWithOTPOptions`](../../interfaces/LoginWithOTPOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### loginWithRecoveryCode()

> **loginWithRecoveryCode**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:440](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L440)

Log in a user using a multi-factor authentication Recovery Code after they have received the 'mfa_required' error.
The MFA token tells the server the username or email, password, and realm values sent on the first request.

Requires your client to have the **MFA** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.

#### Parameters

##### parameters

[`LoginWithRecoveryCodeOptions`](../../interfaces/LoginWithRecoveryCodeOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### loginWithSMS()

> **loginWithSMS**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:337](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L337)

Completes the Passworldess authentication with an SMS connection that was started using [passwordlessWithSMS](#passwordlesswithsms).

#### Parameters

##### parameters

[`LoginWithSMSOptions`](../../interfaces/LoginWithSMSOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### logoutUrl()

> **logoutUrl**(`parameters`): `string`

Defined in: [auth/index.ts:129](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L129)

Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.

#### Parameters

##### parameters

[`LogoutUrlOptions`](../../interfaces/LogoutUrlOptions.md)

#### Returns

`string`

A URL to the logout endpoint with specified parameters

#### See

https://auth0.com/docs/api/authentication#logout

---

### multifactorChallenge()

> **multifactorChallenge**(`parameters`): `Promise`\<[`MultifactorChallengeResponse`](../../type-aliases/MultifactorChallengeResponse.md)\>

Defined in: [auth/index.ts:474](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L474)

Request a challenge for multi-factor authentication (MFA) based on the challenge types supported by the application and user.
The challenge type is how the user will get the challenge and prove possession. Supported challenge types include: "otp" and "oob".

#### Parameters

##### parameters

[`MultifactorChallengeOptions`](../../interfaces/MultifactorChallengeOptions.md)

#### Returns

`Promise`\<[`MultifactorChallengeResponse`](../../type-aliases/MultifactorChallengeResponse.md)\>

[MultifactorChallengeOTPResponse](../../type-aliases/MultifactorChallengeOTPResponse.md), [MultifactorChallengeOOBResponse](../../type-aliases/MultifactorChallengeOOBResponse.md), or [MultifactorChallengeOOBWithBindingResponse](../../type-aliases/MultifactorChallengeOOBWithBindingResponse.md) depending
on the challenge type.

---

### passwordlessWithEmail()

> **passwordlessWithEmail**(`parameters`): `Promise`\<`void`\>

Defined in: [auth/index.ts:262](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L262)

Starts the Passworldess flow with an email connection.

This should be completed later using a call to [loginWithEmail](#loginwithemail), passing the OTP that was sent to the user.

#### Parameters

##### parameters

[`PasswordlessWithEmailOptions`](../../interfaces/PasswordlessWithEmailOptions.md)

#### Returns

`Promise`\<`void`\>

---

### passwordlessWithSMS()

> **passwordlessWithSMS**(`parameters`): `Promise`\<`void`\>

Defined in: [auth/index.ts:279](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L279)

Starts the Passwordless flow with an SMS connection.

This should be completed later using a call to [loginWithSMS](#loginwithsms), passing the OTP that was sent to the user.

#### Parameters

##### parameters

[`PasswordlessWithSMSOptions`](../../interfaces/PasswordlessWithSMSOptions.md)

#### Returns

`Promise`\<`void`\>

---

### passwordRealm()

> **passwordRealm**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:213](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L213)

Performs Auth with user credentials using the Password Realm Grant

#### Parameters

##### parameters

[`PasswordRealmOptions`](../../interfaces/PasswordRealmOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

#### See

https://auth0.com/docs/api-auth/grant/password#realm-support

---

### refreshToken()

> **refreshToken**(`parameters`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [auth/index.ts:233](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L233)

Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)

#### Parameters

##### parameters

[`RefreshTokenOptions`](../../interfaces/RefreshTokenOptions.md)

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

#### See

https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token

---

### resetPassword()

> **resetPassword**(`parameters`): `Promise`\<`void`\>

Defined in: [auth/index.ts:566](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L566)

Request an email with instructions to change password of a user

#### Parameters

##### parameters

[`ResetPasswordOptions`](../../interfaces/ResetPasswordOptions.md)

#### Returns

`Promise`\<`void`\>

---

### revoke()

> **revoke**(`parameters`): `Promise`\<`void`\>

Defined in: [auth/index.ts:503](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L503)

Revoke an issued refresh token

#### Parameters

##### parameters

[`RevokeOptions`](../../interfaces/RevokeOptions.md)

#### Returns

`Promise`\<`void`\>

---

### userInfo()

> **userInfo**(`parameters`): `Promise`\<[`User`](../../type-aliases/User.md)\>

Defined in: [auth/index.ts:530](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth/index.ts#L530)

Return user information using an access token

#### Parameters

##### parameters

[`UserInfoOptions`](../../interfaces/UserInfoOptions.md)

#### Returns

`Promise`\<[`User`](../../type-aliases/User.md)\>

The user's profile information.
