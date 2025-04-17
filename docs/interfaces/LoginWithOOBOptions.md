[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / LoginWithOOBOptions

# Interface: LoginWithOOBOptions

Defined in: [types.ts:444](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L444)

Options for logging in using an OOB code

## Indexable

\[`key`: `string`\]: `any`

## Properties

### bindingCode?

> `optional` **bindingCode**: `string`

Defined in: [types.ts:458](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L458)

The code used to bind the side channel (used to deliver the challenge) with the
main channel you are using to authenticate. This is usually an OTP-like code
delivered as part of the challenge message.

---

### mfaToken

> **mfaToken**: `string`

Defined in: [types.ts:448](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L448)

The token received in the previous login response

---

### oobCode

> **oobCode**: `string`

Defined in: [types.ts:452](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L452)

The out of band code received in the challenge response.
