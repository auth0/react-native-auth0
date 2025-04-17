[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / MultifactorChallengeOptions

# Interface: MultifactorChallengeOptions

Defined in: [types.ts:480](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L480)

Options for multifactor challenge.

## Indexable

\[`key`: `string`\]: `any`

## Properties

### authenticatorId?

> `optional` **authenticatorId**: `string`

Defined in: [types.ts:494](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L494)

The ID of the authenticator to challenge.

---

### challengeType?

> `optional` **challengeType**: `string`

Defined in: [types.ts:490](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L490)

A whitespace-separated list of the challenges types accepted by your application.
Accepted challenge types are oob or otp. Excluding this parameter means that your client application
accepts all supported challenge types.

---

### mfaToken

> **mfaToken**: `string`

Defined in: [types.ts:484](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L484)

The token received in the previous login response
