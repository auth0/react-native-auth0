[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / ExchangeOptions

# Interface: ExchangeOptions

Defined in: [types.ts:249](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L249)

Options for the `/oauth/token` endpoint to exchange a code for an access token

## Indexable

\[`key`: `string`\]: `any`

Custom parameters to send to the /oauth/token endpoint

## Properties

### code

> **code**: `string`

Defined in: [types.ts:253](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L253)

The code returned by `/authorize`.

---

### redirectUri

> **redirectUri**: `string`

Defined in: [types.ts:261](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L261)

The original redirectUri used when calling `/authorize`.

---

### verifier

> **verifier**: `string`

Defined in: [types.ts:257](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L257)

The value used to generate the code challenge sent to `/authorize`.
