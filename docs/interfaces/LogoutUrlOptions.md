[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / LogoutUrlOptions

# Interface: LogoutUrlOptions

Defined in: [types.ts:227](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L227)

Options for the logout endpoint

## Indexable

\[`key`: `string`\]: `any`

Custom parameters to send to the logout endpoint

## Properties

### clientId?

> `optional` **clientId**: `string`

Defined in: [types.ts:235](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L235)

The client identifier of the one requesting the logout

---

### federated?

> `optional` **federated**: `boolean`

Defined in: [types.ts:231](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L231)

Whether the logout should include removing session for federated IdP.

---

### returnTo?

> `optional` **returnTo**: `string`

Defined in: [types.ts:239](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L239)

URL where the user is redirected to after logout. It must be declared in you Auth0 Dashboard
