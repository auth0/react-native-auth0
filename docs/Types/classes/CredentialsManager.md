[**react-native-auth0**](../../README.md)

---

[react-native-auth0](../../globals.md) / [Types](../README.md) / CredentialsManager

# Class: CredentialsManager

Defined in: [credentials-manager/index.ts:8](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/index.ts#L8)

## Methods

### clearCredentials()

> **clearCredentials**(): `Promise`\<`void`\>

Defined in: [credentials-manager/index.ts:123](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/index.ts#L123)

Delete the stored credentials

#### Returns

`Promise`\<`void`\>

---

### getCredentials()

> **getCredentials**(`scope?`, `minTtl?`, `parameters?`, `forceRefresh?`): `Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

Defined in: [credentials-manager/index.ts:70](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/index.ts#L70)

Gets the credentials that has already been saved

#### Parameters

##### scope?

`string`

The scope to request for the access token. If null is passed, the previous scope will be kept.

##### minTtl?

`number` = `0`

The minimum time in seconds that the access token should last before expiration.

##### parameters?

`Record`\<`string`, `unknown`\> = `{}`

Additional parameters to send in the request to refresh expired credentials.

##### forceRefresh?

`boolean` = `false`

Whether to force refresh the credentials. It will work only if the refresh token already exists. For iOS, doing forceRefresh will not send the scope. Since scope change already does force refresh, it is better to avoid force refresh if the scope is being changed.

#### Returns

`Promise`\<[`Credentials`](../../type-aliases/Credentials.md)\>

A populated instance of [Credentials](../../type-aliases/Credentials.md).

---

### hasValidCredentials()

> **hasValidCredentials**(`minTtl`): `Promise`\<`boolean`\>

Defined in: [credentials-manager/index.ts:110](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/index.ts#L110)

Returns whether this manager contains a valid non-expired pair of credentials.

#### Parameters

##### minTtl

`number` = `0`

The minimum time in seconds that the access token should last before expiration

#### Returns

`Promise`\<`boolean`\>

`true` if a valid set of credentials are available, or `false` if there are no credentials to return.

---

### saveCredentials()

> **saveCredentials**(`credentials`): `Promise`\<`void`\>

Defined in: [credentials-manager/index.ts:31](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/index.ts#L31)

Saves the provided credentials

#### Parameters

##### credentials

[`Credentials`](../../type-aliases/Credentials.md)

#### Returns

`Promise`\<`void`\>
