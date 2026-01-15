import {
  AuthenticationException,
  AuthenticationErrorCodes,
} from '../AuthenticationException';
import { AuthError } from '../AuthError';

describe('AuthenticationException', () => {
  describe('constructor', () => {
    it('should create error with correct name', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new AuthenticationException(authError);

      expect(error.name).toBe('invalid_grant');
    });

    it('should preserve the error message', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new AuthenticationException(authError);

      expect(error.message).toBe('Token expired');
    });

    it('should preserve the error code', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new AuthenticationException(authError);

      expect(error.code).toBe('invalid_grant');
    });
  });

  describe('error code mapping', () => {
    it.each([
      // OAuth 2.0 / RFC 6749 error codes - General auth errors
      ['invalid_request', AuthenticationErrorCodes.INVALID_REQUEST],
      ['invalid_grant', AuthenticationErrorCodes.INVALID_GRANT],
      ['invalid_credentials', AuthenticationErrorCodes.INVALID_CREDENTIALS],
      ['access_denied', AuthenticationErrorCodes.ACCESS_DENIED],
      ['unauthorized_client', AuthenticationErrorCodes.UNAUTHORIZED_CLIENT],
      ['invalid_scope', AuthenticationErrorCodes.INVALID_SCOPE],
      ['invalid_token', AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN],

      // Token exchange specific errors
      ['server_error', AuthenticationErrorCodes.SERVER_ERROR],
      [
        'a0.token_exchange_failed',
        AuthenticationErrorCodes.TOKEN_EXCHANGE_DENIED,
      ],
      [
        'a0.token_exchange_not_enabled',
        AuthenticationErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
      ],
      [
        'unsupported_token_type',
        AuthenticationErrorCodes.UNSUPPORTED_TOKEN_TYPE,
      ],
      ['invalid_target', AuthenticationErrorCodes.INVALID_AUDIENCE],
      [
        'a0.invalid_subject_token',
        AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN,
      ],
      [
        'a0.subject_token_expired',
        AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN,
      ],
      [
        'a0.subject_token_validation_failed',
        AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED,
      ],
      ['a0.action_failed', AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED],

      // Password errors
      ['password_strength_error', AuthenticationErrorCodes.PASSWORD_STRENGTH],
      ['password_leaked', AuthenticationErrorCodes.PASSWORD_LEAKED],
      ['password_already_used', AuthenticationErrorCodes.PASSWORD_ALREADY_USED],

      // MFA errors
      ['a0.mfa_required', AuthenticationErrorCodes.MFA_REQUIRED],
      ['mfa_required', AuthenticationErrorCodes.MFA_REQUIRED],
      ['a0.mfa_invalid_code', AuthenticationErrorCodes.MFA_INVALID_CODE],
      ['a0.mfa_token_invalid', AuthenticationErrorCodes.MFA_TOKEN_INVALID],

      // Rate limiting and verification
      ['too_many_attempts', AuthenticationErrorCodes.TOO_MANY_ATTEMPTS],
      ['verification_required', AuthenticationErrorCodes.VERIFICATION_REQUIRED],
      ['login_required', AuthenticationErrorCodes.LOGIN_REQUIRED],

      // Network errors
      ['a0.network_error', AuthenticationErrorCodes.NETWORK_ERROR],
    ])('should map "%s" to %s', (errorCode, expectedType) => {
      const authError = new AuthError(errorCode, 'Test error', {
        code: errorCode,
      });
      const error = new AuthenticationException(authError);

      expect(error.type).toBe(expectedType);
    });

    it('should map unknown error codes to UNKNOWN_ERROR', () => {
      const authError = new AuthError('some_unknown_code', 'Unknown error', {
        code: 'some_unknown_code',
      });
      const error = new AuthenticationException(authError);

      expect(error.type).toBe(AuthenticationErrorCodes.UNKNOWN_ERROR);
    });

    it('should use default code when code is not explicitly provided', () => {
      // When code is not provided in details, AuthError defaults to 'unknown_error'
      const authError = new AuthError('invalid_grant', 'Test error');
      const error = new AuthenticationException(authError);

      // Since code defaults to 'unknown_error', it maps to UNKNOWN_ERROR
      expect(error.type).toBe(AuthenticationErrorCodes.UNKNOWN_ERROR);
    });

    it('should prefer explicit code over name when mapping error type', () => {
      const authError = new AuthError('some_name', 'Test error', {
        code: 'invalid_grant',
      });
      const error = new AuthenticationException(authError);

      expect(error.type).toBe(AuthenticationErrorCodes.INVALID_GRANT);
    });
  });

  describe('AuthenticationErrorCodes', () => {
    it('should export all expected error codes', () => {
      // General auth errors
      expect(AuthenticationErrorCodes.INVALID_REQUEST).toBe('INVALID_REQUEST');
      expect(AuthenticationErrorCodes.INVALID_GRANT).toBe('INVALID_GRANT');
      expect(AuthenticationErrorCodes.INVALID_CREDENTIALS).toBe(
        'INVALID_CREDENTIALS'
      );
      expect(AuthenticationErrorCodes.ACCESS_DENIED).toBe('ACCESS_DENIED');
      expect(AuthenticationErrorCodes.UNAUTHORIZED_CLIENT).toBe(
        'UNAUTHORIZED_CLIENT'
      );

      // Token exchange errors
      expect(AuthenticationErrorCodes.INVALID_SUBJECT_TOKEN).toBe(
        'INVALID_SUBJECT_TOKEN'
      );
      expect(AuthenticationErrorCodes.UNSUPPORTED_TOKEN_TYPE).toBe(
        'UNSUPPORTED_TOKEN_TYPE'
      );
      expect(AuthenticationErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED).toBe(
        'TOKEN_EXCHANGE_NOT_CONFIGURED'
      );
      expect(AuthenticationErrorCodes.INVALID_AUDIENCE).toBe(
        'INVALID_AUDIENCE'
      );
      expect(AuthenticationErrorCodes.INVALID_SCOPE).toBe('INVALID_SCOPE');
      expect(AuthenticationErrorCodes.TOKEN_EXCHANGE_DENIED).toBe(
        'TOKEN_EXCHANGE_DENIED'
      );
      expect(AuthenticationErrorCodes.TOKEN_VALIDATION_FAILED).toBe(
        'TOKEN_VALIDATION_FAILED'
      );

      // Password errors
      expect(AuthenticationErrorCodes.PASSWORD_STRENGTH).toBe(
        'PASSWORD_STRENGTH'
      );
      expect(AuthenticationErrorCodes.PASSWORD_LEAKED).toBe('PASSWORD_LEAKED');
      expect(AuthenticationErrorCodes.PASSWORD_ALREADY_USED).toBe(
        'PASSWORD_ALREADY_USED'
      );

      // MFA errors
      expect(AuthenticationErrorCodes.MFA_REQUIRED).toBe('MFA_REQUIRED');
      expect(AuthenticationErrorCodes.MFA_INVALID_CODE).toBe(
        'MFA_INVALID_CODE'
      );
      expect(AuthenticationErrorCodes.MFA_TOKEN_INVALID).toBe(
        'MFA_TOKEN_INVALID'
      );

      // Rate limiting
      expect(AuthenticationErrorCodes.TOO_MANY_ATTEMPTS).toBe(
        'TOO_MANY_ATTEMPTS'
      );
      expect(AuthenticationErrorCodes.VERIFICATION_REQUIRED).toBe(
        'VERIFICATION_REQUIRED'
      );
      expect(AuthenticationErrorCodes.LOGIN_REQUIRED).toBe('LOGIN_REQUIRED');

      // Common errors
      expect(AuthenticationErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(AuthenticationErrorCodes.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(AuthenticationErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});
