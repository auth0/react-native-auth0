import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for Authentication API operations.
 *
 * Use these constants for type-safe error handling when working with authentication operations.
 * Each constant corresponds to a specific error type in the {@link AuthenticationException.type} property.
 *
 * @example
 * ```typescript
 * import { AuthenticationException, AuthenticationErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.auth.login({
 *     username: 'user@example.com',
 *     password: 'password',
 *   });
 * } catch (e) {
 *   if (e instanceof AuthenticationException) {
 *     switch (e.type) {
 *       case AuthenticationErrorCodes.INVALID_CREDENTIALS:
 *         // Invalid username or password
 *         break;
 *       case AuthenticationErrorCodes.INVALID_GRANT:
 *         // Token or grant is invalid
 *         break;
 *       case AuthenticationErrorCodes.PASSWORD_LEAKED:
 *         // Password was found in a data breach
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link AuthenticationException}
 * @see {@link https://auth0.com/docs/api/authentication|Authentication API}
 */
export const AuthenticationErrorCodes = {
  // General authentication errors
  /** Invalid credentials provided (username/password/code/token) */
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  /** Invalid or expired grant/token */
  INVALID_GRANT: 'INVALID_GRANT',
  /** Invalid request parameters */
  INVALID_REQUEST: 'INVALID_REQUEST',
  /** Access denied by authorization server or Actions/Rules */
  ACCESS_DENIED: 'ACCESS_DENIED',
  /** Unauthorized client */
  UNAUTHORIZED_CLIENT: 'UNAUTHORIZED_CLIENT',

  // Password-related errors
  /** Password does not meet strength requirements */
  PASSWORD_STRENGTH: 'PASSWORD_STRENGTH',
  /** Password was previously used */
  PASSWORD_ALREADY_USED: 'PASSWORD_ALREADY_USED',
  /** Password was found in a data breach */
  PASSWORD_LEAKED: 'PASSWORD_LEAKED',

  // MFA-related errors
  /** MFA is required */
  MFA_REQUIRED: 'MFA_REQUIRED',
  /** Invalid MFA code */
  MFA_INVALID_CODE: 'MFA_INVALID_CODE',
  /** MFA token is invalid or expired */
  MFA_TOKEN_INVALID: 'MFA_TOKEN_INVALID',

  // Token Exchange specific errors
  /** The subject token is invalid, malformed, or expired */
  INVALID_SUBJECT_TOKEN: 'INVALID_SUBJECT_TOKEN',
  /** The subject token type is not supported or not recognized */
  UNSUPPORTED_TOKEN_TYPE: 'UNSUPPORTED_TOKEN_TYPE',
  /** Custom Token Exchange is not configured or enabled */
  TOKEN_EXCHANGE_NOT_CONFIGURED: 'TOKEN_EXCHANGE_NOT_CONFIGURED',
  /** Token validation in Auth0 Action failed */
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',
  /** Token exchange request was denied */
  TOKEN_EXCHANGE_DENIED: 'TOKEN_EXCHANGE_DENIED',

  // Scope and audience errors
  /** The requested audience is invalid or not allowed */
  INVALID_AUDIENCE: 'INVALID_AUDIENCE',
  /** The requested scope is invalid or not allowed */
  INVALID_SCOPE: 'INVALID_SCOPE',

  // Rate limiting and security
  /** Too many authentication attempts */
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  /** Additional verification is required */
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  /** Login is required (for silent authentication) */
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',

  // Network and server errors
  /** Network error occurred */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** The authorization server encountered an internal error */
  SERVER_ERROR: 'SERVER_ERROR',

  /** Unknown or uncategorized authentication error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Type for the values of AuthenticationErrorCodes.
 */
export type AuthenticationErrorCode =
  (typeof AuthenticationErrorCodes)[keyof typeof AuthenticationErrorCodes];

const ERROR_CODE_MAP: Record<string, AuthenticationErrorCode> = {
  // OAuth 2.0 / RFC 6749 standard error codes
  'invalid_request': AuthenticationErrorCodes.INVALID_REQUEST,
  'invalid_grant': AuthenticationErrorCodes.INVALID_GRANT,
  'invalid_token': AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN,
  'invalid_client': AuthenticationErrorCodes.INVALID_CREDENTIALS,
  'invalid_credentials': AuthenticationErrorCodes.INVALID_CREDENTIALS,
  'unauthorized_client': AuthenticationErrorCodes.UNAUTHORIZED_CLIENT,
  'unsupported_grant_type': AuthenticationErrorCodes.INVALID_REQUEST,
  'invalid_scope': AuthenticationErrorCodes.INVALID_SCOPE,
  'access_denied': AuthenticationErrorCodes.ACCESS_DENIED,
  'server_error': AuthenticationErrorCodes.SERVER_ERROR,

  // RFC 8693 Token Exchange specific
  'unsupported_token_type': AuthenticationErrorCodes.UNSUPPORTED_TOKEN_TYPE,
  'invalid_target': AuthenticationErrorCodes.INVALID_AUDIENCE,

  // Auth0-specific error codes - General
  'unauthorized': AuthenticationErrorCodes.ACCESS_DENIED,

  // Auth0-specific error codes - MFA
  'a0.mfa_required': AuthenticationErrorCodes.MFA_REQUIRED,
  'a0.mfa_invalid_code': AuthenticationErrorCodes.MFA_INVALID_CODE,
  'a0.mfa_token_invalid': AuthenticationErrorCodes.MFA_TOKEN_INVALID,
  'mfa_required': AuthenticationErrorCodes.MFA_REQUIRED,
  'mfa_token_invalid': AuthenticationErrorCodes.MFA_TOKEN_INVALID,
  'expired_token': AuthenticationErrorCodes.MFA_TOKEN_INVALID,

  // Auth0-specific error codes - Password
  'invalid_password': AuthenticationErrorCodes.INVALID_CREDENTIALS,
  'password_leaked': AuthenticationErrorCodes.PASSWORD_LEAKED,
  'password_strength_error': AuthenticationErrorCodes.PASSWORD_STRENGTH,
  'password_history_error': AuthenticationErrorCodes.PASSWORD_ALREADY_USED,
  'password_already_used': AuthenticationErrorCodes.PASSWORD_ALREADY_USED,

  // Auth0-specific error codes - Rate Limiting & Verification
  'too_many_attempts': AuthenticationErrorCodes.TOO_MANY_ATTEMPTS,
  'requires_verification': AuthenticationErrorCodes.VERIFICATION_REQUIRED,
  'verification_required': AuthenticationErrorCodes.VERIFICATION_REQUIRED,
  'login_required': AuthenticationErrorCodes.LOGIN_REQUIRED,

  // Token Exchange specific Auth0 codes
  'a0.token_exchange_failed': AuthenticationErrorCodes.TOKEN_EXCHANGE_DENIED,
  'a0.token_exchange_not_enabled':
    AuthenticationErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
  'a0.invalid_subject_token': AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN,
  'a0.subject_token_expired': AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN,
  'a0.subject_token_validation_failed':
    AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED,
  'a0.action_failed': AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED,

  // Network errors
  'a0.network_error': AuthenticationErrorCodes.NETWORK_ERROR,
};

/**
 * Represents an error that occurred during an Authentication API operation.
 *
 * This error class provides structured error handling for authentication operations,
 * with platform-agnostic error codes that normalize errors from iOS, Android, and web platforms.
 *
 * The Authentication API handles various operations including:
 * - Login (username/password, passwordless, social)
 * - Token exchange and refresh
 * - Multi-factor authentication
 * - Password management
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS, Android, and Web.
 *
 * @example
 * ```typescript
 * import {
 *   AuthenticationException,
 *   AuthenticationErrorCodes
 * } from 'react-native-auth0';
 *
 * try {
 *   const credentials = await auth0.auth.login({
 *     username: 'user@example.com',
 *     password: 'password',
 *     realm: 'Username-Password-Authentication',
 *   });
 * } catch (e) {
 *   if (e instanceof AuthenticationException) {
 *     console.log('Error type:', e.type);
 *     console.log('Error message:', e.message);
 *
 *     if (e.type === AuthenticationErrorCodes.INVALID_CREDENTIALS) {
 *       // Invalid username or password
 *     } else if (e.type === AuthenticationErrorCodes.PASSWORD_LEAKED) {
 *       // Password found in breach database
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link AuthenticationErrorCodes}
 * @see {@link https://auth0.com/docs/api/authentication|Authentication API}
 */
export class AuthenticationException extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   */
  public readonly type: AuthenticationErrorCode;

  /**
   * Constructs a new AuthenticationException instance from an AuthError.
   *
   * @param originalError The original AuthError that occurred during an authentication operation.
   */
  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    // Map the original error code to a normalized type
    this.type =
      ERROR_CODE_MAP[originalError.code] ||
      AuthenticationErrorCodes.UNKNOWN_ERROR;
  }
}
