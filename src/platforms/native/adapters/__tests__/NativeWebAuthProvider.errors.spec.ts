import { NativeWebAuthProvider } from '../NativeWebAuthProvider';
import { INativeBridge } from '../../bridge';
import { WebAuthError } from '../../../../core/models';

// Mock the native bridge
const mockBridge: jest.Mocked<INativeBridge> = {
  authorize: jest.fn(),
  clearSession: jest.fn(),
  getBundleIdentifier: jest.fn().mockResolvedValue('com.app.test'),
  // Stub other methods to satisfy the interface
  hasValidInstance: jest.fn(),
  initialize: jest.fn(),
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  cancelWebAuth: jest.fn(),
  resumeWebAuth: jest.fn(),
};

describe('NativeWebAuthProvider Error Handling', () => {
  let provider: NativeWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NativeWebAuthProvider(mockBridge, 'test.auth0.com');
  });

  describe('Common Error Types', () => {
    const commonErrorTestCases = [
      {
        code: 'a0.session.user_cancelled',
        message: 'User cancelled.',
        expectedType: 'USER_CANCELLED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'USER_CANCELLED',
        message: 'User cancelled.',
        expectedType: 'USER_CANCELLED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'access_denied',
        message: 'Access denied.',
        expectedType: 'ACCESS_DENIED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'a0.network_error',
        message: 'Network error occurred.',
        expectedType: 'NETWORK_ERROR',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'a0.session.invalid_idtoken',
        message: 'Invalid ID token.',
        expectedType: 'ID_TOKEN_VALIDATION_FAILED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'ID_TOKEN_VALIDATION_FAILED',
        message: 'ID token validation failed.',
        expectedType: 'ID_TOKEN_VALIDATION_FAILED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'BIOMETRICS_CONFIGURATION_ERROR',
        message: 'Biometrics configuration error.',
        expectedType: 'BIOMETRICS_CONFIGURATION_ERROR',
        method: 'authorize',
        mockMethod: 'authorize',
      },
    ];

    commonErrorTestCases.forEach(
      ({ code, message, expectedType, method, mockMethod }) => {
        it(`should handle ${code} error`, async () => {
          const nativeError = { code, message };
          (
            mockBridge[mockMethod as keyof typeof mockBridge] as jest.Mock
          ).mockRejectedValue(nativeError);

          await expect((provider as any)[method]()).rejects.toThrow(
            WebAuthError
          );

          try {
            await (provider as any)[method]();
          } catch (e) {
            const err = e as WebAuthError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(message);
          }
        });
      }
    );
  });

  describe('Android-Specific Error Mappings', () => {
    const androidErrorTestCases = [
      {
        code: 'a0.browser_not_available',
        message: 'No browser.',
        expectedType: 'BROWSER_NOT_AVAILABLE',
        method: 'clearSession',
        mockMethod: 'clearSession',
      },
      {
        code: 'a0.session.failed_load',
        message: 'Failed to load URL.',
        expectedType: 'FAILED_TO_LOAD_URL',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'a0.session.browser_terminated',
        message: 'Browser terminated.',
        expectedType: 'BROWSER_TERMINATED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
    ];

    androidErrorTestCases.forEach(
      ({ code, message, expectedType, method, mockMethod }) => {
        it(`should map ${code} to ${expectedType}`, async () => {
          const nativeError = { code, message };
          (
            mockBridge[mockMethod as keyof typeof mockBridge] as jest.Mock
          ).mockRejectedValue(nativeError);

          await expect((provider as any)[method]()).rejects.toThrow(
            WebAuthError
          );

          try {
            await (provider as any)[method]();
          } catch (e) {
            const err = e as WebAuthError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(message);
          }
        });
      }
    );
  });

  describe('iOS-Specific Error Mappings', () => {
    const iOSErrorTestCases = [
      {
        code: 'NO_BUNDLE_IDENTIFIER',
        message: 'No bundle identifier.',
        expectedType: 'NO_BUNDLE_IDENTIFIER',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'TRANSACTION_ACTIVE_ALREADY',
        message: 'Transaction already active.',
        expectedType: 'TRANSACTION_ACTIVE_ALREADY',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'NO_AUTHORIZATION_CODE',
        message: 'No authorization code.',
        expectedType: 'NO_AUTHORIZATION_CODE',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'PKCE_NOT_ALLOWED',
        message: 'PKCE not allowed.',
        expectedType: 'PKCE_NOT_ALLOWED',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'INVALID_INVITATION_URL',
        message: 'Invalid invitation URL.',
        expectedType: 'INVALID_INVITATION_URL',
        method: 'authorize',
        mockMethod: 'authorize',
      },
    ];

    iOSErrorTestCases.forEach(
      ({ code, message, expectedType, method, mockMethod }) => {
        it(`should map ${code} to ${expectedType}`, async () => {
          const nativeError = { code, message };
          (
            mockBridge[mockMethod as keyof typeof mockBridge] as jest.Mock
          ).mockRejectedValue(nativeError);

          await expect((provider as any)[method]()).rejects.toThrow(
            WebAuthError
          );

          try {
            await (provider as any)[method]();
          } catch (e) {
            const err = e as WebAuthError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(message);
          }
        });
      }
    );
  });

  describe('Generic Fallback Errors', () => {
    const fallbackErrorTestCases = [
      {
        code: 'a0.invalid_configuration',
        message: 'Invalid configuration.',
        expectedType: 'INVALID_CONFIGURATION',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'UNKNOWN',
        message: 'Unknown error.',
        expectedType: 'UNKNOWN_ERROR',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'OTHER',
        message: 'Other error.',
        expectedType: 'UNKNOWN_ERROR',
        method: 'authorize',
        mockMethod: 'authorize',
      },
      {
        code: 'SOME_UNMAPPED_ERROR',
        message: 'Some unmapped error.',
        expectedType: 'UNKNOWN_ERROR',
        method: 'authorize',
        mockMethod: 'authorize',
      },
    ];

    fallbackErrorTestCases.forEach(
      ({ code, message, expectedType, method, mockMethod }) => {
        it(`should map ${code} to ${expectedType}`, async () => {
          const nativeError = { code, message };
          (
            mockBridge[mockMethod as keyof typeof mockBridge] as jest.Mock
          ).mockRejectedValue(nativeError);

          await expect((provider as any)[method]()).rejects.toThrow(
            WebAuthError
          );

          try {
            await (provider as any)[method]();
          } catch (e) {
            const err = e as WebAuthError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(message);
          }
        });
      }
    );
  });

  describe('Special State Validation', () => {
    it('should handle state_mismatch error with special validation', async () => {
      const nativeError = {
        code: 'state_mismatch',
        message: 'state is invalid',
      };
      mockBridge.authorize.mockRejectedValue(nativeError);

      await expect(provider.authorize()).rejects.toThrow(WebAuthError);

      try {
        await provider.authorize();
      } catch (e) {
        const err = e as WebAuthError;
        expect(err.type).toBe('INVALID_STATE');
        expect(err.message).toBe('state is invalid');
      }
    });

    it('should handle error with "state is invalid" in message', async () => {
      const nativeError = {
        code: 'some_other_code',
        message: 'The state is invalid and cannot be processed',
      };
      mockBridge.authorize.mockRejectedValue(nativeError);

      await expect(provider.authorize()).rejects.toThrow(WebAuthError);

      try {
        await provider.authorize();
      } catch (e) {
        const err = e as WebAuthError;
        expect(err.type).toBe('INVALID_STATE');
        expect(err.message).toBe(
          'The state is invalid and cannot be processed'
        );
      }
    });
  });
});
