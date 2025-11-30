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
   * Retrieves API-specific credentials for a given audience using the Multi-Resource Refresh Token (MRRT).
   *
   * @remarks
   * This method obtains an access token for a specific API (audience). If a valid
   * token is already cached, it's returned. Otherwise, it uses the refresh token
   * to get a new one.
   *
   * @param audience The identifier of the API for which to get credentials (e.g., 'https://api.example.com').
   * @param scope The scopes to request for the new access token. If omitted, default scopes configured for the API will be used.
   * @param minTtl The minimum time-to-live (in seconds) required for the access token. If the token expires sooner, a refresh will be attempted.
   * @param parameters Additional parameters to send during the token refresh request.
   * @returns A promise that resolves with the API credentials.
   * @throws {CredentialsManagerError} If the operation fails. Common error types include:
   *   - `NO_CREDENTIALS`: No stored credentials found
   *   - `NO_REFRESH_TOKEN`: Refresh token is not available (ensure 'offline_access' scope was requested during login)
   *   - `API_EXCHANGE_FAILED`: Token exchange for API credentials failed
   *   - `STORE_FAILED`: Failed to store API credentials
   *   - `LARGE_MIN_TTL`: Requested minimum TTL exceeds token lifetime
   *   - `NO_NETWORK`: Network error during token exchange
   *
   * @example
   * ```typescript
   * try {
   *   const apiCredentials = await credentialsManager.getApiCredentials(
   *     'https://api.example.com',
   *     'read:data write:data'
   *   );
   *   console.log('Access Token:', apiCredentials.accessToken);
   * } catch (error) {
   *   if (error instanceof CredentialsManagerError) {
   *     console.log('Error type:', error.type);
   *   }
   * }
   * ```
   */
  getApiCredentials(
    audience: string,
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials>;

  /**
   * Removes cached credentials for a specific audience.
   *
   * This clears the stored API credentials for the given audience, forcing the next
   * `getApiCredentials` call for this audience to perform a fresh token exchange.
   *
   * @param audience The identifier of the API for which to clear credentials.
   * @returns A promise that resolves when the credentials are cleared.
   * @throws {CredentialsManagerError} If the operation fails.
   *
   * @example
   * ```typescript
   * await credentialsManager.clearApiCredentials('https://api.example.com');
   * ```
   */
  clearApiCredentials(audience: string): Promise<void>;
}
