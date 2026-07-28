import { AuthError, PasskeyError, PasskeyErrorCodes } from '../';

describe('PasskeyError', () => {
  const wrap = (code: string) =>
    new AuthError('name', 'message', {
      code,
      status: 400,
      json: { some: 'body' },
    });

  it('should be an instance of AuthError', () => {
    const error = new PasskeyError(wrap('PASSKEY_CHALLENGE_FAILED'));
    expect(error).toBeInstanceOf(AuthError);
    expect(error).toBeInstanceOf(PasskeyError);
  });

  it('should preserve the original error properties', () => {
    const error = new PasskeyError(wrap('PASSKEY_CHALLENGE_FAILED'));
    expect(error.name).toBe('name');
    expect(error.message).toBe('message');
    expect(error.code).toBe('PASSKEY_CHALLENGE_FAILED');
    expect(error.status).toBe(400);
    expect(error.json).toEqual({ some: 'body' });
  });

  describe('type from recognized codes', () => {
    const cases: [string, string][] = [
      ['PASSKEY_NOT_AVAILABLE', PasskeyErrorCodes.NOT_AVAILABLE],
      ['PASSKEY_CHALLENGE_FAILED', PasskeyErrorCodes.CHALLENGE_FAILED],
      ['PASSKEY_EXCHANGE_FAILED', PasskeyErrorCodes.EXCHANGE_FAILED],
      ['UnsupportedOperation', PasskeyErrorCodes.UNSUPPORTED_PLATFORM],
    ];

    it.each(cases)('maps %s -> %s', (code, expected) => {
      expect(new PasskeyError(wrap(code)).type).toBe(expected);
    });
  });

  describe('fallback for unrecognized codes', () => {
    it('defaults to UNKNOWN_ERROR when no fallback is given', () => {
      // Web My Account API surfaces opaque RFC 7807 type URIs as the code.
      const err = new PasskeyError(
        wrap('https://auth0.com/api-errors/A0E-400-0001')
      );
      expect(err.type).toBe(PasskeyErrorCodes.UNKNOWN_ERROR);
    });

    it('uses the caller-supplied fallback for an unrecognized code', () => {
      const err = new PasskeyError(
        wrap('https://auth0.com/api-errors/A0E-400-0001'),
        PasskeyErrorCodes.CHALLENGE_FAILED
      );
      expect(err.type).toBe(PasskeyErrorCodes.CHALLENGE_FAILED);
    });

    it('prefers a recognized code over the fallback', () => {
      const err = new PasskeyError(
        wrap('PASSKEY_NOT_AVAILABLE'),
        PasskeyErrorCodes.CHALLENGE_FAILED
      );
      expect(err.type).toBe(PasskeyErrorCodes.NOT_AVAILABLE);
    });
  });

  describe('error code mapping', () => {
    const testCases: [string, string, string][] = [
      [
        'PASSKEY_NOT_AVAILABLE',
        'PASSKEY_NOT_AVAILABLE',
        'native: passkeys unavailable on this device/OS',
      ],
      [
        'PASSKEY_CHALLENGE_FAILED',
        'PASSKEY_CHALLENGE_FAILED',
        'native: challenge request failed',
      ],
      [
        'PASSKEY_EXCHANGE_FAILED',
        'PASSKEY_EXCHANGE_FAILED',
        'native: token exchange failed',
      ],
      [
        'InvalidParameter',
        'PASSKEY_INVALID_PARAMETER',
        'SDK-level parameter validation (native authResponse-must-be-a-string guard)',
      ],
      [
        'UnsupportedOperation',
        'PASSKEY_UNSUPPORTED_PLATFORM',
        'operation not supported on this platform',
      ],
      [
        'passkey_not_supported',
        'PASSKEY_NOT_AVAILABLE',
        'spa-js: WebAuthn unsupported in this browser',
      ],
      [
        'passkey_register_error',
        'PASSKEY_CHALLENGE_FAILED',
        'spa-js: signup challenge request failed',
      ],
      [
        'passkey_challenge_error',
        'PASSKEY_CHALLENGE_FAILED',
        'spa-js: login challenge request failed',
      ],
      [
        'passkey_get_token_error',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: token exchange failed',
      ],
      [
        'passkey_invalid_credential',
        'PASSKEY_INVALID_CREDENTIAL',
        'spa-js: credential is neither an attestation nor an assertion response',
      ],
      [
        'invalid_grant',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: GenericError from the /oauth/token webauthn grant',
      ],
      [
        'access_denied',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: GenericError, access denied during token exchange',
      ],
      [
        'invalid_request',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: GenericError, malformed token request',
      ],
      [
        'mfa_required',
        'PASSKEY_MFA_REQUIRED',
        'spa-js: MfaRequiredError during the webauthn grant token exchange',
      ],
      [
        'missing_refresh_token',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: MissingRefreshTokenError',
      ],
      [
        'use_dpop_nonce',
        'PASSKEY_EXCHANGE_FAILED',
        'spa-js: UseDpopNonceError (DPoP nonce retry exhausted)',
      ],
    ];

    it.each(testCases)(
      'should map code "%s" to type "%s" (%s)',
      (code, expectedType) => {
        const original = new AuthError('error', 'message', { code });
        const error = new PasskeyError(original);
        expect(error.type).toBe(expectedType);
      }
    );

    it('should fall back to UNKNOWN_ERROR for unmapped codes', () => {
      const original = new AuthError('some_error', 'Something', {
        code: 'completely_unknown_code',
      });
      const error = new PasskeyError(original);
      expect(error.type).toBe(PasskeyErrorCodes.UNKNOWN_ERROR);
    });

    it('should preserve the original descriptive message even when the code is unmapped', () => {
      // e.g. auth0-spa-js's ID token verification throws a bare Error with
      // no .code/.error at all — the message is the only signal available,
      // and it must survive even though .type can only be UNKNOWN_ERROR.
      const original = new AuthError(
        'Error',
        'Signature algorithm of "none" is not supported. Expected the ID token to be signed with "RS256".',
        { code: 'unknown_error' }
      );
      const error = new PasskeyError(original);
      expect(error.type).toBe(PasskeyErrorCodes.UNKNOWN_ERROR);
      expect(error.message).toBe(
        'Signature algorithm of "none" is not supported. Expected the ID token to be signed with "RS256".'
      );
    });
  });

  describe('Unmapped error codes', () => {
    it('should fall back to UNKNOWN_ERROR for unrecognized AuthError code while preserving the message', () => {
      const original = new AuthError(
        'unknown_passkey_error',
        'Some future passkey error from spa-js',
        { code: 'unknown_passkey_error' }
      );
      const error = new PasskeyError(original);
      expect(error.type).toBe(PasskeyErrorCodes.UNKNOWN_ERROR);
      expect(error.message).toBe('Some future passkey error from spa-js');
    });

    it('should fall back to UNKNOWN_ERROR for a plain Error with no matching name', () => {
      const e = new Error('Network request failed');
      const error = new PasskeyError(e);
      expect(error.type).toBe(PasskeyErrorCodes.UNKNOWN_ERROR);
      expect(error.message).toBe('Network request failed');
    });

    it('should expose the original error via .json for app-level inspection', () => {
      const original = new AuthError('unknown_error', 'Something went wrong', {
        code: 'unknown_error',
        json: { detail: 'Internal error' },
      });
      const error = new PasskeyError(original);
      expect(error.json).toEqual({ detail: 'Internal error' });
    });
  });

  describe('getMfaRequiredPayload()', () => {
    it('should return structured MFA payload when type is PASSKEY_MFA_REQUIRED', () => {
      const authError = new AuthError(
        'mfa_required',
        'MFA is required to complete this request',
        {
          code: 'mfa_required',
          status: 403,
          json: {
            error: 'mfa_required',
            error_description: 'MFA is required to complete this request',
            mfa_token: 'mfa_tok_abc123',
            mfa_requirements: {
              enroll: [{ type: 'otp' }],
              challenge: [{ type: 'sms' }, { type: 'email' }],
            },
          },
        }
      );
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload).not.toBeNull();
      expect(payload).toEqual({
        mfaToken: 'mfa_tok_abc123',
        error: 'mfa_required',
        errorDescription: 'MFA is required to complete this request',
        mfaRequirements: {
          enroll: [{ type: 'otp' }],
          challenge: [{ type: 'sms' }, { type: 'email' }],
        },
      });
    });

    it('should return null when type is not PASSKEY_MFA_REQUIRED', () => {
      const authError = new AuthError(
        'passkey_challenge_error',
        'Challenge failed',
        {
          code: 'passkey_challenge_error',
          status: 400,
        }
      );
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload).toBeNull();
    });

    it('should handle missing mfa_requirements gracefully', () => {
      const authError = new AuthError('mfa_required', 'MFA required', {
        code: 'mfa_required',
        json: {
          error: 'mfa_required',
          error_description: 'MFA required',
          mfa_token: 'mfa_tok_xyz',
          // mfa_requirements intentionally omitted
        },
      });
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload).not.toBeNull();
      expect(payload).toEqual({
        mfaToken: 'mfa_tok_xyz',
        error: 'mfa_required',
        errorDescription: 'MFA required',
        mfaRequirements: undefined,
      });
    });

    it('should fallback to empty string for missing mfa_token', () => {
      const authError = new AuthError('mfa_required', 'MFA required', {
        code: 'mfa_required',
        json: {
          error: 'mfa_required',
          error_description: 'MFA required',
          // mfa_token intentionally omitted
        },
      });
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload).not.toBeNull();
      expect(payload?.mfaToken).toBe('');
    });

    it('should use error.code as fallback for missing json.error', () => {
      const authError = new AuthError('mfa_required', 'MFA required', {
        code: 'mfa_required',
        json: {
          // error field missing
          mfa_token: 'mfa_tok_123',
        },
      });
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload?.error).toBe('mfa_required');
    });

    it('should use error.message as fallback for missing error_description', () => {
      const authError = new AuthError('mfa_required', 'Fallback message', {
        code: 'mfa_required',
        json: {
          error: 'mfa_required',
          mfa_token: 'mfa_tok_123',
          // error_description missing
        },
      });
      const error = new PasskeyError(authError);

      const payload = error.getMfaRequiredPayload();

      expect(payload?.errorDescription).toBe('Fallback message');
    });
  });
});

describe('PasskeyErrorCodes', () => {
  it('should export all expected error code constants', () => {
    expect(PasskeyErrorCodes.NOT_AVAILABLE).toBe('PASSKEY_NOT_AVAILABLE');
    expect(PasskeyErrorCodes.CHALLENGE_FAILED).toBe('PASSKEY_CHALLENGE_FAILED');
    expect(PasskeyErrorCodes.EXCHANGE_FAILED).toBe('PASSKEY_EXCHANGE_FAILED');
    expect(PasskeyErrorCodes.INVALID_CREDENTIAL).toBe(
      'PASSKEY_INVALID_CREDENTIAL'
    );
    expect(PasskeyErrorCodes.UNSUPPORTED_PLATFORM).toBe(
      'PASSKEY_UNSUPPORTED_PLATFORM'
    );
    expect(PasskeyErrorCodes.INVALID_PARAMETER).toBe(
      'PASSKEY_INVALID_PARAMETER'
    );
    expect(PasskeyErrorCodes.MFA_REQUIRED).toBe('PASSKEY_MFA_REQUIRED');
    expect(PasskeyErrorCodes.UNKNOWN_ERROR).toBe('PASSKEY_UNKNOWN_ERROR');
  });
});
