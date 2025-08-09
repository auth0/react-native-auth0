import { AuthError } from './AuthError';

const ERROR_CODE_MAP: Record<string, string> = {
  // --- Common Codes ---
  'a0.session.user_cancelled': 'USER_CANCELLED',
  'USER_CANCELLED': 'USER_CANCELLED',
  'access_denied': 'ACCESS_DENIED',
  'a0.network_error': 'NETWORK_ERROR',
  'a0.session.invalid_idtoken': 'ID_TOKEN_VALIDATION_FAILED',
  'ID_TOKEN_VALIDATION_FAILED': 'ID_TOKEN_VALIDATION_FAILED',

  // --- Android-specific mappings ---
  'a0.browser_not_available': 'BROWSER_NOT_AVAILABLE',
  'a0.session.failed_load': 'FAILED_TO_LOAD_URL',
  'a0.session.browser_terminated': 'BROWSER_TERMINATED',

  // --- iOS-specific mappings ---
  'NO_BUNDLE_IDENTIFIER': 'NO_BUNDLE_IDENTIFIER',
  'NO_AUTHORIZATION_CODE': 'NO_AUTHORIZATION_CODE',
  'PKCE_NOT_ALLOWED': 'PKCE_NOT_ALLOWED',
  'INVALID_INVITATION_URL': 'INVALID_INVITATION_URL',

  // --- Web (@auth0/auth0-spa-js) mappings ---
  'cancelled': 'USER_CANCELLED',
  'state_mismatch': 'INVALID_STATE',
  'login_required': 'ACCESS_DENIED',
  'timeout': 'TIMEOUT_ERROR',

  // --- Generic Fallbacks ---
  'a0.invalid_configuration': 'INVALID_CONFIGURATION',
  'UNKNOWN': 'UNKNOWN_ERROR',
  'OTHER': 'UNKNOWN_ERROR',
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
      this.type = 'INVALID_STATE';
    } else {
      this.type = ERROR_CODE_MAP[originalError.code] || 'UNKNOWN_ERROR';
    }
  }
}
