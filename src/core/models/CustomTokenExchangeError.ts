import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for Custom Token Exchange operations.
 *
 * Use these constants for type-safe error handling when working with token exchange.
 * Each constant corresponds to a specific error type in the {@link CustomTokenExchangeError.type} property.
 *
 * @example
 * ```typescript
 * import { CustomTokenExchangeError, CustomTokenExchangeErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.customTokenExchange({
 *     subjectToken: externalToken,
 *     subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
 *   });
 * } catch (e) {
 *   if (e instanceof CustomTokenExchangeError) {
 *     switch (e.type) {
 *       case CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN:
 *         // The external token is invalid or expired
 *         break;
 *       case CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE:
 *         // The token type is not supported
 *         break;
 *       case CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED:
 *         // Custom Token Exchange is not configured in Auth0
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link CustomTokenExchangeError}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8693|RFC 8693 - OAuth 2.0 Token Exchange}
 */
export const CustomTokenExchangeErrorCodes = {
  /** The subject token is invalid, malformed, or expired */
  INVALID_SUBJECT_TOKEN: 'INVALID_SUBJECT_TOKEN',
  /** The subject token type is not supported or not recognized */
  UNSUPPORTED_TOKEN_TYPE: 'UNSUPPORTED_TOKEN_TYPE',
  /** Custom Token Exchange is not configured or enabled for this Auth0 tenant */
  TOKEN_EXCHANGE_NOT_CONFIGURED: 'TOKEN_EXCHANGE_NOT_CONFIGURED',
  /** The requested audience is invalid or not allowed */
  INVALID_AUDIENCE: 'INVALID_AUDIENCE',
  /** The requested scope is invalid or not allowed */
  INVALID_SCOPE: 'INVALID_SCOPE',
  /** Token exchange was denied by the authorization server */
  TOKEN_EXCHANGE_DENIED: 'TOKEN_EXCHANGE_DENIED',
  /** The token validation in Auth0 Action failed */
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',
  /** Network error occurred during token exchange */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** The authorization server encountered an internal error */
  SERVER_ERROR: 'SERVER_ERROR',
  /** Unknown or uncategorized token exchange error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Type for the values of CustomTokenExchangeErrorCodes.
 */
export type CustomTokenExchangeErrorCode =
  (typeof CustomTokenExchangeErrorCodes)[keyof typeof CustomTokenExchangeErrorCodes];

const ERROR_CODE_MAP: Record<string, CustomTokenExchangeErrorCode> = {
  // --- RFC 8693 OAuth 2.0 Token Exchange error codes ---
  'invalid_request': CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'invalid_grant': CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'invalid_token': CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'unsupported_token_type':
    CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE,
  'invalid_target': CustomTokenExchangeErrorCodes.INVALID_AUDIENCE,
  'invalid_scope': CustomTokenExchangeErrorCodes.INVALID_SCOPE,
  'access_denied': CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED,
  'unauthorized_client':
    CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
  'server_error': CustomTokenExchangeErrorCodes.SERVER_ERROR,

  // --- Auth0-specific error codes ---
  'a0.token_exchange_failed':
    CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED,
  'a0.token_exchange_not_enabled':
    CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
  'a0.invalid_subject_token':
    CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'a0.subject_token_expired':
    CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'a0.subject_token_validation_failed':
    CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,
  'a0.action_failed': CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,

  // --- Native SDK codes (iOS/Android) ---
  'INVALID_SUBJECT_TOKEN': CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
  'UNSUPPORTED_TOKEN_TYPE':
    CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE,
  'TOKEN_EXCHANGE_FAILED': CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED,
  'TOKEN_EXCHANGE_NOT_CONFIGURED':
    CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
  'TOKEN_VALIDATION_FAILED':
    CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,

  // --- Network errors ---
  'a0.network_error': CustomTokenExchangeErrorCodes.NETWORK_ERROR,
  'NETWORK_ERROR': CustomTokenExchangeErrorCodes.NETWORK_ERROR,
  'network_error': CustomTokenExchangeErrorCodes.NETWORK_ERROR,
};

/**
 * Represents an error that occurred during Custom Token Exchange (RFC 8693).
 *
 * This error class provides structured error handling for token exchange operations,
 * with platform-agnostic error codes that normalize errors from iOS, Android, and web platforms.
 *
 * Custom Token Exchange allows exchanging external identity provider tokens for Auth0 tokens.
 * Common failure scenarios include:
 * - Invalid or expired external tokens
 * - Unsupported token types
 * - Missing or misconfigured Auth0 Actions for token validation
 * - Network connectivity issues
 *
 * @example
 * ```typescript
 * import {
 *   CustomTokenExchangeError,
 *   CustomTokenExchangeErrorCodes
 * } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.customTokenExchange({
 *     subjectToken: externalToken,
 *     subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
 *     audience: 'https://api.example.com',
 *   });
 * } catch (e) {
 *   if (e instanceof CustomTokenExchangeError) {
 *     console.log('Error type:', e.type);
 *     console.log('Error message:', e.message);
 *
 *     if (e.type === CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED) {
 *       // Prompt user or admin to configure Custom Token Exchange
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link CustomTokenExchangeErrorCodes}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8693|RFC 8693 - OAuth 2.0 Token Exchange}
 * @see {@link https://auth0.com/docs/authenticate/login/custom-token-exchange|Auth0 Custom Token Exchange}
 */
export class CustomTokenExchangeError extends Error {
  /**
   * The platform-agnostic error type. Use this for switch statements and error handling.
   */
  public readonly type: CustomTokenExchangeErrorCode;

  /**
   * The underlying raw error that caused this CustomTokenExchangeError.
   */
  public readonly underlyingError: AuthError;

  /**
   * Creates a new CustomTokenExchangeError.
   *
   * Typically you won't need to construct this directly - the SDK automatically
   * wraps native errors in this class when they occur during token exchange operations.
   *
   * @param underlyingError The original AuthError from the platform.
   */
  constructor(underlyingError: AuthError) {
    super(underlyingError.message);
    this.name = 'CustomTokenExchangeError';
    this.underlyingError = underlyingError;

    // Map the raw error code to a platform-agnostic type
    const rawCode = underlyingError.code || underlyingError.name;
    this.type =
      ERROR_CODE_MAP[rawCode] ?? CustomTokenExchangeErrorCodes.UNKNOWN_ERROR;

    // Capture stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomTokenExchangeError);
    }
  }

  /**
   * Factory method to create a CustomTokenExchangeError from a raw error.
   *
   * @param error The error to wrap.
   * @returns A new CustomTokenExchangeError instance.
   */
  static from(error: unknown): CustomTokenExchangeError {
    if (error instanceof CustomTokenExchangeError) {
      return error;
    }

    if (error instanceof AuthError) {
      return new CustomTokenExchangeError(error);
    }

    // Handle generic errors or unknown error types
    const authError = new AuthError(
      'custom_token_exchange_error',
      error instanceof Error ? error.message : String(error),
      {
        code: 'custom_token_exchange_error',
        json: error,
      }
    );
    return new CustomTokenExchangeError(authError);
  }
}
