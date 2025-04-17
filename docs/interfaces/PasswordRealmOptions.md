[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / PasswordRealmOptions

# Interface: PasswordRealmOptions

Defined in: [types.ts:298](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L298)

Options for authenticating using the username & password grant.

## Indexable

\[`key`: `string`\]: `any`

## Properties

### audience?

> `optional` **audience**: `string`

Defined in: [types.ts:314](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L314)

The identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token

---

### password

> **password**: `string`

Defined in: [types.ts:306](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L306)

The user's password

---

### realm

> **realm**: `string`

Defined in: [types.ts:310](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L310)

The name of the Realm where to Auth (or connection name)

---

### scope?

> `optional` **scope**: `string`

Defined in: [types.ts:318](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L318)

The scopes requested for the issued tokens. e.g. `openid profile`

---

### username

> **username**: `string`

Defined in: [types.ts:302](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L302)

The user's username or email
