import { AuthError } from './AuthError';
import type { MfaRequiredErrorPayload } from '../../types/common';

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
  /**
   * The credential response is neither a valid attestation (signup) nor
   * assertion (login) response — e.g. it was malformed, tampered with, or
   * came from an unexpected source.
   */
  INVALID_CREDENTIAL: 'PASSKEY_INVALID_CREDENTIAL',
  /** Passkeys are not supported on the web platform */
  UNSUPPORTED_PLATFORM: 'PASSKEY_UNSUPPORTED_PLATFORM',
  /** The parameters provided for the passkey operation were invalid */
  INVALID_PARAMETER: 'PASSKEY_INVALID_PARAMETER',
  /** The user cancelled the passkey creation/assertion prompt */
  CANCELLED: 'PASSKEY_CANCELLED',
  /**
   * Multi-factor authentication is required to complete this passkey
   * exchange. Use {@link PasskeyError.getMfaRequiredPayload} for
   * structured access to `mfaToken` and `mfaRequirements`, then
   * continue with the `mfa` client (`mfa.challenge()` / `mfa.verify()`).
   */
  MFA_REQUIRED: 'PASSKEY_MFA_REQUIRED',
  /** Unknown or uncategorized passkey error */
  UNKNOWN_ERROR: 'PASSKEY_UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  PASSKEY_NOT_AVAILABLE: PasskeyErrorCodes.NOT_AVAILABLE,
  PASSKEY_CHALLENGE_FAILED: PasskeyErrorCodes.CHALLENGE_FAILED,
  PASSKEY_EXCHANGE_FAILED: PasskeyErrorCodes.EXCHANGE_FAILED,
  InvalidParameter: PasskeyErrorCodes.INVALID_PARAMETER,

  // --- Web platform (auth0-spa-js PasskeyApiClient / PasskeyClient) ---
  UnsupportedOperation: PasskeyErrorCodes.UNSUPPORTED_PLATFORM,
  passkey_not_supported: PasskeyErrorCodes.NOT_AVAILABLE,
  passkey_cancelled: PasskeyErrorCodes.CANCELLED,
  passkey_register_error: PasskeyErrorCodes.CHALLENGE_FAILED,
  passkey_challenge_error: PasskeyErrorCodes.CHALLENGE_FAILED,
  passkey_get_token_error: PasskeyErrorCodes.EXCHANGE_FAILED,
  passkey_invalid_credential: PasskeyErrorCodes.INVALID_CREDENTIAL,

  // --- Web platform (auth0-spa-js token endpoint / OAuth2, surfaced via
  // GenericError and its subclasses during the token-exchange step —
  // these only carry an `.error` field, not `.code`, so the web adapter
  // extracts `.error` as a fallback before constructing the AuthError
  // passed to PasskeyError; see WebAuth0Client.ts) ---
  invalid_grant: PasskeyErrorCodes.EXCHANGE_FAILED,
  access_denied: PasskeyErrorCodes.EXCHANGE_FAILED,
  invalid_request: PasskeyErrorCodes.EXCHANGE_FAILED,
  mfa_required: PasskeyErrorCodes.MFA_REQUIRED,
  missing_refresh_token: PasskeyErrorCodes.EXCHANGE_FAILED,
  use_dpop_nonce: PasskeyErrorCodes.EXCHANGE_FAILED,

  // --- Browser WebAuthn ceremony (navigator.credentials.create()/.get()).
  // The app calls this directly — it's not wrapped by any SDK method — so
  // these DOMException names are matched by `.name`, not `.code`, when a
  // plain Error/DOMException (rather than an AuthError) is passed to the
  // PasskeyError constructor below. Names per the WebAuthn spec's
  // navigator.credentials.create()/.get() exception list. ---
  NotAllowedError: PasskeyErrorCodes.CANCELLED,
  AbortError: PasskeyErrorCodes.CANCELLED,
  SecurityError: PasskeyErrorCodes.NOT_AVAILABLE,
  NotSupportedError: PasskeyErrorCodes.NOT_AVAILABLE,
  InvalidStateError: PasskeyErrorCodes.CHALLENGE_FAILED,
  ConstraintError: PasskeyErrorCodes.CHALLENGE_FAILED,
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
   * @param originalError Either an `AuthError` from an SDK method (Auth0
   *   challenge/exchange failures), or a plain `Error`/`DOMException` —
   *   e.g. one thrown directly by the browser's
   *   `navigator.credentials.create()`/`.get()` call, which the app makes
   *   itself between `passkeySignupChallenge`/`passkeyLoginChallenge` and
   *   `getTokenByPasskey`. For the latter, wrap it as shown:
   *   `catch (e) { throw new PasskeyError(e); }`.
   * @param fallbackType The {@link PasskeyErrorCodes} value to use when
   *   `originalError.code` is not a recognized passkey code. Callers that know
   *   which phase failed — e.g. the web My Account adapter, where the error
   *   `code` is an opaque RFC 7807 type URI rather than a passkey code — pass
   *   the appropriate phase (`CHALLENGE_FAILED` for challenge requests,
   *   `EXCHANGE_FAILED` for verification) so `type` is meaningful instead of
   *   defaulting to `UNKNOWN_ERROR`.
   */
  constructor(
    originalError: AuthError | Error,
    fallbackType: string = PasskeyErrorCodes.UNKNOWN_ERROR
  ) {
    const isAuthError = originalError instanceof AuthError;
    // AuthErrors carry the lookup key on `.code`; a raw DOMException (or
    // any other Error) only has a `.name` (e.g. "NotAllowedError").
    const code = isAuthError ? originalError.code : originalError.name;

    super(originalError.name, originalError.message, {
      status: isAuthError ? originalError.status : undefined,
      code,
      json: isAuthError ? originalError.json : originalError,
    });

    this.type = ERROR_CODE_MAP[code] ?? fallbackType;
  }

  /**
   * Extracts structured MFA details when this error is of type
   * `PASSKEY_MFA_REQUIRED`. Use this to obtain both `mfaToken` and
   * `mfaRequirements` for continuing the MFA flow with `mfa.challenge()`
   * and `mfa.verify()`.
   *
   * @returns Structured MFA payload if this is an MFA_REQUIRED error,
   *   otherwise `null`.
   *
   * @example
   * ```typescript
   * try {
   *   const credentials = await auth0.getTokenByPasskey({
   *     authSession: challenge.authSession,
   *     authResponse: credential,
   *   });
   * } catch (error) {
   *   if (error instanceof PasskeyError) {
   *     const mfaPayload = error.getMfaRequiredPayload();
   *     if (mfaPayload) {
   *       // MFA required - continue with mfa.challenge() / mfa.verify()
   *       console.log('MFA token:', mfaPayload.mfaToken);
   *       console.log('Available factors:', mfaPayload.mfaRequirements);
   *     }
   *   }
   * }
   * ```
   */
  public getMfaRequiredPayload(): MfaRequiredErrorPayload | null {
    if (this.type !== PasskeyErrorCodes.MFA_REQUIRED) {
      return null;
    }

    const json = this.json as any;
    return {
      mfaToken: json.mfa_token ?? '',
      error: json.error ?? this.code,
      errorDescription: json.error_description ?? this.message,
      mfaRequirements: json.mfa_requirements,
    };
  }
}
