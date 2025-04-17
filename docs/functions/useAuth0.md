[**react-native-auth0**](../README.md)

---

[react-native-auth0](../globals.md) / useAuth0

# Function: useAuth0()

> **useAuth0**(): [`Auth0ContextInterface`](../Types/interfaces/Auth0ContextInterface.md)\<[`User`](../type-aliases/User.md)\>

Defined in: [hooks/use-auth0.ts:38](https://github.com/auth0/react-native-auth0/blob/64b3136e2ba68da80f979438fc7bc3abab9becdd/src/hooks/use-auth0.ts#L38)

Use the `useAuth0` in your function components to access authentication state and methods.

## Returns

[`Auth0ContextInterface`](../Types/interfaces/Auth0ContextInterface.md)\<[`User`](../type-aliases/User.md)\>

The useAuth0 hook interface

```ts
const {
  // State
  error,
  user,
  isLoading,
  // Methods
  authorize,
  sendSMSCode,
  authorizeWithSMS,
  sendEmailCode,
  authorizeWithEmail,
  sendMultifactorChallenge,
  authorizeWithOOB,
  authorizeWithOTP,
  authorizeWithRecoveryCode,
  hasValidCredentials,
  clearSession,
  getCredentials,
  clearCredentials,
  requireLocalAuthentication,
  authorizeWithPasswordRealm,
  authorizeWithExchangeNativeSocial,
  revokeRefreshToken,
} = useAuth0();
```

Refer to [Auth0ContextInterface](../Types/interfaces/Auth0ContextInterface.md) on how to use the above methods.
