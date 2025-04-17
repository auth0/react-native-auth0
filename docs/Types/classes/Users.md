[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / Users

# Class: Users

Defined in: [management/users.ts:39](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/management/users.ts#L39)

Auth0 Management API User endpoints

## Export

## See

https://auth0.com/docs/api/management/v2#!/Users/
Users

## Methods

### getUser()

> **getUser**(`parameters`): `Promise`\<[`User`](../../type-aliases/User.md)\>

Defined in: [management/users.ts:67](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/management/users.ts#L67)

Returns the user by identifier

#### Parameters

##### parameters

[`GetUserOptions`](../../interfaces/GetUserOptions.md)

get user by identifier parameters

#### Returns

`Promise`\<[`User`](../../type-aliases/User.md)\>

#### See

https://auth0.com/docs/api/management/v2#!/Users/get_users_by_id

#### Memberof

Users

---

### patchUser()

> **patchUser**(`parameters`): `Promise`\<[`User`](../../type-aliases/User.md)\>

Defined in: [management/users.ts:90](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/management/users.ts#L90)

Patch a user's `user_metadata`

#### Parameters

##### parameters

[`PatchUserOptions`](../../interfaces/PatchUserOptions.md)

patch user metadata parameters

#### Returns

`Promise`\<[`User`](../../type-aliases/User.md)\>

#### See

https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id

#### Memberof

Users
