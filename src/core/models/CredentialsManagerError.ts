import { AuthError } from './AuthError';

const ERROR_CODE_MAP: Record<string, string> = {
  // --- Core CredentialsManager error codes ---
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NO_CREDENTIALS: 'NO_CREDENTIALS',
  NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN',
  RENEW_FAILED: 'RENEW_FAILED',
  STORE_FAILED: 'STORE_FAILED',
  REVOKE_FAILED: 'REVOKE_FAILED',
  LARGE_MIN_TTL: 'LARGE_MIN_TTL',
  CREDENTIAL_MANAGER_ERROR: 'CREDENTIAL_MANAGER_ERROR',
  BIOMETRICS_FAILED: 'BIOMETRICS_FAILED',
  NO_NETWORK: 'NO_NETWORK',
  API_ERROR: 'API_ERROR',

  // --- API Credentials (MRRT) specific codes ---
  API_EXCHANGE_FAILED: 'API_EXCHANGE_FAILED',

  // --- Web (@auth0/auth0-spa-js) mappings ---
  login_required: 'NO_CREDENTIALS',
  consent_required: 'RENEW_FAILED',
  mfa_required: 'RENEW_FAILED',
  invalid_grant: 'RENEW_FAILED',
  invalid_refresh_token: 'RENEW_FAILED',
  missing_refresh_token: 'NO_REFRESH_TOKEN',
  invalid_request: 'API_ERROR',
  invalid_scope: 'API_ERROR',
  server_error: 'API_ERROR',
  temporarily_unavailable: 'NO_NETWORK',

  // --- iOS-specific mappings ---
  renewFailed: 'RENEW_FAILED',
  apiExchangeFailed: 'API_EXCHANGE_FAILED',
  noCredentials: 'NO_CREDENTIALS',
  noRefreshToken: 'NO_REFRESH_TOKEN',
  storeFailed: 'STORE_FAILED',
  largeMinTTL: 'LARGE_MIN_TTL',

  // --- Many-to-one mapping for granular Android Biometric errors ---
  INCOMPATIBLE_DEVICE: 'INCOMPATIBLE_DEVICE',
  CRYPTO_EXCEPTION: 'CRYPTO_EXCEPTION',
  BIOMETRIC_NO_ACTIVITY: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_STATUS_UNKNOWN: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_UNSUPPORTED: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_HW_UNAVAILABLE: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NONE_ENROLLED: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NO_HARDWARE: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED: 'BIOMETRICS_FAILED',
  BIOMETRIC_AUTHENTICATION_CHECK_FAILED: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE:
    'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NEGATIVE_BUTTON: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_HW_NOT_PRESENT: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NO_BIOMETRICS: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_USER_CANCELED: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_LOCKOUT_PERMANENT: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_VENDOR: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_LOCKOUT: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_CANCELED: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_NO_SPACE: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_TIMEOUT: 'BIOMETRICS_FAILED',
  BIOMETRIC_ERROR_UNABLE_TO_PROCESS: 'BIOMETRICS_FAILED',
  BIOMETRICS_INVALID_USER: 'BIOMETRICS_FAILED',
  BIOMETRIC_AUTHENTICATION_FAILED: 'BIOMETRICS_FAILED',
};

