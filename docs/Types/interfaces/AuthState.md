[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / AuthState

# Interface: AuthState\<TUser\>

Defined in: [hooks/auth0-context.ts:143](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L143)

## Extended by

- [`Auth0ContextInterface`](Auth0ContextInterface.md)

## Type Parameters

### TUser

`TUser` _extends_ [`User`](../../type-aliases/User.md) = [`User`](../../type-aliases/User.md)

## Properties

### error

> **error**: `null` \| [`BaseError`](../classes/BaseError.md)

Defined in: [hooks/auth0-context.ts:147](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L147)

An object representing the last exception

---

### isLoading

> **isLoading**: `boolean`

Defined in: [hooks/auth0-context.ts:155](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L155)

A flag that is true until the state knows that a user is either logged in or not

---

### user

> **user**: `null` \| `TUser`

Defined in: [hooks/auth0-context.ts:151](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-context.ts#L151)

The user profile as decoded from the ID token after authentication
