import { AuthError } from './AuthError';

/**
 * Public constants exposing all possible WebAuth error codes.
 */
export const WebAuthErrorCodes = {
  USER_CANCELLED: 'USER_CANCELLED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  ID_TOKEN_VALIDATION_FAILED: 'ID_TOKEN_VALIDATION_FAILED',
  BIOMETRICS_CONFIGURATION_ERROR: 'BIOMETRICS_CONFIGURATION_ERROR',
  BROWSER_NOT_AVAILABLE: 'BROWSER_NOT_AVAILABLE',
  FAILED_TO_LOAD_URL: 'FAILED_TO_LOAD_URL',
  BROWSER_TERMINATED: 'BROWSER_TERMINATED',
  NO_BUNDLE_IDENTIFIER: 'NO_BUNDLE_IDENTIFIER',
  TRANSACTION_ACTIVE_ALREADY: 'TRANSACTION_ACTIVE_ALREADY',
  NO_AUTHORIZATION_CODE: 'NO_AUTHORIZATION_CODE',
  PKCE_NOT_ALLOWED: 'PKCE_NOT_ALLOWED',
  INVALID_INVITATION_URL: 'INVALID_INVITATION_URL',
  INVALID_STATE: 'INVALID_STATE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
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

  // --- iOS-specific mappings ---
  'NO_BUNDLE_IDENTIFIER': WebAuthErrorCodes.NO_BUNDLE_IDENTIFIER,
  'TRANSACTION_ACTIVE_ALREADY': WebAuthErrorCodes.TRANSACTION_ACTIVE_ALREADY,
  'NO_AUTHORIZATION_CODE': WebAuthErrorCodes.NO_AUTHORIZATION_CODE,
  'PKCE_NOT_ALLOWED': WebAuthErrorCodes.PKCE_NOT_ALLOWED,
  'INVALID_INVITATION_URL': WebAuthErrorCodes.INVALID_INVITATION_URL,

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
  public readonly type: string;

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
