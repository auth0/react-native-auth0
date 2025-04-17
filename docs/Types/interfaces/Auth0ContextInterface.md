[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / Auth0ContextInterface

# Interface: Auth0ContextInterface\<TUser\>

Defined in: [hooks/auth0-context.ts:24](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L24)

## Extends

- [`AuthState`](AuthState.md)\<`TUser`\>

## Type Parameters

### TUser

`TUser` _extends_ [`User`](../../type-aliases/User.md) = [`User`](../../type-aliases/User.md)

## Properties

### authorize()

> **authorize**: (`parameters?`, `options?`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:31](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L31)

Authorize the user using Auth0 Universal Login. See [WebAuth#authorize](../classes/WebAuth.md#authorize)

#### Parameters

##### parameters?

[`WebAuthorizeParameters`](../../interfaces/WebAuthorizeParameters.md)

The parameters that are sent to the `/authorize` endpoint.

##### options?

[`WebAuthorizeOptions`](../../interfaces/WebAuthorizeOptions.md)

Options for customizing the SDK's handling of the authorize call

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithEmail()

> **authorizeWithEmail**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:58](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L58)

Authorize the user using an email code. See [Auth#loginWithEmail](../classes/Auth.md#loginwithemail)

#### Parameters

##### parameters

[`LoginWithEmailOptions`](../../interfaces/LoginWithEmailOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithExchangeNativeSocial()

> **authorizeWithExchangeNativeSocial**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:128](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L128)

Authorize user with credentials using the Password Realm Grant. See [Auth#passwordRealm](../classes/Auth.md#passwordrealm)

#### Parameters

##### parameters

[`ExchangeNativeSocialOptions`](../../interfaces/ExchangeNativeSocialOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithOOB()

> **authorizeWithOOB**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:70](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L70)

Authorize the user using an Out Of Band authentication code. See [Auth#loginWithOOB](../classes/Auth.md#loginwithoob)

#### Parameters

##### parameters

[`LoginWithOOBOptions`](../../interfaces/LoginWithOOBOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithOTP()

> **authorizeWithOTP**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:76](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L76)

Autohrize the user using a One Time Password code. See [Auth#loginWithOTP](../classes/Auth.md#loginwithotp).

#### Parameters

##### parameters

[`LoginWithOTPOptions`](../../interfaces/LoginWithOTPOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithPasswordRealm()

> **authorizeWithPasswordRealm**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:122](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L122)

Authorize user with credentials using the Password Realm Grant. See [Auth#passwordRealm](../classes/Auth.md#passwordrealm)

#### Parameters

##### parameters

[`PasswordRealmOptions`](../../interfaces/PasswordRealmOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithRecoveryCode()

> **authorizeWithRecoveryCode**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:82](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L82)

Authorize the user using a multi-factor authentication Recovery Code. See [Auth#loginWithRecoveryCode](../classes/Auth.md#loginwithrecoverycode)

#### Parameters

##### parameters

[`LoginWithRecoveryCodeOptions`](../../interfaces/LoginWithRecoveryCodeOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### authorizeWithSMS()

> **authorizeWithSMS**: (`parameters`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:48](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L48)

Authorize the user using a SMS code. See [Auth#loginWithSMS](../classes/Auth.md#loginwithsms)

#### Parameters

##### parameters

[`LoginWithSMSOptions`](../../interfaces/LoginWithSMSOptions.md)

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### cancelWebAuth()

> **cancelWebAuth**: () => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:40](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L40)

Cancel any ongoing Universal Login transaction.
This works only on iOS and not on any other platforms

#### Returns

`Promise`\<`void`\>

---

### clearCredentials()

> **clearCredentials**: () => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:118](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L118)

Clears the user's credentials without clearing their web session and logs them out.

#### Returns

`Promise`\<`void`\>

---

### clearSession()

> **clearSession**: (`parameters?`, `options?`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:96](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L96)

Clears the user's web session, credentials and logs them out. See [WebAuth#clearSession](../classes/WebAuth.md#clearsession)

#### Parameters

##### parameters?

[`ClearSessionParameters`](../../interfaces/ClearSessionParameters.md)

Additional parameters to send to the Auth0 logout endpoint.

##### options?

[`ClearSessionOptions`](../../interfaces/ClearSessionOptions.md)

Options for configuring the SDK's clear session behaviour.

#### Returns

`Promise`\<`void`\>

---

### error

> **error**: `null` \| [`BaseError`](../classes/BaseError.md)

Defined in: [hooks/auth0-context.ts:147](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L147)

An object representing the last exception

#### Inherited from

[`AuthState`](AuthState.md).[`error`](AuthState.md#error)

---

### getCredentials()

> **getCredentials**: (`scope?`, `minTtl?`, `parameters?`, `forceRefresh?`) => `Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [hooks/auth0-context.ts:109](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L109)

Gets the user's credentials from the native credential store. If credentials have expired, they are automatically refreshed
by default. See [CredentialsManager#getCredentials](../classes/CredentialsManager.md#getcredentials)

#### Parameters

##### scope?

`string`

The scopes used to get the credentials

##### minTtl?

`number`

The minimum time in seconds that the access token should last before expiration

##### parameters?

`Record`\<`string`, `unknown`\>

Any additional parameters to send in the request to refresh expired credentials.

##### forceRefresh?

`boolean`

If `true`, credentials are always refreshed regardless of their expiry, provided a valid refresh token is available.

#### Returns

`Promise`\<`undefined` \| [`Credentials`](../../type-aliases/Credentials.md)\>

---

### hasValidCredentials()

> **hasValidCredentials**: (`minTtl?`) => `Promise`\<`boolean`\>

Defined in: [hooks/auth0-context.ts:90](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L90)

Whether the SDK currently holds valid, unexpired credentials.

#### Parameters

##### minTtl?

`number`

The minimum time in seconds that the access token should last before expiration

#### Returns

`Promise`\<`boolean`\>

`true` if there are valid credentials. Otherwise, `false`.

---

### isLoading

> **isLoading**: `boolean`

Defined in: [hooks/auth0-context.ts:155](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L155)

A flag that is true until the state knows that a user is either logged in or not

#### Inherited from

[`AuthState`](AuthState.md).[`isLoading`](AuthState.md#isloading)

---

### resetPassword()

> **resetPassword**: (`parameters`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:140](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L140)

Request an email with instructions to change password of a user [Auth#resetPassword](../classes/Auth.md#resetpassword)

#### Parameters

##### parameters

[`ResetPasswordOptions`](../../interfaces/ResetPasswordOptions.md)

#### Returns

`Promise`\<`void`\>

---

### revokeRefreshToken()

> **revokeRefreshToken**: (`parameters`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:135](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L135)

Revokes an issued refresh token. See [Auth#revoke](../classes/Auth.md#revoke)

#### Parameters

##### parameters

[`RevokeOptions`](../../interfaces/RevokeOptions.md)

#### Returns

`Promise`\<`void`\>

---

### sendEmailCode()

> **sendEmailCode**: (`parameters`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:54](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L54)

Start the passwordless email login flow. See [Auth#passwordlessWithEmail](../classes/Auth.md#passwordlesswithemail)

#### Parameters

##### parameters

[`PasswordlessWithEmailOptions`](../../interfaces/PasswordlessWithEmailOptions.md)

#### Returns

`Promise`\<`void`\>

---

### sendMultifactorChallenge()

> **sendMultifactorChallenge**: (`parameters`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:64](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L64)

Send a challenge for multi-factor authentication. See [Auth#multifactorChallenge](../classes/Auth.md#multifactorchallenge)

#### Parameters

##### parameters

[`MultifactorChallengeOptions`](../../interfaces/MultifactorChallengeOptions.md)

#### Returns

`Promise`\<`void`\>

---

### sendSMSCode()

> **sendSMSCode**: (`parameters`) => `Promise`\<`void`\>

Defined in: [hooks/auth0-context.ts:44](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L44)

Start the passwordless SMS login flow. See [Auth#passwordlessWithSMS](../classes/Auth.md#passwordlesswithsms)

#### Parameters

##### parameters

[`PasswordlessWithSMSOptions`](../../interfaces/PasswordlessWithSMSOptions.md)

#### Returns

`Promise`\<`void`\>

---

### user

> **user**: `null` \| `TUser`

Defined in: [hooks/auth0-context.ts:151](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L151)

The user profile as decoded from the ID token after authentication

#### Inherited from

[`AuthState`](AuthState.md).[`user`](AuthState.md#user)
