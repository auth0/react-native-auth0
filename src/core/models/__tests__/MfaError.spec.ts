import { AuthError, MfaError, MfaErrorCodes } from '../';

describe('MfaError', () => {
  it('should be an instance of AuthError', () => {
    const original = new AuthError('invalid_otp', 'Invalid OTP code', {
      code: 'invalid_otp',
      status: 403,
    });
    const error = new MfaError(original);
    expect(error).toBeInstanceOf(AuthError);
    expect(error).toBeInstanceOf(MfaError);
  });

  it('should preserve the original error properties', () => {
    const original = new AuthError('invalid_otp', 'Invalid OTP code', {
      code: 'invalid_otp',
      status: 403,
      json: { error: 'invalid_otp' },
    });
    const error = new MfaError(original);

    expect(error.name).toBe('invalid_otp');
    expect(error.message).toBe('Invalid OTP code');
    expect(error.code).toBe('invalid_otp');
    expect(error.status).toBe(403);
    expect(error.json).toEqual({ error: 'invalid_otp' });
  });

  describe('error code mapping', () => {
    const testCases: [string, string, string][] = [
      ['invalid_otp', 'INVALID_OTP', 'Auth0 API OTP error'],
      ['invalid_oob_code', 'INVALID_OOB_CODE', 'Auth0 API OOB error'],
      [
        'invalid_binding_code',
        'INVALID_BINDING_CODE',
        'Auth0 API binding code error',
      ],
      [
        'invalid_recovery_code',
        'INVALID_RECOVERY_CODE',
        'Auth0 API recovery code error',
      ],
      ['invalid_grant', 'INVALID_OTP', 'Auth0 API generic grant error for MFA'],
      ['mfa_token_invalid', 'INVALID_MFA_TOKEN', 'invalid MFA token'],
      ['expired_token', 'EXPIRED_MFA_TOKEN', 'expired MFA token'],
      ['too_many_attempts', 'TOO_MANY_ATTEMPTS', 'rate limit'],
      [
        'unsupported_challenge_type',
        'UNSUPPORTED_FACTOR',
        'unsupported factor',
      ],
      ['association_required', 'ASSOCIATION_REQUIRED', 'association required'],
      ['invalid_phone_number', 'INVALID_PHONE_NUMBER', 'invalid phone'],
      ['invalid_email', 'INVALID_EMAIL', 'invalid email'],
      ['MFA_ENROLLMENT_ERROR', 'ENROLLMENT_FAILED', 'native enrollment error'],
      ['MFA_VERIFY_ERROR', 'MFA_ERROR', 'native verify error'],
      ['MFA_CHALLENGE_ERROR', 'CHALLENGE_FAILED', 'native challenge error'],
      ['mfa_enrollment_failed', 'ENROLLMENT_FAILED', 'web enrollment error'],
      ['mfa_list_authenticators_failed', 'MFA_ERROR', 'web list error'],
      ['mfa_challenge_failed', 'CHALLENGE_FAILED', 'web challenge error'],
      ['mfa_verify_failed', 'MFA_ERROR', 'web verify error'],
    ];

    it.each(testCases)(
      'should map code "%s" to type "%s" (%s)',
      (code, expectedType) => {
        const original = new AuthError('error', 'message', { code });
        const error = new MfaError(original);
        expect(error.type).toBe(expectedType);
      }
    );

    it('should fall back to UNKNOWN_MFA_ERROR for unmapped codes', () => {
      const original = new AuthError('some_error', 'Something', {
        code: 'completely_unknown_code',
      });
      const error = new MfaError(original);
      expect(error.type).toBe(MfaErrorCodes.UNKNOWN_MFA_ERROR);
    });
  });
});

describe('MfaErrorCodes', () => {
  it('should export all expected error code constants', () => {
    expect(MfaErrorCodes.INVALID_OTP).toBe('INVALID_OTP');
    expect(MfaErrorCodes.INVALID_OOB_CODE).toBe('INVALID_OOB_CODE');
    expect(MfaErrorCodes.INVALID_BINDING_CODE).toBe('INVALID_BINDING_CODE');
    expect(MfaErrorCodes.INVALID_RECOVERY_CODE).toBe('INVALID_RECOVERY_CODE');
    expect(MfaErrorCodes.ENROLLMENT_FAILED).toBe('ENROLLMENT_FAILED');
    expect(MfaErrorCodes.INVALID_PHONE_NUMBER).toBe('INVALID_PHONE_NUMBER');
    expect(MfaErrorCodes.INVALID_EMAIL).toBe('INVALID_EMAIL');
    expect(MfaErrorCodes.EXPIRED_MFA_TOKEN).toBe('EXPIRED_MFA_TOKEN');
    expect(MfaErrorCodes.INVALID_MFA_TOKEN).toBe('INVALID_MFA_TOKEN');
    expect(MfaErrorCodes.TOO_MANY_ATTEMPTS).toBe('TOO_MANY_ATTEMPTS');
    expect(MfaErrorCodes.CHALLENGE_FAILED).toBe('CHALLENGE_FAILED');
    expect(MfaErrorCodes.AUTHENTICATOR_NOT_FOUND).toBe(
      'AUTHENTICATOR_NOT_FOUND'
    );
    expect(MfaErrorCodes.UNSUPPORTED_FACTOR).toBe('UNSUPPORTED_FACTOR');
    expect(MfaErrorCodes.ASSOCIATION_REQUIRED).toBe('ASSOCIATION_REQUIRED');
    expect(MfaErrorCodes.MFA_ERROR).toBe('MFA_ERROR');
    expect(MfaErrorCodes.UNKNOWN_MFA_ERROR).toBe('UNKNOWN_MFA_ERROR');
  });

  it('should have exactly 16 error codes', () => {
    const keys = Object.keys(MfaErrorCodes);
    expect(keys).toHaveLength(16);
  });

  it('should be usable in switch statements', () => {
    const testErrorType = 'INVALID_OTP';
    let result = '';

    switch (testErrorType) {
      case MfaErrorCodes.INVALID_OTP:
        result = 'invalid_otp';
        break;
      case MfaErrorCodes.EXPIRED_MFA_TOKEN:
        result = 'expired';
        break;
      default:
        result = 'unknown';
    }

    expect(result).toBe('invalid_otp');
  });
});
