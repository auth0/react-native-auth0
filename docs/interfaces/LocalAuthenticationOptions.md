[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / LocalAuthenticationOptions

# Interface: LocalAuthenticationOptions

Defined in: [credentials-manager/localAuthenticationOptions.ts:8](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L8)

The options for configuring the display of local authentication prompt, authentication level (Android only) and evaluation policy (iOS only).

## Properties

### authenticationLevel?

> `optional` **authenticationLevel**: [`LocalAuthenticationLevel`](../enumerations/LocalAuthenticationLevel.md)

Defined in: [credentials-manager/localAuthenticationOptions.ts:36](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L36)

The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**

---

### cancelTitle?

> `optional` **cancelTitle**: `String`

Defined in: [credentials-manager/localAuthenticationOptions.ts:24](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L24)

The cancel button title of the authentication prompt. **Applicable for both Android and iOS.**

---

### description?

> `optional` **description**: `String`

Defined in: [credentials-manager/localAuthenticationOptions.ts:20](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L20)

The description of the authentication prompt. **Applicable for Android only.**

---

### deviceCredentialFallback?

> `optional` **deviceCredentialFallback**: `Boolean`

Defined in: [credentials-manager/localAuthenticationOptions.ts:40](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L40)

Should the user be given the option to authenticate with their device PIN, pattern, or password instead of a biometric. **Applicable for Android only.**

---

### evaluationPolicy?

> `optional` **evaluationPolicy**: [`LocalAuthenticationStrategy`](../enumerations/LocalAuthenticationStrategy.md)

Defined in: [credentials-manager/localAuthenticationOptions.ts:28](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L28)

The evaluation policy to use when prompting the user for authentication. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics. **Applicable for iOS only.**

---

### fallbackTitle?

> `optional` **fallbackTitle**: `String`

Defined in: [credentials-manager/localAuthenticationOptions.ts:32](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L32)

The fallback button title of the authentication prompt. **Applicable for iOS only.**

---

### subtitle?

> `optional` **subtitle**: `String`

Defined in: [credentials-manager/localAuthenticationOptions.ts:16](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L16)

The subtitle of the authentication prompt. **Applicable for Android only.**

---

### title

> **title**: `String`

Defined in: [credentials-manager/localAuthenticationOptions.ts:12](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationOptions.ts#L12)

The title of the authentication prompt. **Applicable for both Android and iOS**.
