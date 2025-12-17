import type { Credentials, SessionTransferCredentials } from '../../types';
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
   * Obtains session transfer credentials for performing Native to Web SSO.
   *
   * @remarks
   * This method exchanges the stored refresh token for a session transfer token
   * that can be used to authenticate in web contexts without requiring the user
   * to log in again. The session transfer token can be passed as a cookie or
   * query parameter to the `/authorize` endpoint to establish a web session.
   *
   * Session transfer tokens are short-lived and expire after a few minutes.
   * Once expired, they can no longer be used for web SSO.
   *
   * If Refresh Token Rotation is enabled, this method will also update the stored
   * credentials with new tokens (ID token and refresh token) returned from the
   * token exchange.
   *
   * @param parameters Optional additional parameters to pass to the token exchange.
   * @param headers Optional additional headers to include in the token exchange request. **iOS only** - this parameter is ignored on Android.
   * @returns A promise that resolves with the session transfer credentials.
   *
   * @example
   * ```typescript
   * // Get session transfer credentials
   * const ssoCredentials = await auth0.credentialsManager.getSSOCredentials();
   *
   * // Option 1: Use as a cookie
   * const cookie = `auth0_session_transfer_token=${ssoCredentials.sessionTransferToken}; path=/; domain=.yourdomain.com; secure; httponly`;
   * document.cookie = cookie;
   *
   * // Option 2: Use as a query parameter
   * const authorizeUrl = `https://${domain}/authorize?session_transfer_token=${ssoCredentials.sessionTransferToken}&...`;
   * window.location.href = authorizeUrl;
   * ```
   *
   * @see https://auth0.com/docs/authenticate/single-sign-on/native-to-web/configure-implement-native-to-web
   */
  getSSOCredentials(
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<SessionTransferCredentials>;

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
   * Optionally filter by scope to clear only specific scope-based credentials.
   *
   * This clears the stored API credentials for the given audience, forcing the next
   * `getApiCredentials` call for this audience to perform a fresh token exchange.
   *
   * @param audience The identifier of the API for which to clear credentials.
   * @param scope Optional scope to clear. If not provided, clears all credentials for the audience.
   * @returns A promise that resolves when the credentials are cleared.
   * @throws {CredentialsManagerError} If the operation fails.
   *
   * @example
   * ```typescript
   * // Clear all credentials for an audience
   * await credentialsManager.clearApiCredentials('https://api.example.com');
   *
   * // Clear credentials for specific scope
   * await credentialsManager.clearApiCredentials('https://api.example.com', 'read:data');
   * ```
   */
  clearApiCredentials(audience: string, scope?: string): Promise<void>;
}
