import LocalAuthenticationStrategy from './localAuthenticationStrategy';
import { Credentials } from '../types';
export interface ICredentialsManager {
  saveCredentials(credentials: Credentials): Promise<void>;
  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, unknown>
  ): Promise<Credentials>;
  requireLocalAuthentication(
    title?: string,
    description?: string,
    cancelTitle?: string,
    fallbackTitle?: string,
    strategy?: LocalAuthenticationStrategy
  ): Promise<void>;
  hasValidCredentials(minTtl?: number): Promise<boolean>;
  clearCredentials(): Promise<void>;
}
declare class CredentialsManager implements ICredentialsManager {
  private domain;
  private clientId;
  private Auth0Module;
  /**
   * Construct an instance of CredentialsManager
   **/
  constructor(domain: string, clientId: string);
  /**
   * Saves the provided credentials
   *
   * @param {Object} credentials credential values
   * @param {String} credentials.idToken required - JWT token that has user claims
   * @param {String} credentials.accessToken required - token used for API calls
   * @param {String} credentials.tokenType required - type of the token, ex - Bearer
   * @param {Number} credentials.expiresIn required - Used to denote when the token will expire from the issued time
   * @param {String} credentials.refreshToken optional - used to refresh access token
   * @param {String} credentials.scope optional - represents the scope of the current token
   * @returns {Promise}
   */
  saveCredentials(credentials: Credentials): Promise<void>;
  /**
   * Gets the credentials that has already been saved
   *
   * @param {String} scope optional - the scope to request for the access token. If null is passed, the previous scope will be kept.
   * @param {String} minTtl optional - the minimum time in seconds that the access token should last before expiration.
   * @param {Object} parameters optional - additional parameters to send in the request to refresh expired credentials.
   * @returns {Promise}
   */
  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, unknown>
  ): Promise<Credentials>;
  /**
   * Enables Local Authentication (PIN, Biometric, Swipe etc) to get the credentials
   *
   * @param {String} title optional - the text to use as title in the authentication screen. Passing null will result in using the OS's default value in Android and "Please authenticate to continue" in iOS.
   * @param {String} description Android Only - optional - the text to use as description in the authentication screen. On some Android versions it might not be shown. Passing null will result in using the OS's default value.
   * @param {String} cancelTitle iOS Only - optional - the cancel message to display on the local authentication prompt.
   * @param {String} fallbackTitle iOS Only - optional - the fallback message to display on the local authentication prompt after a failed match.
   * @param {Number} strategy iOS Only - optional - the evaluation policy to use when accessing the credentials. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics.
   * @returns {Promise}
   */
  requireLocalAuthentication(
    title?: string,
    description?: string,
    cancelTitle?: string,
    fallbackTitle?: string,
    strategy?: LocalAuthenticationStrategy
  ): Promise<void>;
  /**
   * Returns whether this manager contains a valid non-expired pair of credentials.
   *
   * @param {Number} minTtl optional - the minimum time in seconds that the access token should last before expiration
   */
  hasValidCredentials(minTtl?: number): Promise<boolean>;
  /**
   * Delete the stored credentials
   */
  clearCredentials(): Promise<void>;
  private _ensureCredentialManagerIsInitialized;
}
export default CredentialsManager;
