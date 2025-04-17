[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / PasswordlessWithEmailOptions

# Interface: PasswordlessWithEmailOptions

Defined in: [types.ts:340](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L340)

Options for requesting passwordless login using email

## Indexable

\[`key`: `string`\]: `any`

## Properties

### authParams?

> `optional` **authParams**: `object`

Defined in: [types.ts:352](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L352)

Optional parameters, used when strategy is 'linḱ'

---

### email

> **email**: `string`

Defined in: [types.ts:344](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L344)

The email to send the link/code to

---

### send?

> `optional` **send**: `string`

Defined in: [types.ts:348](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L348)

The passwordless strategy, either 'link' or 'code'
