import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for Credentials Manager operations.
 *
 * Use these constants for type-safe error handling when working with credentials operations
 * like getCredentials, saveCredentials, clearCredentials, and getApiCredentials.
 * Each constant corresponds to a specific error type in the {@link CredentialsManagerError.type} property.
 *
 * @example
 * ```typescript
 * import { CredentialsManagerError, CredentialsManagerErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.credentialsManager.getCredentials();
 * } catch (e) {
 *   if (e instanceof CredentialsManagerError) {
 *     switch (e.type) {
 *       case CredentialsManagerErrorCodes.NO_CREDENTIALS:
 *         // User needs to log in
 *         break;
 *       case CredentialsManagerErrorCodes.NO_REFRESH_TOKEN:
 *         // Request offline_access scope during login
 *         break;
 *       case CredentialsManagerErrorCodes.RENEW_FAILED:
 *         // Token refresh failed - may need re-authentication
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link CredentialsManagerError}
 */
export const CredentialsManagerErrorCodes = {
  /** Stored credentials are invalid or corrupted */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  /** No credentials are stored - user needs to log in */
  NO_CREDENTIALS: 'NO_CREDENTIALS',
  /** Refresh token is not available - ensure offline_access scope was requested */
  NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN',
  /** Failed to refresh credentials using refresh token */
  RENEW_FAILED: 'RENEW_FAILED',
  /** Failed to store credentials securely */
  STORE_FAILED: 'STORE_FAILED',
  /** Failed to revoke refresh token */
  REVOKE_FAILED: 'REVOKE_FAILED',
  /** Requested minimum TTL exceeds token lifetime */
  LARGE_MIN_TTL: 'LARGE_MIN_TTL',
  /** Generic credentials manager error */
  CREDENTIAL_MANAGER_ERROR: 'CREDENTIAL_MANAGER_ERROR',
  /** Biometric authentication failed */
  BIOMETRICS_FAILED: 'BIOMETRICS_FAILED',
  /** Network connectivity issue */
  NO_NETWORK: 'NO_NETWORK',
  /** Generic API error */
  API_ERROR: 'API_ERROR',
  /** Failed to exchange refresh token for API-specific credentials (MRRT) */
  API_EXCHANGE_FAILED: 'API_EXCHANGE_FAILED',
  /** Device is incompatible with secure storage requirements */
  INCOMPATIBLE_DEVICE: 'INCOMPATIBLE_DEVICE',
  /** Cryptographic operation failed */
  CRYPTO_EXCEPTION: 'CRYPTO_EXCEPTION',
  /** Unknown or uncategorized error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  // --- Core CredentialsManager error codes ---
  INVALID_CREDENTIALS: CredentialsManagerErrorCodes.INVALID_CREDENTIALS,
  NO_CREDENTIALS: CredentialsManagerErrorCodes.NO_CREDENTIALS,
  NO_REFRESH_TOKEN: CredentialsManagerErrorCodes.NO_REFRESH_TOKEN,
  RENEW_FAILED: CredentialsManagerErrorCodes.RENEW_FAILED,
  STORE_FAILED: CredentialsManagerErrorCodes.STORE_FAILED,
  REVOKE_FAILED: CredentialsManagerErrorCodes.REVOKE_FAILED,
  LARGE_MIN_TTL: CredentialsManagerErrorCodes.LARGE_MIN_TTL,
  CREDENTIAL_MANAGER_ERROR:
    CredentialsManagerErrorCodes.CREDENTIAL_MANAGER_ERROR,
  BIOMETRICS_FAILED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  NO_NETWORK: CredentialsManagerErrorCodes.NO_NETWORK,
  API_ERROR: CredentialsManagerErrorCodes.API_ERROR,

  // --- API Credentials (MRRT) specific codes ---
  API_EXCHANGE_FAILED: CredentialsManagerErrorCodes.API_EXCHANGE_FAILED,
  // --- Web (@auth0/auth0-spa-js) mappings ---
  login_required: CredentialsManagerErrorCodes.NO_CREDENTIALS,
  consent_required: CredentialsManagerErrorCodes.RENEW_FAILED,
  mfa_required: CredentialsManagerErrorCodes.RENEW_FAILED,
  invalid_grant: CredentialsManagerErrorCodes.RENEW_FAILED,
  invalid_refresh_token: CredentialsManagerErrorCodes.RENEW_FAILED,
  missing_refresh_token: CredentialsManagerErrorCodes.NO_REFRESH_TOKEN,
  invalid_request: CredentialsManagerErrorCodes.API_ERROR,
  invalid_scope: CredentialsManagerErrorCodes.API_ERROR,
  server_error: CredentialsManagerErrorCodes.API_ERROR,
  temporarily_unavailable: CredentialsManagerErrorCodes.NO_NETWORK,

  // --- iOS-specific mappings ---
  renewFailed: CredentialsManagerErrorCodes.RENEW_FAILED,
  apiExchangeFailed: CredentialsManagerErrorCodes.API_EXCHANGE_FAILED,
  noCredentials: CredentialsManagerErrorCodes.NO_CREDENTIALS,
  noRefreshToken: CredentialsManagerErrorCodes.NO_REFRESH_TOKEN,
  storeFailed: CredentialsManagerErrorCodes.STORE_FAILED,
  largeMinTTL: CredentialsManagerErrorCodes.LARGE_MIN_TTL,

  // --- Many-to-one mapping for granular Android Biometric errors ---
  INCOMPATIBLE_DEVICE: CredentialsManagerErrorCodes.INCOMPATIBLE_DEVICE,
  CRYPTO_EXCEPTION: CredentialsManagerErrorCodes.CRYPTO_EXCEPTION,
  BIOMETRIC_NO_ACTIVITY: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_STATUS_UNKNOWN:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_UNSUPPORTED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_HW_UNAVAILABLE:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NONE_ENROLLED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_HARDWARE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_AUTHENTICATION_CHECK_FAILED:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NEGATIVE_BUTTON:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_HW_NOT_PRESENT:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_BIOMETRICS: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_USER_CANCELED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_LOCKOUT_PERMANENT:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_VENDOR: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_LOCKOUT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_CANCELED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_SPACE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_TIMEOUT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_UNABLE_TO_PROCESS:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRICS_INVALID_USER: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_AUTHENTICATION_FAILED:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
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

    this.type =
      ERROR_CODE_MAP[originalError.code] ||
      CredentialsManagerErrorCodes.UNKNOWN_ERROR;
  }
}
