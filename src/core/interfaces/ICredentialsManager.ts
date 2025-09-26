import type { Credentials } from '../../types';
import { ApiCredentials } from '../models';

/**
 * Defines the contract for securely managing user credentials on the device.
 * Implementations are responsible for secure storage (e.g., Keychain on iOS,
 * EncryptedSharedPreferences on Android) and token refresh logic.
 */
export interface ICredentialsManager {
  /**
   * Securely saves a set of credentials to the device's storage.
   *
   * @param credentials The credentials object to store.
   * @returns A promise that resolves when the credentials have been saved.
   */
  saveCredentials(credentials: Credentials): Promise<void>;

  /**
   * Retrieves the stored credentials.
   *
   * @remarks
   * If the access token is expired and a refresh token is available, this method
   * should attempt to automatically refresh the tokens and store the new ones.
   *
   * @param scope The scopes to request for the new access token (used during refresh).
   * @param minTtl The minimum time-to-live (in seconds) required for the access token. If the token expires sooner, a refresh will be attempted.
   * @param parameters Additional parameters to send during the token refresh request.
   * @param forceRefresh If true, a token refresh will be attempted even if the current access token is not expired.
   * @returns A promise that resolves with the user's credentials.
   */
  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials>;

  /**
   * Checks if a valid, non-expired set of credentials exists in storage.
   *
   * @param minTtl The minimum time-to-live (in seconds) required for the access token to be considered valid.
   * @returns A promise that resolves with `true` if valid credentials exist, `false` otherwise.
   */
  hasValidCredentials(minTtl?: number): Promise<boolean>;

  /**
   * Removes all credentials from the device's storage.
   *
   * @returns A promise that resolves when the credentials have been cleared.
   */
  clearCredentials(): Promise<void>;

  /**
   * Retrieves API-specific credentials.
   *
   * @remarks
   * This method obtains an access token for a specific API (audience). If a valid
   * token is already cached, it's returned. Otherwise, it uses the refresh token
   * to get a new one.
   *
   * @param audience The identifier of the API for which to get credentials.
   * @param scope The scopes to request for the new access token.
   * @param parameters Additional parameters to send during the token refresh request.
   * @returns A promise that resolves with the API credentials.
   */
  getApiCredentials(
    audience: string,
    scope?: string,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials>;

  /** Removes cached credentials for a specific audience. */
  clearApiCredentials(audience: string): Promise<void>;
}
