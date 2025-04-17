[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / LocalAuthenticationLevel

# Enumeration: LocalAuthenticationLevel

Defined in: [credentials-manager/localAuthenticationLevel.ts:5](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationLevel.ts#L5)

**Used for Android only:** The level of local authentication required to access the credentials. Defaults to LocalAuthenticationLevel.strong.

## Enumeration Members

### deviceCredential

> **deviceCredential**: `2`

Defined in: [credentials-manager/localAuthenticationLevel.ts:17](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationLevel.ts#L17)

The non-biometric credential used to secure the device (i. e. PIN, pattern, or password).

---

### strong

> **strong**: `0`

Defined in: [credentials-manager/localAuthenticationLevel.ts:9](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationLevel.ts#L9)

Any biometric (e.g. fingerprint, iris, or face) on the device that meets or exceeds the requirements for Class 3 (formerly Strong), as defined by the Android CDD.

---

### weak

> **weak**: `1`

Defined in: [credentials-manager/localAuthenticationLevel.ts:13](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/credentials-manager/localAuthenticationLevel.ts#L13)

Any biometric (e.g. fingerprint, iris, or face) on the device that meets or exceeds the requirements for Class 2 (formerly Weak), as defined by the Android CDD.
