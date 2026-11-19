import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for WebAuth operations.
 *
 * Use these constants for type-safe error handling when working with WebAuth errors.
 * Each constant corresponds to a specific error type in the {@link WebAuthError.type} property.
 *
 * @example
 * ```typescript
 * import { WebAuthError, WebAuthErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   await auth0.webAuth.authorize();
 * } catch (e) {
 *   if (e instanceof WebAuthError) {
 *     switch (e.type) {
 *       case WebAuthErrorCodes.USER_CANCELLED:
 *         // User cancelled the authentication
 *         break;
 *       case WebAuthErrorCodes.NETWORK_ERROR:
 *         // Network connectivity issue
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link WebAuthError}
 */
export const WebAuthErrorCodes = {
  /** User actively cancelled the authentication flow */
  USER_CANCELLED: 'USER_CANCELLED',
  /** Authentication was denied by user or Auth0 (rules, actions, policies) */
  ACCESS_DENIED: 'ACCESS_DENIED',
  /** Network error occurred during authentication */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** ID token validation failed (signature, issuer, audience, nonce) */
  ID_TOKEN_VALIDATION_FAILED: 'ID_TOKEN_VALIDATION_FAILED',
  /** Biometric configuration error */
  BIOMETRICS_CONFIGURATION_ERROR: 'BIOMETRICS_CONFIGURATION_ERROR',
  /** No compatible browser available on device */
  BROWSER_NOT_AVAILABLE: 'BROWSER_NOT_AVAILABLE',
  /** Authorization URL failed to load in browser */
  FAILED_TO_LOAD_URL: 'FAILED_TO_LOAD_URL',
  /** Browser was closed unexpectedly */
  BROWSER_TERMINATED: 'BROWSER_TERMINATED',
  /** Another authentication transaction is already active */
  TRANSACTION_ACTIVE_ALREADY: 'TRANSACTION_ACTIVE_ALREADY',
  /** PKCE is required but not enabled in Auth0 Application */
  PKCE_NOT_ALLOWED: 'PKCE_NOT_ALLOWED',
  /** The callback URL carried an error the SDK could not attribute to a specific cause */
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  /** Exchanging the authorization code for tokens failed */
  CODE_EXCHANGE_FAILED: 'CODE_EXCHANGE_FAILED',
  /** State parameter mismatch (potential CSRF attack) */
  INVALID_STATE: 'INVALID_STATE',
  /** Callback URL did not match the expected redirect, e.g. an in-page link captured by the browser session (iOS) */
  INVALID_CALLBACK_URL: 'INVALID_CALLBACK_URL',
  /** Authentication flow timed out */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  /** User consent required for requested scopes */
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  /** Auth0 Application is misconfigured */
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  /** Unknown or uncategorized error */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * A normalized WebAuth error code.
 *
 * Derived from {@link WebAuthErrorCodes} so the union and the runtime constants
 * cannot drift apart.
 */
export type WebAuthErrorCode =
  (typeof WebAuthErrorCodes)[keyof typeof WebAuthErrorCodes];

const ERROR_CODE_MAP: Record<string, WebAuthErrorCode> = {
  // --- Common Codes ---
  'a0.session.user_cancelled': WebAuthErrorCodes.USER_CANCELLED,
  'USER_CANCELLED': WebAuthErrorCodes.USER_CANCELLED,
  'access_denied': WebAuthErrorCodes.ACCESS_DENIED,
  'a0.network_error': WebAuthErrorCodes.NETWORK_ERROR,
  'a0.session.invalid_idtoken': WebAuthErrorCodes.ID_TOKEN_VALIDATION_FAILED,
  'ID_TOKEN_VALIDATION_FAILED': WebAuthErrorCodes.ID_TOKEN_VALIDATION_FAILED,
  'BIOMETRICS_CONFIGURATION_ERROR':
    WebAuthErrorCodes.BIOMETRICS_CONFIGURATION_ERROR,

  // --- Android-specific mappings ---
  'a0.browser_not_available': WebAuthErrorCodes.BROWSER_NOT_AVAILABLE,
  'a0.session.failed_load': WebAuthErrorCodes.FAILED_TO_LOAD_URL,
  'a0.session.browser_terminated': WebAuthErrorCodes.BROWSER_TERMINATED,
  'a0.pkce_not_available': WebAuthErrorCodes.PKCE_NOT_ALLOWED,

  // --- iOS-specific mappings ---
  'TRANSACTION_ACTIVE_ALREADY': WebAuthErrorCodes.TRANSACTION_ACTIVE_ALREADY,
  'AUTHENTICATION_FAILED': WebAuthErrorCodes.AUTHENTICATION_FAILED,
  'CODE_EXCHANGE_FAILED': WebAuthErrorCodes.CODE_EXCHANGE_FAILED,
  'INVALID_CALLBACK_URL': WebAuthErrorCodes.INVALID_CALLBACK_URL,

  // --- Web (@auth0/auth0-spa-js) mappings ---
  'cancelled': WebAuthErrorCodes.USER_CANCELLED,
  'state_mismatch': WebAuthErrorCodes.INVALID_STATE,
  'login_required': WebAuthErrorCodes.ACCESS_DENIED,
  'timeout': WebAuthErrorCodes.TIMEOUT_ERROR,
  'consent_required': WebAuthErrorCodes.CONSENT_REQUIRED,

  // --- Generic Fallbacks ---
  'a0.invalid_configuration': WebAuthErrorCodes.INVALID_CONFIGURATION,
  'UNKNOWN': WebAuthErrorCodes.UNKNOWN_ERROR,
  'OTHER': WebAuthErrorCodes.UNKNOWN_ERROR,
};

export class WebAuthError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   */
  public readonly type: WebAuthErrorCode;

  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    if (
      originalError.message.includes('state is invalid') ||
      originalError.code === 'state_mismatch'
    ) {
      this.type = WebAuthErrorCodes.INVALID_STATE;
    } else {
      this.type =
        ERROR_CODE_MAP[originalError.code] || WebAuthErrorCodes.UNKNOWN_ERROR;
    }
  }
}
