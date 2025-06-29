import { useContext } from 'react';
import Auth0Context from './auth0-context';
import type { Auth0ContextInterface } from './auth0-context';

/**
 * Use the `useAuth0` in your function components to access authentication state and methods.
 * @returns {Auth0ContextInterface} The useAuth0 hook interface
 *
 * ```ts
 * const {
 *   // State
 *   error,
 *   user,
 *   isLoading,
 *   // Methods
 *   authorize,
 *   sendSMSCode,
 *   authorizeWithSMS,
 *   sendEmailCode,
 *   authorizeWithEmail,
 *   sendMultifactorChallenge,
 *   authorizeWithOOB,
 *   authorizeWithOTP,
 *   authorizeWithRecoveryCode,
 *   hasValidCredentials,
 *   clearSession,
 *   getCredentials,
 *   clearCredentials,
 *   requireLocalAuthentication,
 *   authorizeWithPasswordRealm,
 *   authorizeWithExchangeNativeSocial,
 *   revokeRefreshToken
 * } = useAuth0();
 * ```
 *
 * Refer to {@link Auth0ContextInterface} on how to use the above methods.
 */
const useAuth0 = (): Auth0ContextInterface => useContext(Auth0Context);

export default useAuth0;
