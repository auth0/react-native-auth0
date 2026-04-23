import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for MFA (Multi-Factor Authentication) operations.
 *
 * Use these constants for type-safe error handling when working with MFA operations
 * like getAuthenticators, enroll, challenge, and verify.
 * Each constant corresponds to a specific error type in the {@link MfaError.type} property.
 *
 * @example
 * ```typescript
 * import { MfaError, MfaErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.mfa().verify({ mfaToken, otp: '123456' });
 * } catch (e) {
 *   if (e instanceof MfaError) {
 *     switch (e.type) {
 *       case MfaErrorCodes.INVALID_OTP:
 *         // OTP code is incorrect
 *         break;
 *       case MfaErrorCodes.EXPIRED_MFA_TOKEN:
 *         // MFA token has expired - restart MFA flow
 *         break;
 *       case MfaErrorCodes.TOO_MANY_ATTEMPTS:
 *         // Rate limited - wait before retrying
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link MfaError}
 */
export const MfaErrorCodes = {
  /** OTP code provided is invalid */
  INVALID_OTP: 'INVALID_OTP',
  /** OOB code provided is invalid */
  INVALID_OOB_CODE: 'INVALID_OOB_CODE',
  /** Binding code provided is invalid */
  INVALID_BINDING_CODE: 'INVALID_BINDING_CODE',
  /** Recovery code provided is invalid */
  INVALID_RECOVERY_CODE: 'INVALID_RECOVERY_CODE',
  /** MFA enrollment failed */
  ENROLLMENT_FAILED: 'ENROLLMENT_FAILED',
  /** Phone number provided is invalid for enrollment */
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  /** Email provided is invalid for enrollment */
  INVALID_EMAIL: 'INVALID_EMAIL',
  /** MFA token has expired - restart MFA flow */
  EXPIRED_MFA_TOKEN: 'EXPIRED_MFA_TOKEN',
  /** MFA token is invalid */
  INVALID_MFA_TOKEN: 'INVALID_MFA_TOKEN',
  /** Too many verification attempts - rate limited */
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  /** MFA challenge request failed */
  CHALLENGE_FAILED: 'CHALLENGE_FAILED',
  /** Authenticator not found or not enrolled */
  AUTHENTICATOR_NOT_FOUND: 'AUTHENTICATOR_NOT_FOUND',
  /** MFA factor type is not supported */
  UNSUPPORTED_FACTOR: 'UNSUPPORTED_FACTOR',
  /** User must enroll before using the authenticator */
  ASSOCIATION_REQUIRED: 'ASSOCIATION_REQUIRED',
  /** Generic MFA error */
  MFA_ERROR: 'MFA_ERROR',
  /** Unknown or uncategorized MFA error */
  UNKNOWN_MFA_ERROR: 'UNKNOWN_MFA_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  // --- Auth0 API error codes (returned by both native SDKs and web) ---
  invalid_otp: MfaErrorCodes.INVALID_OTP,
  invalid_oob_code: MfaErrorCodes.INVALID_OOB_CODE,
  invalid_binding_code: MfaErrorCodes.INVALID_BINDING_CODE,
  invalid_recovery_code: MfaErrorCodes.INVALID_RECOVERY_CODE,
  invalid_grant: MfaErrorCodes.INVALID_OTP,
  mfa_token_invalid: MfaErrorCodes.INVALID_MFA_TOKEN,
  expired_token: MfaErrorCodes.EXPIRED_MFA_TOKEN,
  too_many_attempts: MfaErrorCodes.TOO_MANY_ATTEMPTS,
  unsupported_challenge_type: MfaErrorCodes.UNSUPPORTED_FACTOR,
  association_required: MfaErrorCodes.ASSOCIATION_REQUIRED,
  invalid_phone_number: MfaErrorCodes.INVALID_PHONE_NUMBER,
  invalid_email: MfaErrorCodes.INVALID_EMAIL,

  // --- Native bridge local validation errors ---
  MFA_ENROLLMENT_ERROR: MfaErrorCodes.ENROLLMENT_FAILED,
  MFA_VERIFY_ERROR: MfaErrorCodes.MFA_ERROR,
  MFA_CHALLENGE_ERROR: MfaErrorCodes.CHALLENGE_FAILED,

  // --- Web (spa-js) error codes ---
  mfa_enrollment_failed: MfaErrorCodes.ENROLLMENT_FAILED,
  mfa_list_authenticators_failed: MfaErrorCodes.MFA_ERROR,
  mfa_challenge_failed: MfaErrorCodes.CHALLENGE_FAILED,
  mfa_verify_failed: MfaErrorCodes.MFA_ERROR,

  // --- Generic fallbacks ---
  UNKNOWN: MfaErrorCodes.UNKNOWN_MFA_ERROR,
  OTHER: MfaErrorCodes.UNKNOWN_MFA_ERROR,
};

/**
 * Represents an error that occurred during MFA (Multi-Factor Authentication) operations.
 *
 * This class wraps authentication errors related to MFA functionality, including:
 * - Listing enrolled authenticators
 * - Enrolling new MFA factors (OTP, SMS, email, push)
 * - Requesting MFA challenges
 * - Verifying MFA codes (OTP, OOB, recovery codes)
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS, Android, and Web.
 *
 * @example
 * ```typescript
 * import { MfaError, MfaErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.mfa().verify({ mfaToken, otp: '123456' });
 * } catch (error) {
 *   if (error instanceof MfaError) {
 *     switch (error.type) {
 *       case MfaErrorCodes.INVALID_OTP:
 *         // Show "incorrect code" message
 *         break;
 *       case MfaErrorCodes.EXPIRED_MFA_TOKEN:
 *         // Restart MFA flow
 *         break;
 *       case MfaErrorCodes.TOO_MANY_ATTEMPTS:
 *         // Show rate limit message
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class MfaError extends AuthError {
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
      ERROR_CODE_MAP[originalError.code] || MfaErrorCodes.UNKNOWN_MFA_ERROR;
  }
}
