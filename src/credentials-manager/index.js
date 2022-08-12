import {NativeModules} from 'react-native';
import CredentialsManagerError from './credentialsManagerError';

export default class CredentialsManager {
  constructor(clientId, domain) {
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
   * @param {Number} credentials.expiresIn optional - `expiresAt` should not be empty if this is. Used to denote when the token will expire from the issued time
   * @param {String} credentials.expiresAt optional - `expiresIn` should not be empty if this is. Used to denote when the token will expire. Has precendence over `expiresIn`.
   * @param {String} credentials.refreshToken optional - used to refresh access token
   * @param {String} credentials.scope optional - represents the scope of the current token
   * @returns {Promise}
   *
   * @memberof CredentialsManager
   */
  async saveCredentials(credentials = {}) {
    const validateKeys = ['idToken', 'accessToken', 'tokenType'];
    validateKeys.forEach(key => {
      if (!credentials[key]) {
        const json = {
          error: 'a0.credential_manager.invalid_input',
          error_description: `${key} cannot be empty`,
          invalid_parameter: key,
        };
        throw new CredentialsManagerError({json, status: 0});
      }
    });
    if (
      (!credentials.expiresIn || !credentials.expiresIn > 0) &&
      !credentials.expiresAt
    ) {
      const json = {
        error: 'a0.credential_manager.invalid_input',
        error_description: `expiresIn or expiresAt should be set`,
      };
      throw new CredentialsManagerError({json, status: 0});
    }
    try {
      await this.ensureCredentialManagerIsInitialized();
      await this.Auth0Module.saveCredentials(credentials);
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({json, status: 0});
    }
  }

  /**
   * Gets the credentials that has already been saved
   *
   * @param {String} scope optional - the scope to request for the access token. If null is passed, the previous scope will be kept.
   * @param {String} minTtl optional - the minimum time in seconds that the access token should last before expiration.
   * @param {Object} parameters optional - additional parameters to send in the request to refresh expired credentials.
   * @returns {Promise}
   *
   * @memberof CredentialsManager
   */
  async getCredentials(scope, minTtl = 0, parameters = {}) {
    try {
      await this.ensureCredentialManagerIsInitialized();
      const credentials = await this.Auth0Module.getCredentials(
        scope,
        minTtl,
        parameters,
      );
      return credentials;
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({json, status: 0});
    }
  }

  /**
   * Gets the credential that has already been saved
   *
   * @param {String} title optional - the text to use as title in the authentication screen. Passing null will result in using the OS's default value.
   * @param {String} description optional - the text to use as description in the authentication screen. On some Android versions it might not be shown. Passing null will result in using the OS's default value.
   * @returns {Promise}
   *
   * @memberof CredentialsManager
   */
  async requireLocalAuthentication(title, description) {
    try {
      await this.ensureCredentialManagerIsInitialized();
      const cred = await this.Auth0Module.enableLocalAuthentication(
        title,
        description,
      );
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: e.message,
      };
      throw new CredentialsManagerError({json, status: 0});
    }
  }

  /**
   * Returns whether this manager contains a valid non-expired pair of credentials.
   *
   * @param {Number} minTtl optional - the minimum time in seconds that the access token should last before expiration
   *
   * @memberof CredentialsManager
   */
  async hasValidCredentials(minTtl = 0) {
    await this.ensureCredentialManagerIsInitialized();
    return await this.Auth0Module.hasValidCredentials(minTtl);
  }

  /**
   * Delete the stored credentials
   *
   * @memberof CredentialsManager
   */
  async clearCredentials() {
    await this.ensureCredentialManagerIsInitialized();
    await this.Auth0Module.clearCredentials();
  }

  //private
  async ensureCredentialManagerIsInitialized() {
    const hasValid = await this.Auth0Module.hasValidCredentialManagerInstance();
    if (!hasValid) {
      await this.Auth0Module.initializeCredentialManager(
        this.clientId,
        this.domain,
      );
    }
  }
}
