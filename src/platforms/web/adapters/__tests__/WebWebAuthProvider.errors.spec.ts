import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { WebAuthError } from '../../../../core/models';

jest.mock('@auth0/auth0-spa-js');

describe('WebWebAuthProvider Error Handling', () => {
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let provider: WebWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpaClient = new (Auth0Client as jest.Mock<Auth0Client>)({
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
    });
    provider = new WebWebAuthProvider(mockSpaClient);
  });

  describe('Web-Specific Error Mappings', () => {
    const webErrorTestCases = [
      {
        error: 'access_denied',
        error_description: 'Logout denied',
        expectedType: 'ACCESS_DENIED',
        method: 'clearSession',
        mockMethod: 'logout',
      },
      {
        error: 'cancelled',
        error_description: 'Popup closed',
        expectedType: 'USER_CANCELLED',
        method: 'clearSession',
        mockMethod: 'logout',
      },
      {
        error: 'state_mismatch',
        error_description: 'Invalid state',
        expectedType: 'INVALID_STATE',
        method: 'handleRedirectCallback',
        mockMethod: 'handleRedirectCallback',
      },
      {
        error: 'login_required',
        error_description: 'Login is required',
        expectedType: 'ACCESS_DENIED',
        method: 'authorize',
        mockMethod: 'loginWithRedirect',
      },
      {
        error: 'timeout',
        error_description: 'Request timed out',
        expectedType: 'TIMEOUT_ERROR',
        method: 'authorize',
        mockMethod: 'loginWithRedirect',
      },
      {
        error: 'consent_required',
        error_description: 'Consent is required',
        expectedType: 'CONSENT_REQUIRED',
        method: 'authorize',
        mockMethod: 'loginWithRedirect',
      },
    ];

    webErrorTestCases.forEach(
      ({ error, error_description, expectedType, method, mockMethod }) => {
        it(`should map ${error} to ${expectedType}`, async () => {
          const spaJsError = { error, error_description };
          (
            mockSpaClient[mockMethod as keyof typeof mockSpaClient] as jest.Mock
          ).mockRejectedValue(spaJsError);

          await expect((provider as any)[method]()).rejects.toThrow(
            WebAuthError
          );

          try {
            await (provider as any)[method]();
          } catch (e) {
            const err = e as WebAuthError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(error_description);
          }
        });
      }
    );
  });

  describe('Special State Validation for Web', () => {
    it('should handle state_mismatch error with special validation', async () => {
      const spaJsError = {
        error: 'state_mismatch',
        error_description: 'state is invalid',
      };
      mockSpaClient.handleRedirectCallback.mockRejectedValue(spaJsError);

      await expect(provider.handleRedirectCallback()).rejects.toThrow(
        WebAuthError
      );

      try {
        await provider.handleRedirectCallback();
      } catch (e) {
        const err = e as WebAuthError;
        expect(err.type).toBe('INVALID_STATE');
        expect(err.message).toBe('state is invalid');
      }
    });

    it('should handle error with "state is invalid" in message', async () => {
      const spaJsError = {
        error: 'some_other_error',
        error_description: 'The state is invalid and cannot be processed',
      };
      mockSpaClient.handleRedirectCallback.mockRejectedValue(spaJsError);

      await expect(provider.handleRedirectCallback()).rejects.toThrow(
        WebAuthError
      );

      try {
        await provider.handleRedirectCallback();
      } catch (e) {
        const err = e as WebAuthError;
        expect(err.type).toBe('INVALID_STATE');
        expect(err.message).toBe(
          'The state is invalid and cannot be processed'
        );
      }
    });
  });

  describe('Unknown Error Handling', () => {
    it('should handle unknown error codes with UNKNOWN_ERROR type', async () => {
      const spaJsError = {
        error: 'unknown_spa_error',
        error_description: 'An unknown SPA error occurred',
      };
      mockSpaClient.loginWithRedirect.mockRejectedValue(spaJsError);

      await expect(provider.authorize()).rejects.toThrow(WebAuthError);

      try {
        await provider.authorize();
      } catch (e) {
        const err = e as WebAuthError;
        expect(err.type).toBe('UNKNOWN_ERROR');
        expect(err.message).toBe('An unknown SPA error occurred');
      }
    });
  });
});
