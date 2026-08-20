import { AuthError } from '../AuthError';
import { MyAccountError, MyAccountErrorCodes } from '../MyAccountError';

/**
 * Builds the AuthError the platform adapters hand to MyAccountError: the RFC
 * 7807 problem-details document arrives JSON-encoded in `message`, and the web
 * adapter surfaces the opaque type URI as `code`.
 */
function problemDetails(
  details: {
    type?: string;
    title?: string;
    detail?: string;
    status?: number;
    statusCode?: number;
  },
  code = details.type ?? '',
  status = 0
) {
  return new AuthError('AuthError', JSON.stringify(details), { status, code });
}

describe('MyAccountError', () => {
  describe('RFC 7807 parsing', () => {
    it('extracts title, detail, and statusCode from the problem document', () => {
      const error = new MyAccountError(
        problemDetails({
          type: 'https://auth0.com/api-errors/A0E-401',
          title: 'Unauthorized',
          detail: 'The access token is invalid or has expired',
          statusCode: 401,
        })
      );

      expect(error.title).toBe('Unauthorized');
      expect(error.detail).toBe('The access token is invalid or has expired');
      expect(error.statusCode).toBe(401);
    });

    it('preserves the raw type URI on typeUri', () => {
      const error = new MyAccountError(
        problemDetails({
          type: 'https://auth0.com/api-errors/A0E-400-0001',
          statusCode: 400,
        })
      );

      expect(error.typeUri).toBe('https://auth0.com/api-errors/A0E-400-0001');
    });

    it('reads the RFC 7807 `status` field even when AuthError.status is 0', () => {
      // Regression: a spec-compliant problem document uses `status`, not the
      // nonstandard `statusCode`. The adapter that built the AuthError may not
      // have populated `.status`, so `parsed.status` must be checked first.
      const error = new MyAccountError(
        problemDetails({
          type: 'https://auth0.com/api-errors/A0E-401-0001',
          status: 401,
        })
      );

      expect(error.statusCode).toBe(401);
      expect(error.type).toBe(MyAccountErrorCodes.UNAUTHORIZED);
    });

    it('falls back to raw values when the message is not JSON', () => {
      const error = new MyAccountError(
        new AuthError('AuthError', 'Network request failed', {
          status: 0,
          code: 'a0.network_error',
        })
      );

      expect(error.typeUri).toBe('a0.network_error');
      expect(error.title).toBe('');
      expect(error.detail).toBe('Network request failed');
      expect(error.statusCode).toBe(0);
    });
  });

  describe('type normalization', () => {
    // The API's type URIs embed the HTTP status (A0E-401, A0E-400-0001) and the
    // granular suffixes are not a closed set, so `type` normalizes on status.
    it.each([
      [400, MyAccountErrorCodes.INVALID_REQUEST],
      [401, MyAccountErrorCodes.UNAUTHORIZED],
      [403, MyAccountErrorCodes.UNAUTHORIZED],
      [404, MyAccountErrorCodes.NOT_FOUND],
      [409, MyAccountErrorCodes.CONFLICT],
      [429, MyAccountErrorCodes.TOO_MANY_REQUESTS],
    ])('normalizes HTTP %i to %s', (statusCode, expected) => {
      const error = new MyAccountError(
        problemDetails({
          type: `https://auth0.com/api-errors/A0E-${statusCode}`,
          statusCode,
        })
      );

      expect(error.type).toBe(expected);
    });

    it('normalizes an unmapped status to UNKNOWN_MY_ACCOUNT_ERROR', () => {
      const error = new MyAccountError(
        problemDetails({
          type: 'https://auth0.com/api-errors/A0E-500',
          statusCode: 500,
        })
      );

      expect(error.type).toBe(MyAccountErrorCodes.UNKNOWN_MY_ACCOUNT_ERROR);
    });

    it.each([
      ['MY_ACCOUNT_ENROLLMENT_FAILED', MyAccountErrorCodes.ENROLLMENT_FAILED],
      [
        'MY_ACCOUNT_VERIFICATION_FAILED',
        MyAccountErrorCodes.VERIFICATION_FAILED,
      ],
      ['MY_ACCOUNT_ERROR', MyAccountErrorCodes.MY_ACCOUNT_ERROR],
    ])('maps the native bridge code %s to %s', (code, expected) => {
      const error = new MyAccountError(
        new AuthError('AuthError', 'enrollment failed', { status: 0, code })
      );

      expect(error.type).toBe(expected);
    });

    it('prefers the native bridge code over the HTTP status', () => {
      // A native enrollment failure carrying a 400 must stay ENROLLMENT_FAILED
      // rather than degrading to the generic INVALID_REQUEST.
      const error = new MyAccountError(
        problemDetails({ statusCode: 400 }, 'MY_ACCOUNT_ENROLLMENT_FAILED', 400)
      );

      expect(error.type).toBe(MyAccountErrorCodes.ENROLLMENT_FAILED);
    });

    it('falls back to UNKNOWN_MY_ACCOUNT_ERROR with neither signal', () => {
      const error = new MyAccountError(
        new AuthError('AuthError', 'something broke', {
          status: 0,
          code: 'unrecognized',
        })
      );

      expect(error.type).toBe(MyAccountErrorCodes.UNKNOWN_MY_ACCOUNT_ERROR);
    });
  });

  it('keeps the originating wire code alongside the normalized type', () => {
    const error = new MyAccountError(
      problemDetails(
        { type: 'https://auth0.com/api-errors/A0E-401', statusCode: 401 },
        'https://auth0.com/api-errors/A0E-401',
        401
      )
    );

    expect(error.type).toBe(MyAccountErrorCodes.UNAUTHORIZED);
    expect(error.code).toBe('https://auth0.com/api-errors/A0E-401');
    expect(error.typeUri).toBe('https://auth0.com/api-errors/A0E-401');
  });

  it('is an AuthError', () => {
    expect(new MyAccountError(problemDetails({}))).toBeInstanceOf(AuthError);
  });
});
