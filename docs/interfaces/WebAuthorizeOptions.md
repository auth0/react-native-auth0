[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / WebAuthorizeOptions

# Interface: WebAuthorizeOptions

Defined in: [types.ts:110](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L110)

Options for controlling the SDK's behaviour when calling the `/authorize` endpoint.

## Properties

### customScheme?

> `optional` **customScheme**: `string`

Defined in: [types.ts:124](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L124)

Custom scheme to build the callback URL with.

---

### ephemeralSession?

> `optional` **ephemeralSession**: `boolean`

Defined in: [types.ts:120](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L120)

**iOS only**: Disable Single-Sign-On (SSO). It only affects iOS with versions 13 and above.

#### Default

`false`

---

### leeway?

> `optional` **leeway**: `number`

Defined in: [types.ts:115](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L115)

The amount of leeway, in seconds, to accommodate potential clock skew when validating an ID token's claims.

#### Default

60 seconds.

---

### useLegacyCallbackUrl?

> `optional` **useLegacyCallbackUrl**: `boolean`

Defined in: [types.ts:128](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L128)

This will use older callback URL. See [https://github.com/auth0/react-native-auth0/blob/master/MIGRATION_GUIDE.md#callback-url-migration](https://github.com/auth0/react-native-auth0/blob/master/MIGRATION_GUIDE.md#callback-url-migration) for more details.

---

### useSFSafariViewController?

> `optional` **useSFSafariViewController**: `boolean` \| \{ `presentationStyle`: [`SafariViewControllerPresentationStyle`](../enumerations/SafariViewControllerPresentationStyle.md); \}

Defined in: [types.ts:146](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/types.ts#L146)

**iOS only:** Uses `SFSafariViewController` instead of `ASWebAuthenticationSession`. If empty object is set, the presentationStyle defaults to [SafariViewControllerPresentationStyle.fullScreen](../enumerations/SafariViewControllerPresentationStyle.md#fullscreen)

This can be used as a boolean value or as an object which sets the `presentationStyle`. See the examples below for reference

#### Examples

```typescript
await authorize({}, { useSFSafariViewController: true });
```

or

```typescript
await authorize(
  {},
  {
    useSFSafariViewController: {
      presentationStyle: SafariViewControllerPresentationStyle.fullScreen,
    },
  }
);
```
