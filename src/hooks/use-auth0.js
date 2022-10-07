import {useContext} from 'react';
import Auth0Context from './auth0-context';

/**
 * @typedef {Object} Auth0ContextInterface
 * @property {Object} user The user profile as decoded from the ID token after authentication
 * @property {Object} error An object representing the last exception
 * @property {Function} authorize Authorize the user using Auth0 Universal Login. See {@link WebAuth#authorize}
 * @property {Function} clearSession Clears the user's session and logs them out. See {@link WebAuth#clearSession}
 * @property {Function} getCredentials Gets the user's credentials from the native credential store. See {@link CredentialsManager#getCredentials}
 * @property {Function} requireLocalAuthentication Enables Local Authentication (PIN, Biometric, Swipe etc) to get the credentials. See {@link CredentialsManager#requireLocalAuthentication}
 */

/**
 * Use the `useAuth0` in your function components to access authentication state and methods.
 * @returns {Auth0ContextInterface} The useAuth0 hook interface
 * @example
 * const {
 *   // State
 *   error,
 *   user,
 *   // Methods
 *   authorize,
 *   clearSession,
 *   getCredentials,
 *   requireLocalAuthentication
 * } = useAuth0();
 */
const useAuth0 = () => useContext(Auth0Context);

export default useAuth0;
