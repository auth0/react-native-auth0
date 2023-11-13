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
   * @ignore
   */
  constructor(domain: string, clientId: string) {
    this.domain = domain;
    this.clientId = clientId;
    this.Auth0Module = NativeModules.A0Auth0;
  }

  /**
   * Saves the provided credentials
   */
  async saveCredentials(credentials: Credentials): Promise<void> {
    const validateKeys = ['idToken', 'accessToken', 'tokenType', 'expiresAt'];
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
   * @param scope The scope to request for the access token. If null is passed, the previous scope will be kept.
   * @param minTtl The minimum time in seconds that the access token should last before expiration.
   * @param parameters Additional parameters to send in the request to refresh expired credentials.
   * @param forceRefresh Whether to force refresh the credentials. It will work only if the refresh token already exists. For iOS, doing forceRefresh will not send the scope. Since scope change already does force refresh, it is better to avoid force refresh if the scope is being changed.
   * @returns A populated instance of {@link Credentials}.
   */
  async getCredentials(
    scope?: string,
    minTtl: number = 0,
    parameters: Record<string, unknown> = {},
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
   * @param title the text to use as title in the authentication screen. Passing null will result in using the OS's default value in Android and "Please authenticate to continue" in iOS.
   * @param description **Android only:** the text to use as description in the authentication screen. On some Android versions it might not be shown. Passing null will result in using the OS's default value.
   * @param cancelTitle **iOS only:** the cancel message to display on the local authentication prompt.
   * @param fallbackTitle **iOS only:** the fallback message to display on the local authentication prompt after a failed match.
   * @param strategy **iOS only:** the evaluation policy to use when accessing the credentials. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics.
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
   * @param minTtl The minimum time in seconds that the access token should last before expiration
   * @returns `true` if a valid set of credentials are available, or `false` if there are no credentials to return.
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
