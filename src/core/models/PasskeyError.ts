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
 *   const challenge = await auth0.passkeyLoginChallenge({
 *     realm: 'Username-Password-Authentication',
 *   });
 * } catch (e) {
 *   if (e instanceof PasskeyError) {
 *     switch (e.type) {
 *       case PasskeyErrorCodes.NOT_AVAILABLE:
 *         // Passkeys not supported on this device/OS
 *         break;
 *       case PasskeyErrorCodes.CHALLENGE_FAILED:
 *         // Auth0 challenge request failed
 *         break;
 *       case PasskeyErrorCodes.EXCHANGE_FAILED:
 *         // Token exchange with credential response failed
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
  /** Passkeys are not available on this device or OS version */
  NOT_AVAILABLE: 'PASSKEY_NOT_AVAILABLE',
  /** Auth0 passkey challenge request failed */
  CHALLENGE_FAILED: 'PASSKEY_CHALLENGE_FAILED',
  /** Token exchange with the passkey credential response failed */
  EXCHANGE_FAILED: 'PASSKEY_EXCHANGE_FAILED',
  /** Passkeys are not supported on the web platform */
  UNSUPPORTED_PLATFORM: 'PASSKEY_UNSUPPORTED_PLATFORM',
  /** Unknown or uncategorized passkey error */
  UNKNOWN_ERROR: 'PASSKEY_UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  PASSKEY_NOT_AVAILABLE: PasskeyErrorCodes.NOT_AVAILABLE,
  PASSKEY_CHALLENGE_FAILED: PasskeyErrorCodes.CHALLENGE_FAILED,
  PASSKEY_EXCHANGE_FAILED: PasskeyErrorCodes.EXCHANGE_FAILED,

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
 * - Device/OS compatibility issues
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS and Android.
 *
 * @example
 * ```typescript
 * try {
 *   const challenge = await auth0.passkeySignupChallenge({
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     realm: 'Username-Password-Authentication',
 *   });
 * } catch (error) {
 *   if (error instanceof PasskeyError) {
 *     switch (error.type) {
 *       case 'PASSKEY_CHALLENGE_FAILED':
 *         console.log('Failed to get passkey challenge from Auth0');
 *         break;
 *       case 'PASSKEY_UNSUPPORTED_PLATFORM':
 *         console.log('Passkeys are not supported on this platform');
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

  /**
   * @param originalError The underlying auth error being wrapped.
   * @param fallbackType The {@link PasskeyErrorCodes} value to use when
   *   `originalError.code` is not a recognized passkey code. Callers that know
   *   which phase failed — e.g. the web My Account adapter, where the error
   *   `code` is an opaque RFC 7807 type URI rather than a passkey code — pass
   *   the appropriate phase (`CHALLENGE_FAILED` for challenge requests,
   *   `EXCHANGE_FAILED` for verification) so `type` is meaningful instead of
   *   defaulting to `UNKNOWN_ERROR`.
   */
  constructor(
    originalError: AuthError,
    fallbackType: string = PasskeyErrorCodes.UNKNOWN_ERROR
  ) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    this.type = ERROR_CODE_MAP[originalError.code] ?? fallbackType;
  }
}
