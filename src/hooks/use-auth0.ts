import {useContext} from 'react';
import Auth0Context from './auth0-context';

/**
 * @typedef {Object} Auth0ContextInterface
 * @property {Object} user The user profile as decoded from the ID token after authentication
 * @property {Object} error An object representing the last exception
 * @property {boolean} isLoading A flag that is true until the state knows that a user is either logged in or not
 * @property {Function} authorize Authorize the user using Auth0 Universal Login. See {@link WebAuth#authorize}
 * @property {Function} sendSMSCode Start the passwordless SMS login flow. See {@link Auth#passwordlessWithSMS}
 * @property {Function} authorizeWithSMS Authorize the user using a SMS code. See {@link Auth#loginWithSMS}
 * @property {Function} sendEmailCode Start the passwordless email login flow. See {@link Auth#passwordlessWithEmail}
 * @property {Function} authorizeWithEmail Authorize the user using an email code. See {@link Auth#loginWithEmail}
 * @property {Function} sendMultifactorChallenge Send a challenge for multi-factor authentication. See {@link Auth#multifactorChallenge}
 * @property {Function} authorizeWithOOB Authorize the user using an Out Of Band authentication code. See {@link Auth#loginWithOOB}
 * @property {Function} authorizeWithOTP Autohrize the user using a One Time Password code. See {@link Auth#loginWithOTP}.
 * @property {Function} authorizeWithRecoveryCode Authorize the user using a multi-factor authentication Recovery Code. See {@link Auth#loginWithRecoveryCode}
 * @property {Function} clearSession Clears the user's web session, credentials and logs them out. See {@link WebAuth#clearSession}
 * @property {Function} getCredentials Gets the user's credentials from the native credential store. See {@link CredentialsManager#getCredentials}
 * @property {Function} clearCredentials Clears the user's credentials without clearing their web session and logs them out.
 * @property {Function} requireLocalAuthentication Enables Local Authentication (PIN, Biometric, Swipe etc) to get the credentials. See {@link CredentialsManager#requireLocalAuthentication}
 */

/**
 * Use the `useAuth0` in your function components to access authentication state and methods.
 * @example
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
 *   clearSession,
 *   getCredentials,
 *   clearCredentials,
 *   requireLocalAuthentication
 * } = useAuth0();
 */
const useAuth0 = () => useContext(Auth0Context);

export default useAuth0;
