[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / Auth0Provider

# Function: Auth0Provider()

> **Auth0Provider**(`__namedParameters`): `Element`

Defined in: [hooks/auth0-provider.tsx:74](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/auth0-provider.tsx#L74)

Provides the Auth0Context to its child components.

## Parameters

### \_\_namedParameters

`PropsWithChildren`\<\{ `clientId`: `string`; `domain`: `string`; `localAuthenticationOptions`: [`LocalAuthenticationOptions`](../interfaces/LocalAuthenticationOptions.md); `timeout`: `number`; \}\>

## Returns

`Element`

## Example

```ts
<Auth0Provider domain="YOUR AUTH0 DOMAIN" clientId="YOUR CLIENT ID">
  <App />
</Auth0Provider>
```
