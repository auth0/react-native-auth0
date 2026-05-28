import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for My Account API operations.
 *
 * Use these constants for type-safe error handling when working with
 * My Account enrollment, confirmation, and factor management flows.
 *
 * @example
 * ```typescript
 * import { MyAccountError, MyAccountErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const challenge = await myAccount.enrollPhone({ accessToken, phoneNumber });
 * } catch (e) {
 *   if (e instanceof MyAccountError) {
 *     switch (e.type) {
 *       case MyAccountErrorCodes.ENROLLMENT_FAILED:
 *         // Enrollment request failed
 *         break;
 *       case MyAccountErrorCodes.VERIFICATION_FAILED:
 *         // OTP or confirmation verification failed
 *         break;
 *       case MyAccountErrorCodes.UNAUTHORIZED:
 *         // Access token is invalid or lacks required scopes
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link MyAccountError}
 */
export const MyAccountErrorCodes = {
  /** Enrollment challenge or initiation request failed */
  ENROLLMENT_FAILED: 'MY_ACCOUNT_ENROLLMENT_FAILED',
  /** OTP verification or enrollment confirmation failed */
  VERIFICATION_FAILED: 'MY_ACCOUNT_VERIFICATION_FAILED',
  /** The requested authentication method was not found */
  NOT_FOUND: 'MY_ACCOUNT_NOT_FOUND',
  /** Access token is invalid, expired, or lacks required scopes */
  UNAUTHORIZED: 'MY_ACCOUNT_UNAUTHORIZED',
  /** My Account API is not supported on this platform */
  UNSUPPORTED_PLATFORM: 'MY_ACCOUNT_UNSUPPORTED_PLATFORM',
  /** Unknown or uncategorized My Account error */
  UNKNOWN_ERROR: 'MY_ACCOUNT_UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  MY_ACCOUNT_ENROLLMENT_FAILED: MyAccountErrorCodes.ENROLLMENT_FAILED,
  MY_ACCOUNT_VERIFICATION_FAILED: MyAccountErrorCodes.VERIFICATION_FAILED,
  MY_ACCOUNT_NOT_FOUND: MyAccountErrorCodes.NOT_FOUND,
  MY_ACCOUNT_UNAUTHORIZED: MyAccountErrorCodes.UNAUTHORIZED,

  // --- Web platform ---
  UnsupportedOperation: MyAccountErrorCodes.UNSUPPORTED_PLATFORM,
};

/**
 * Represents an error that occurred during a My Account API operation.
 *
 * This class wraps authentication errors related to My Account functionality, such as:
 * - Factor enrollment failures (phone, email, TOTP, push notification, recovery code)
 * - Enrollment confirmation/verification failures
 * - Authentication method retrieval failures
 * - Unauthorized access (invalid or insufficient scopes)
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS and Android.
 *
 * @example
 * ```typescript
 * try {
 *   await myAccount.enrollPhone({ accessToken, phoneNumber: '+1234567890' });
 * } catch (error) {
 *   if (error instanceof MyAccountError) {
 *     switch (error.type) {
 *       case 'MY_ACCOUNT_ENROLLMENT_FAILED':
 *         console.log('Failed to enroll phone number');
 *         break;
 *       case 'MY_ACCOUNT_UNAUTHORIZED':
 *         console.log('Access token is invalid or missing scopes');
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class MyAccountError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   */
  public readonly type: string;

  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    this.type =
      ERROR_CODE_MAP[originalError.code] || MyAccountErrorCodes.UNKNOWN_ERROR;
  }
}
