[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / ExchangeNativeSocialOptions

# Interface: ExchangeNativeSocialOptions

Defined in: [types.ts:271](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L271)

Options for obtaining user tokens from an external provider's token

## Indexable

\[`key`: `string`\]: `any`

## Properties

### audience?

> `optional` **audience**: `string`

Defined in: [types.ts:287](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L287)

The API audience to request

---

### scope?

> `optional` **scope**: `string`

Defined in: [types.ts:291](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L291)

The scopes requested for the issued tokens. e.g. `openid profile`

---

### subjectToken

> **subjectToken**: `string`

Defined in: [types.ts:275](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L275)

The token returned by the native social authentication solution

---

### subjectTokenType

> **subjectTokenType**: `string`

Defined in: [types.ts:279](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L279)

The identifier that indicates the native social authentication solution

---

### userProfile?

> `optional` **userProfile**: `string`

Defined in: [types.ts:283](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L283)

Additional profile attributes to set or override, only on select native social authentication solutions
