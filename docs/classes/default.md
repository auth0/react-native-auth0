[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / default

# Class: default

Defined in: [auth0.ts:12](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L12)

Auth0 for React Native client

## Constructors

### Constructor

> **new default**(`options`): `Auth0`

Defined in: [auth0.ts:28](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L28)

Creates an instance of Auth0.

#### Parameters

##### options

Your Auth0 application information

###### clientId

`string`

Your Auth0 application client identifier

###### domain

`string`

Your Auth0 domain

###### localAuthenticationOptions?

[`LocalAuthenticationOptions`](../interfaces/LocalAuthenticationOptions.md)

The options for configuring the display of local authentication prompt, authentication level (Android only) and evaluation policy (iOS only).

###### telemetry?

[`Telemetry`](../Types/type-aliases/Telemetry.md)

The telemetry information to be sent along with the requests

###### timeout?

`number`

Timeout to be set for requests.

###### token?

`string`

Token to be used for Management APIs

#### Returns

`Auth0`

## Properties

### auth

> **auth**: [`Auth`](../Types/classes/Auth.md)

Defined in: [auth0.ts:13](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L13)

---

### credentialsManager

> **credentialsManager**: [`CredentialsManager`](../Types/classes/CredentialsManager.md)

Defined in: [auth0.ts:15](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L15)

---

### webAuth

> **webAuth**: [`WebAuth`](../Types/classes/WebAuth.md)

Defined in: [auth0.ts:14](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L14)

## Methods

### users()

> **users**(`token`): [`Users`](../Types/classes/Users.md)

Defined in: [auth0.ts:55](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/auth0.ts#L55)

Creates a Users API client

#### Parameters

##### token

`string`

for Management API

#### Returns

[`Users`](../Types/classes/Users.md)
