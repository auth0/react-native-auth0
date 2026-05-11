import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for Passkey operations.
 *
 * Use these constants for type-safe error handling when working with passkey
 * signup and signin flows. Each constant corresponds to a specific error type
 * in the {@link PasskeyError.type} property.
 *
 * @example
 * ```typescript
 * import { PasskeyError, PasskeyErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.signinWithPasskey({
 *     realm: 'Username-Password-Authentication',
 *   });
 * } catch (e) {
 *   if (e instanceof PasskeyError) {
 *     switch (e.type) {
 *       case PasskeyErrorCodes.USER_CANCELLED:
 *         // User dismissed the passkey UI
 *         break;
 *       case PasskeyErrorCodes.NOT_AVAILABLE:
 *         // Passkeys not supported on this device/OS
 *         break;
 *       case PasskeyErrorCodes.CHALLENGE_FAILED:
 *         // Auth0 challenge request failed
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link PasskeyError}
 * @see {@link https://auth0.com/docs/authenticate/database-connections/passkeys}
 */
export const PasskeyErrorCodes = {
  /** Passkey signup (registration) failed */
  SIGNUP_FAILED: 'PASSKEY_SIGNUP_FAILED',
  /** Passkey signin (authentication) failed */
  SIGNIN_FAILED: 'PASSKEY_SIGNIN_FAILED',
  /** Passkeys are not available on this device or OS version */
  NOT_AVAILABLE: 'PASSKEY_NOT_AVAILABLE',
  /** User cancelled the passkey OS prompt */
  USER_CANCELLED: 'PASSKEY_USER_CANCELLED',
  /** Auth0 passkey challenge request failed */
  CHALLENGE_FAILED: 'PASSKEY_CHALLENGE_FAILED',
  /** Passkeys are not supported on the web platform */
  UNSUPPORTED_PLATFORM: 'PASSKEY_UNSUPPORTED_PLATFORM',
  /** Unknown or uncategorized passkey error */
  UNKNOWN_ERROR: 'PASSKEY_UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  // --- Passkey-specific error codes (from native) ---
  PASSKEY_SIGNUP_FAILED: PasskeyErrorCodes.SIGNUP_FAILED,
  PASSKEY_SIGNIN_FAILED: PasskeyErrorCodes.SIGNIN_FAILED,
  PASSKEY_NOT_AVAILABLE: PasskeyErrorCodes.NOT_AVAILABLE,
  PASSKEY_USER_CANCELLED: PasskeyErrorCodes.USER_CANCELLED,
  PASSKEY_CHALLENGE_FAILED: PasskeyErrorCodes.CHALLENGE_FAILED,

  // --- Bridge-level fallback codes ---
  passkey_signup_failed: PasskeyErrorCodes.SIGNUP_FAILED,
  passkey_signin_failed: PasskeyErrorCodes.SIGNIN_FAILED,

  // --- Web platform ---
  UnsupportedOperation: PasskeyErrorCodes.UNSUPPORTED_PLATFORM,
};

/**
 * Represents an error that occurred during a Passkey operation.
 *
 * This class wraps authentication errors related to passkey functionality, such as:
 * - Passkey signup (registration) failures
 * - Passkey signin (authentication) failures
 * - Challenge request failures
 * - User cancellation of the OS passkey prompt
 * - Device/OS compatibility issues
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS and Android.
 *
 * @example
 * ```typescript
 * try {
 *   const credentials = await auth0.signupWithPasskey({
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *   });
 * } catch (error) {
 *   if (error instanceof PasskeyError) {
 *     switch (error.type) {
 *       case 'PASSKEY_USER_CANCELLED':
 *         console.log('User dismissed the passkey prompt');
 *         break;
 *       case 'PASSKEY_NOT_AVAILABLE':
 *         console.log('Passkeys are not supported on this device');
 *         break;
 *       case 'PASSKEY_CHALLENGE_FAILED':
 *         console.log('Failed to get passkey challenge from Auth0');
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class PasskeyError extends AuthError {
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
      ERROR_CODE_MAP[originalError.code] || PasskeyErrorCodes.UNKNOWN_ERROR;
  }
}