/**
 * Represents an error that occurred during Credentials Manager operations.
 *
 * This class wraps authentication errors related to credentials management functionality,
 * including:
 * - Storing and retrieving credentials
 * - Refreshing expired credentials
 * - Multi-Resource Refresh Token (MRRT) / API credentials operations
 * - Biometric authentication
 * - Token revocation
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS, Android, and Web.
 *
 * ## Common Error Types:
 *
 * ### Credentials Operations:
 * - `NO_CREDENTIALS`: No stored credentials found
 * - `NO_REFRESH_TOKEN`: Refresh token not available (ensure 'offline_access' scope was requested)
 * - `INVALID_CREDENTIALS`: Stored credentials are invalid
 * - `RENEW_FAILED`: Failed to refresh credentials using refresh token
 * - `STORE_FAILED`: Failed to store credentials
 * - `REVOKE_FAILED`: Failed to revoke refresh token
 * - `LARGE_MIN_TTL`: Requested minimum TTL exceeds token lifetime
 *
 * ### API Credentials (MRRT):
 * - `API_EXCHANGE_FAILED`: Failed to exchange refresh token for API-specific credentials
 *
 * ### Network & API:
 * - `NO_NETWORK`: Network connectivity issue
 * - `API_ERROR`: Generic API error
 *
 * ### Biometric Authentication:
 * - `BIOMETRICS_FAILED`: Biometric authentication failed
 * - `INCOMPATIBLE_DEVICE`: Device incompatible with secure storage
 * - `CRYPTO_EXCEPTION`: Cryptographic operation failed
 *
 * @example
 * ```typescript
 * // Using with hooks - getCredentials
 * import { useAuth0, CredentialsManagerError } from 'react-native-auth0';
 *
 * function MyComponent() {
 *   const { getCredentials } = useAuth0();
 *
 *   const fetchCredentials = async () => {
 *     try {
 *       const credentials = await getCredentials();
 *       console.log('Access Token:', credentials.accessToken);
 *     } catch (error) {
 *       if (error instanceof CredentialsManagerError) {
 *         switch (error.type) {
 *           case 'NO_CREDENTIALS':
 *             // User needs to log in
 *             break;
 *           case 'NO_REFRESH_TOKEN':
 *             // Refresh token missing - ensure offline_access scope was requested
 *             break;
 *           case 'RENEW_FAILED':
 *             // Token refresh failed - may need to re-authenticate
 *             break;
 *           case 'BIOMETRICS_FAILED':
 *             // Biometric authentication failed
 *             break;
 *         }
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using with hooks - getApiCredentials (MRRT)
 * import { useAuth0, CredentialsManagerError } from 'react-native-auth0';
 *
 * function MyComponent() {
 *   const { getApiCredentials } = useAuth0();
 *
 *   const fetchApiCredentials = async () => {
 *     try {
 *       const apiCredentials = await getApiCredentials(
 *         'https://api.example.com',
 *         'read:data write:data'
 *       );
 *       console.log('API Access Token:', apiCredentials.accessToken);
 *     } catch (error) {
 *       if (error instanceof CredentialsManagerError) {
 *         switch (error.type) {
 *           case 'NO_REFRESH_TOKEN':
 *             // Request offline_access scope on login
 *             break;
 *           case 'API_EXCHANGE_FAILED':
 *             // Check audience and scopes
 *             break;
 *           case 'LARGE_MIN_TTL':
 *             // Reduce minTTL or increase API token expiration
 *             break;
 *         }
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using with Auth0 class
 * import Auth0, { CredentialsManagerError } from 'react-native-auth0';
 *
 * const auth0 = new Auth0({
 *   domain: 'your-domain.auth0.com',
 *   clientId: 'your-client-id'
 * });
 *
 * async function manageCredentials() {
 *   try {
 *     const credentials = await auth0.credentialsManager.getCredentials();
 *     console.log('Credentials:', credentials);
 *   } catch (error) {
 *     if (error instanceof CredentialsManagerError) {
 *       console.log('Error type:', error.type);
 *       console.log('Error message:', error.message);
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link https://auth0.com/docs/secure/tokens/refresh-tokens|Auth0 Refresh Tokens Documentation}
 * @see {@link https://auth0.com/docs/get-started/apis/scopes|Auth0 Scopes Documentation}
 */
export class CredentialsManagerError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   *
   * Possible values:
   * - `INVALID_CREDENTIALS`: Stored credentials are invalid
   * - `NO_CREDENTIALS`: No stored credentials found
   * - `NO_REFRESH_TOKEN`: Refresh token is not available
   * - `RENEW_FAILED`: Token renewal failed
   * - `API_EXCHANGE_FAILED`: API credentials exchange failed (MRRT)
   * - `STORE_FAILED`: Failed to store credentials
   * - `REVOKE_FAILED`: Failed to revoke refresh token
   * - `LARGE_MIN_TTL`: Requested minimum TTL exceeds token lifetime
   * - `BIOMETRICS_FAILED`: Biometric authentication failed
   * - `INCOMPATIBLE_DEVICE`: Device incompatible with secure storage
   * - `CRYPTO_EXCEPTION`: Cryptographic operation failed
   * - `NO_NETWORK`: Network error
   * - `API_ERROR`: Generic API error
   * - `CREDENTIAL_MANAGER_ERROR`: Generic credentials manager error
   * - `UNKNOWN_ERROR`: Unknown error type
   */
  public readonly type: string;

  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    this.type = ERROR_CODE_MAP[originalError.code] || 'UNKNOWN_ERROR';
  }
}
