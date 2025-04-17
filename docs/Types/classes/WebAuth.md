[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / WebAuth

# Class: WebAuth

Defined in: [webauth/index.ts:24](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/webauth/index.ts#L24)

Helper to perform Auth against Auth0 hosted login page

It will use `/authorize` endpoint of the Authorization Server (AS)
with Code Grant and Proof Key for Challenge Exchange (PKCE).

## See

https://auth0.com/docs/api-auth/grant/authorization-code-pkce

## Methods

### authorize()

> **authorize**(`parameters`, `options`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [webauth/index.ts:53](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/webauth/index.ts#L53)

Starts the AuthN/AuthZ transaction against the AS in the in-app browser.

To learn more about how to customize the authorize call, check the Universal Login Page
article at https://auth0.com/docs/hosted-pages/login

#### Parameters

##### parameters

[`WebAuthorizeParameters`](../../interfaces/WebAuthorizeParameters.md) = `{}`

##### options

[`WebAuthorizeOptions`](../../interfaces/WebAuthorizeOptions.md) = `{}`

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A poplulated instance of [Credentials](../../type-aliases/Credentials.md).

#### See

https://auth0.com/docs/api/authentication#authorize-client

---

### cancelWebAuth()

> **cancelWebAuth**(): `Promise`\<`void`\>

Defined in: [webauth/index.ts:79](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/webauth/index.ts#L79)

Terminates the ongoing web-based operation and reports back that it was cancelled.
You need to call this method within your custom Web Auth provider implementation whenever the operation is
cancelled by the user.

#### Returns

`Promise`\<`void`\>

---

### clearSession()

> **clearSession**(`parameters`, `options`): `Promise`\<`void`\>

Defined in: [webauth/index.ts:92](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/webauth/index.ts#L92)

Removes Auth0 session and optionally remove the Identity Provider session.

#### Parameters

##### parameters

[`ClearSessionParameters`](../../interfaces/ClearSessionParameters.md) = `{}`

##### options

[`ClearSessionOptions`](../../interfaces/ClearSessionOptions.md) = `{}`

#### Returns

`Promise`\<`void`\>

#### See

https://auth0.com/docs/logout
