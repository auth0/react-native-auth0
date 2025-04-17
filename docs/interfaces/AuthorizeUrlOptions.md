[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / AuthorizeUrlOptions

# Interface: AuthorizeUrlOptions

Defined in: [types.ts:205](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L205)

Options for building a URL for `/authorize`

## Indexable

\[`key`: `string`\]: `any`

Custom parameters to send to `/authorize`

## Properties

### redirectUri

> **redirectUri**: `object`

Defined in: [types.ts:213](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L213)

Where the authorization server will redirect back after success or failure.

---

### responseType

> **responseType**: `string`

Defined in: [types.ts:209](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L209)

The response_type value

---

### state

> **state**: `object`

Defined in: [types.ts:217](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L217)

Random string to prevent CSRF attacks.
