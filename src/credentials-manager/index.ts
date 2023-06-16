import { NativeModules, Platform } from 'react-native';
import CredentialsManagerError from './credentialsManagerError';
import LocalAuthenticationStrategy from './localAuthenticationStrategy';
import { Credentials } from '../types';
import { Auth0Module } from 'src/internal-types';
import { _ensureNativeModuleIsInitialized } from '../utils/nativeHelper';

class CredentialsManager {
  private domain;
  private clientId;
  private Auth0Module: Auth0Module;

  /**
   * Construct an instance of CredentialsManager
   *
   * @param {String} domain - required - the domain of the credentials to be managed
   * @param {String} clientId - required - clientId of the credentials to be managed
   */
  constructor(domain: string, clientId: string) {
    this.domain = domain;
    this.clientId = clientId;
    this.Auth0Module = NativeModules.A0Auth0;
  }

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
  async saveCredentials(credentials: Credentials): Promise<void> {
    const validateKeys = ['idToken', 'accessToken', 'tokenType', 'expiresIn'];
    validateKeys.forEach((key) => {
      if (!credentials[key]) {
        const json = {
          error: 'a0.credential_manager.invalid_input',
          error_description: `${key} cannot be empty`,
          invalid_parameter: key,
        };
        throw new CredentialsManagerError({ json, status: 0 });
      }
    });
    try {
      await _ensureNativeModuleIsInitialized(
        this.Auth0Module,
        this.clientId,
        this.domain
      );
      return await this.Auth0Module.saveCredentials(credentials);
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({ json, status: 0 });
    }
  }

  /**
   * Gets the credentials that has already been saved
   *
   * @param {String} scope optional - the scope to request for the access token. If null is passed, the previous scope will be kept.
   * @param {String} minTtl optional - the minimum time in seconds that the access token should last before expiration.
   * @param {Object} parameters optional - additional parameters to send in the request to refresh expired credentials.
   * @param {Object} forceRefresh optional - to force refresh the credentials. It will work only if refresh token already exists.
   * @returns {Promise}
   */
  async getCredentials(
    scope?: string,
    minTtl: number = 0,
    parameters: object = {},
    forceRefresh: boolean = false
  ): Promise<Credentials> {
    try {
      await _ensureNativeModuleIsInitialized(
        this.Auth0Module,
        this.clientId,
        this.domain
      );
      return this.Auth0Module.getCredentials(
        scope,
        minTtl,
        parameters,
        forceRefresh
      );
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({ json, status: 0 });
    }
  }

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
  async requireLocalAuthentication(
    title?: string,
    description?: string,
    cancelTitle?: string,
    fallbackTitle?: string,
    strategy = LocalAuthenticationStrategy.deviceOwnerWithBiometrics
  ): Promise<void> {
    try {
      await _ensureNativeModuleIsInitialized(
        this.Auth0Module,
        this.clientId,
        this.domain
      );
      if (Platform.OS === 'ios') {
        await this.Auth0Module.enableLocalAuthentication(
          title,
          cancelTitle,
          fallbackTitle,
          strategy
        );
      } else {
        await this.Auth0Module.enableLocalAuthentication(title, description);
      }
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({ json, status: 0 });
    }
  }

  /**
   * Returns whether this manager contains a valid non-expired pair of credentials.
   *
   * @param {Number} minTtl optional - the minimum time in seconds that the access token should last before expiration
   */
  async hasValidCredentials(minTtl = 0): Promise<boolean> {
    await _ensureNativeModuleIsInitialized(
      this.Auth0Module,
      this.clientId,
      this.domain
    );
    return await this.Auth0Module.hasValidCredentials(minTtl);
  }

  /**
   * Delete the stored credentials
   */
  async clearCredentials(): Promise<void> {
    await _ensureNativeModuleIsInitialized(
      this.Auth0Module,
      this.clientId,
      this.domain
    );
    return this.Auth0Module.clearCredentials();
  }
}

export default CredentialsManager;
