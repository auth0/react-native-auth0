import CredentialsManagerError from './credentialsManagerError';
import type { Credentials } from '../types';
import { _ensureNativeModuleIsInitializedWithConfiguration } from '../utils/nativeHelper';
import type { LocalAuthenticationOptions } from './localAuthenticationOptions';
import A0Auth0 from '../specs/NativeA0Auth0';
import type { NativeModuleError } from '../internal-types';

class CredentialsManager {
  private domain;
  private clientId;
  private localAuthenticationOptions?: LocalAuthenticationOptions;

  /**
   * @ignore
   */
  constructor(
    domain: string,
    clientId: string,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ) {
    this.domain = domain;
    this.clientId = clientId;
    this.localAuthenticationOptions = localAuthenticationOptions;
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
      await _ensureNativeModuleIsInitializedWithConfiguration(
        A0Auth0,
        this.clientId,
        this.domain,
        this.localAuthenticationOptions
      );
      return await A0Auth0.saveCredentials(credentials);
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: (e as NativeModuleError).message,
        code: (e as NativeModuleError).code,
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
      await _ensureNativeModuleIsInitializedWithConfiguration(
        A0Auth0,
        this.clientId,
        this.domain,
        this.localAuthenticationOptions
      );
      return new Promise<Credentials>((resolve, reject) => {
        A0Auth0.getCredentials(scope, minTtl, parameters, forceRefresh)
          .then(resolve)
          .catch((e: NativeModuleError) => {
            const json = {
              error: 'a0.credential_manager.invalid',
              error_description: e.message,
              code: e.code,
            };
            reject(new CredentialsManagerError({ json, status: 0 }));
          });
      });
    } catch (e) {
      const json = {
        error: 'a0.credential_manager.invalid',
        error_description: (e as NativeModuleError).message,
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
    await _ensureNativeModuleIsInitializedWithConfiguration(
      A0Auth0,
      this.clientId,
      this.domain,
      this.localAuthenticationOptions
    );
    return await A0Auth0.hasValidCredentials(minTtl);
  }

  /**
   * Delete the stored credentials
   */
  async clearCredentials(): Promise<void> {
    await _ensureNativeModuleIsInitializedWithConfiguration(
      A0Auth0,
      this.clientId,
      this.domain,
      this.localAuthenticationOptions
    );
    return A0Auth0.clearCredentials();
  }
}

export default CredentialsManager;
