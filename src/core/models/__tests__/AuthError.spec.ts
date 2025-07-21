import { AuthError } from '../AuthError';

// Helper to create a mock Response object
const createMockResponse = (body: any, status: number): Response => {
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  // The Response constructor is available in our jest-environment-jsdom setup
  return new Response(bodyString, { status });
};

describe('AuthError', () => {
  describe('constructor', () => {
    it('should correctly assign all provided properties', () => {
      const errorDetails = {
        status: 401,
        code: 'invalid_token',
        json: { error_description: 'The token is expired' },
      };
      const error = new AuthError(
        'Unauthorized',
        'The token is expired',
        errorDetails
      );

      // Verify it's a proper Error instance
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthError);

      // Verify properties are assigned correctly
      expect(error.name).toBe('Unauthorized');
      expect(error.message).toBe('The token is expired');
      expect(error.status).toBe(401);
      expect(error.code).toBe('invalid_token');
      expect(error.json).toEqual(errorDetails.json);
    });

    it('should use default values for missing optional details', () => {
      const error = new AuthError('GenericError', 'Something went wrong');

      expect(error.name).toBe('GenericError');
      expect(error.message).toBe('Something went wrong');
      expect(error.status).toBe(0); // Default status
      expect(error.code).toBe('unknown_error'); // Default code
      expect(error.json).toBeUndefined(); // Default json
    });
  });

  describe('fromResponse', () => {
    it('should correctly parse a standard OAuth2 error response from an object body', () => {
      const body = {
        error: 'invalid_grant',
        error_description: 'The authorization code is invalid or expired.',
      };
      const response = createMockResponse(body, 403);
      const authError = AuthError.fromResponse(response, body);

      expect(authError.name).toBe('invalid_grant');
      expect(authError.message).toBe(
        'The authorization code is invalid or expired.'
      );
      expect(authError.status).toBe(403);
      expect(authError.code).toBe('invalid_grant');
      expect(authError.json).toEqual(body);
    });

    it('should correctly parse a Management API error response', () => {
      const body = {
        statusCode: 409, // This is just part of the body, not used for the status
        error: 'Conflict',
        message: 'The user already exists.',
        code: 'user_exists',
      };
      const response = createMockResponse(body, 409);
      const authError = AuthError.fromResponse(response, body);

      expect(authError.name).toBe('Conflict');
      expect(authError.message).toBe('The user already exists.');
      expect(authError.status).toBe(409);
      expect(authError.code).toBe('user_exists'); // 'errorCode' should be prioritized for `code`
      expect(authError.json).toEqual(body);
    });

    it('should handle non-JSON text bodies by using default error info', () => {
      const body = 'Internal Server Error';
      const response = createMockResponse(body, 500);
      const authError = AuthError.fromResponse(response, body);

      expect(authError.name).toBe('a0.response.invalid'); // Default from destructuring
      expect(authError.message).toBe('Unknown error'); // Default from destructuring
      expect(authError.status).toBe(500);
      expect(authError.code).toBe('a0.response.invalid');
      expect(authError.json).toBe('Internal Server Error'); // The raw body is still stored
    });

    it('should handle null or undefined bodies gracefully', () => {
      const response = createMockResponse(null, 401);
      const authError = AuthError.fromResponse(response, null);

      expect(authError.name).toBe('a0.response.invalid');
      expect(authError.message).toBe('Unknown error');
      expect(authError.status).toBe(401);
      expect(authError.code).toBe('a0.response.invalid');
      expect(authError.json).toBeNull();
    });

    it('should prioritize the `message` field over `error_description` when both exist', () => {
      const body = {
        error: 'some_error',
        error_description: 'This is the error description.',
        message: 'This is the more specific message.',
      };
      const response = createMockResponse(body, 400);
      const authError = AuthError.fromResponse(response, body);

      expect(authError.message).toBe('This is the more specific message.');
    });

    it('should prioritize the `code` field over `error` for the `code` property when both exist', () => {
      const body = {
        error: 'generic_error',
        code: 'specific_error_code',
        error_description: 'An error occurred.',
      };
      const response = createMockResponse(body, 400);
      const authError = AuthError.fromResponse(response, body);

      expect(authError.code).toBe('specific_error_code');
      expect(authError.name).toBe('generic_error'); // The `name` property should still come from `error`
    });
  });
});
