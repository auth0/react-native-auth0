[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / PasswordlessWithSMSOptions

# Interface: PasswordlessWithSMSOptions

Defined in: [types.ts:359](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L359)

Options for requesting passwordless login using SMS

## Indexable

\[`key`: `string`\]: `any`

## Properties

### authParams?

> `optional` **authParams**: `object`

Defined in: [types.ts:371](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L371)

Optional passwordless parameters

---

### phoneNumber

> **phoneNumber**: `string`

Defined in: [types.ts:363](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L363)

The phone number to send the link/code to

---

### send?

> `optional` **send**: `string`

Defined in: [types.ts:367](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L367)

The passwordless strategy, either 'link' or 'code'
