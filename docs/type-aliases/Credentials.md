[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / Credentials

# Type Alias: Credentials

> **Credentials** = `object`

Defined in: [types.ts:1](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L1)

## Indexable

\[`key`: `string`\]: `any`

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [types.ts:9](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L9)

The token used to make API calls

---

### expiresAt

> **expiresAt**: `number`

Defined in: [types.ts:17](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L17)

Used to denote when the token will expire, as a UNIX timestamp

---

### idToken

> **idToken**: `string`

Defined in: [types.ts:5](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L5)

A token in JWT format that has user claims

---

### refreshToken?

> `optional` **refreshToken**: `string`

Defined in: [types.ts:21](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L21)

The token used to refresh the access token

---

### scope?

> `optional` **scope**: `string`

Defined in: [types.ts:25](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L25)

Represents the scope of the current token

---

### tokenType

> **tokenType**: `string`

Defined in: [types.ts:13](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L13)

The type of the token, e.g.: Bearer
