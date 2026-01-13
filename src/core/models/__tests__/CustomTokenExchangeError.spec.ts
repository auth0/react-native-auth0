import {
  CustomTokenExchangeError,
  CustomTokenExchangeErrorCodes,
} from '../CustomTokenExchangeError';
import { AuthError } from '../AuthError';

describe('CustomTokenExchangeError', () => {
  describe('constructor', () => {
    it('should create error with correct name', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.name).toBe('CustomTokenExchangeError');
    });

    it('should preserve the underlying error', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.underlyingError).toBe(authError);
    });

    it('should preserve the error message', () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'invalid_grant',
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.message).toBe('Token expired');
    });
  });

  describe('error code mapping', () => {
    it.each([
      // RFC 8693 error codes
      ['invalid_request', CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN],
      ['invalid_grant', CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN],
      ['invalid_token', CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN],
      [
        'unsupported_token_type',
        CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE,
      ],
      ['invalid_target', CustomTokenExchangeErrorCodes.INVALID_AUDIENCE],
      ['invalid_scope', CustomTokenExchangeErrorCodes.INVALID_SCOPE],
      ['access_denied', CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED],
      [
        'unauthorized_client',
        CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
      ],
      ['server_error', CustomTokenExchangeErrorCodes.SERVER_ERROR],

      // Auth0-specific error codes
      [
        'a0.token_exchange_failed',
        CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED,
      ],
      [
        'a0.token_exchange_not_enabled',
        CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
      ],
      [
        'a0.invalid_subject_token',
        CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
      ],
      [
        'a0.subject_token_expired',
        CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
      ],
      [
        'a0.subject_token_validation_failed',
        CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,
      ],
      [
        'a0.action_failed',
        CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,
      ],

      // Native SDK codes
      [
        'INVALID_SUBJECT_TOKEN',
        CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN,
      ],
      [
        'UNSUPPORTED_TOKEN_TYPE',
        CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE,
      ],
      [
        'TOKEN_EXCHANGE_FAILED',
        CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED,
      ],
      [
        'TOKEN_EXCHANGE_NOT_CONFIGURED',
        CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED,
      ],
      [
        'TOKEN_VALIDATION_FAILED',
        CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED,
      ],

      // Network errors
      ['a0.network_error', CustomTokenExchangeErrorCodes.NETWORK_ERROR],
      ['NETWORK_ERROR', CustomTokenExchangeErrorCodes.NETWORK_ERROR],
      ['network_error', CustomTokenExchangeErrorCodes.NETWORK_ERROR],
    ])('should map "%s" to %s', (errorCode, expectedType) => {
      const authError = new AuthError(errorCode, 'Test error', {
        code: errorCode,
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.type).toBe(expectedType);
    });

    it('should map unknown error codes to UNKNOWN_ERROR', () => {
      const authError = new AuthError('some_unknown_code', 'Unknown error', {
        code: 'some_unknown_code',
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.type).toBe(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR);
    });

    it('should use default code when code is not explicitly provided', () => {
      // When code is not provided in details, AuthError defaults to 'unknown_error'
      const authError = new AuthError('invalid_grant', 'Test error');
      const error = new CustomTokenExchangeError(authError);

      // Since code defaults to 'unknown_error', it maps to UNKNOWN_ERROR
      expect(error.type).toBe(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR);
    });

    it('should prefer explicit code over name when mapping error type', () => {
      const authError = new AuthError('some_name', 'Test error', {
        code: 'invalid_grant',
      });
      const error = new CustomTokenExchangeError(authError);

      expect(error.type).toBe(
        CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN
      );
    });
  });

  describe('from factory method', () => {
    it('should return the same error if already a CustomTokenExchangeError', () => {
      const authError = new AuthError('invalid_grant', 'Test error');
      const originalError = new CustomTokenExchangeError(authError);
      const result = CustomTokenExchangeError.from(originalError);

      expect(result).toBe(originalError);
    });

    it('should wrap AuthError in CustomTokenExchangeError', () => {
      const authError = new AuthError('invalid_grant', 'Test error', {
        code: 'invalid_grant',
      });
      const result = CustomTokenExchangeError.from(authError);

      expect(result).toBeInstanceOf(CustomTokenExchangeError);
      expect(result.underlyingError).toBe(authError);
    });

    it('should wrap generic Error in CustomTokenExchangeError', () => {
      const genericError = new Error('Something went wrong');
      const result = CustomTokenExchangeError.from(genericError);

      expect(result).toBeInstanceOf(CustomTokenExchangeError);
      expect(result.message).toBe('Something went wrong');
      expect(result.type).toBe(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR);
    });

    it('should wrap string error in CustomTokenExchangeError', () => {
      const result = CustomTokenExchangeError.from('String error message');

      expect(result).toBeInstanceOf(CustomTokenExchangeError);
      expect(result.message).toBe('String error message');
      expect(result.type).toBe(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR);
    });

    it('should handle null/undefined errors', () => {
      const result = CustomTokenExchangeError.from(null);

      expect(result).toBeInstanceOf(CustomTokenExchangeError);
      expect(result.type).toBe(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR);
    });
  });

  describe('CustomTokenExchangeErrorCodes', () => {
    it('should export all expected error codes', () => {
      expect(CustomTokenExchangeErrorCodes.INVALID_SUBJECT_TOKEN).toBe(
        'INVALID_SUBJECT_TOKEN'
      );
      expect(CustomTokenExchangeErrorCodes.UNSUPPORTED_TOKEN_TYPE).toBe(
        'UNSUPPORTED_TOKEN_TYPE'
      );
      expect(CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_NOT_CONFIGURED).toBe(
        'TOKEN_EXCHANGE_NOT_CONFIGURED'
      );
      expect(CustomTokenExchangeErrorCodes.INVALID_AUDIENCE).toBe(
        'INVALID_AUDIENCE'
      );
      expect(CustomTokenExchangeErrorCodes.INVALID_SCOPE).toBe('INVALID_SCOPE');
      expect(CustomTokenExchangeErrorCodes.TOKEN_EXCHANGE_DENIED).toBe(
        'TOKEN_EXCHANGE_DENIED'
      );
      expect(CustomTokenExchangeErrorCodes.TOKEN_VALIDATION_FAILED).toBe(
        'TOKEN_VALIDATION_FAILED'
      );
      expect(CustomTokenExchangeErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(CustomTokenExchangeErrorCodes.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(CustomTokenExchangeErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});
