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
});
