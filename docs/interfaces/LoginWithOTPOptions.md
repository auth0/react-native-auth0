[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / LoginWithOTPOptions

# Interface: LoginWithOTPOptions

Defined in: [types.ts:424](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L424)

Options for logging in using an OTP code

## Indexable

\[`key`: `string`\]: `any`

## Properties

### audience?

> `optional` **audience**: `string`

Defined in: [types.ts:437](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L437)

The API audience

---

### mfaToken

> **mfaToken**: `string`

Defined in: [types.ts:428](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L428)

The token received in the previous login response

---

### otp

> **otp**: `string`

Defined in: [types.ts:433](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L433)

The one time password code provided by the resource owner, typically obtained
from an MFA application such as Google Authenticator or Guardian.
