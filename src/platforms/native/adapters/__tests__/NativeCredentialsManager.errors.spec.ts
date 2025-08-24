import { NativeCredentialsManager } from '../NativeCredentialsManager';
import { INativeBridge } from '../../bridge';
import { CredentialsManagerError } from '../../../../core/models';

// Mock the native bridge
const mockBridge: jest.Mocked<INativeBridge> = {
  getCredentials: jest.fn(),
  saveCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  // Stub other methods
  hasValidInstance: jest.fn(),
  initialize: jest.fn(),
  getBundleIdentifier: jest.fn(),
  authorize: jest.fn(),
  clearSession: jest.fn(),
  hasValidCredentials: jest.fn(),
  cancelWebAuth: jest.fn(),
  resumeWebAuth: jest.fn(),
};

describe('Common Error Handling - NativeCredentialsManager', () => {
  let manager: NativeCredentialsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new NativeCredentialsManager(mockBridge);
  });
  describe('Core Error Types', () => {
    const coreErrorTestCases = [
      {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials provided.',
        expectedType: 'INVALID_CREDENTIALS',
        method: 'getCredentials',
      },
      {
        code: 'NO_CREDENTIALS',
        message: 'No credentials stored.',
        expectedType: 'NO_CREDENTIALS',
        method: 'getCredentials',
      },
      {
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token available.',
        expectedType: 'NO_REFRESH_TOKEN',
        method: 'getCredentials',
      },
      {
        code: 'RENEW_FAILED',
        message: 'Refresh token renewal failed.',
        expectedType: 'RENEW_FAILED',
        method: 'getCredentials',
      },
      {
        code: 'STORE_FAILED',
        message: 'Failed to store credentials.',
        expectedType: 'STORE_FAILED',
        method: 'saveCredentials',
        args: [{}],
      },
      {
        code: 'REVOKE_FAILED',
        message: 'Failed to revoke credentials.',
        expectedType: 'REVOKE_FAILED',
        method: 'clearCredentials',
      },
      {
        code: 'LARGE_MIN_TTL',
        message:
          'The minTTL requested is greater than the lifetime of the renewed access token. Request a lower minTTL or increase the "Token Expiration" value in the settings page of your Auth0 API.',
        expectedType: 'LARGE_MIN_TTL',
        method: 'getCredentials',
      },
      {
        code: 'CREDENTIAL_MANAGER_ERROR',
        message: 'General credentials manager error occurred.',
        expectedType: 'CREDENTIAL_MANAGER_ERROR',
        method: 'getCredentials',
      },
      {
        code: 'BIOMETRICS_FAILED',
        message: 'Biometric authentication failed.',
        expectedType: 'BIOMETRICS_FAILED',
        method: 'getCredentials',
      },
      {
        code: 'NO_NETWORK',
        message: 'No network connection available.',
        expectedType: 'NO_NETWORK',
        method: 'getCredentials',
      },
      {
        code: 'API_ERROR',
        message: 'API request failed.',
        expectedType: 'API_ERROR',
        method: 'getCredentials',
      },
    ];

    coreErrorTestCases.forEach(
      ({ code, message, expectedType, method, args = [] }) => {
        it(`should handle ${code} error`, async () => {
          const nativeError = { code, message };
          (
            mockBridge[method as keyof typeof mockBridge] as jest.Mock
          ).mockRejectedValue(nativeError);

          await expect((manager as any)[method](...args)).rejects.toThrow(
            CredentialsManagerError
          );

          try {
            await (manager as any)[method](...args);
          } catch (e) {
            const err = e as CredentialsManagerError;
            expect(err.type).toBe(expectedType);
            expect(err.message).toBe(message);
          }
        });
      }
    );
  });

  describe('Special Error Cases', () => {
    const specialErrorTestCases = [
      {
        code: 'INCOMPATIBLE_DEVICE',
        message: 'Device is incompatible.',
        expectedType: 'INCOMPATIBLE_DEVICE',
      },
      {
        code: 'CRYPTO_EXCEPTION',
        message: 'Cryptographic exception occurred.',
        expectedType: 'CRYPTO_EXCEPTION',
      },
      {
        code: 'UNKNOWN_PLATFORM_ERROR',
        message: 'An unknown platform error occurred.',
        expectedType: 'UNKNOWN_ERROR',
      },
    ];

    specialErrorTestCases.forEach(({ code, message, expectedType }) => {
      it(`should handle ${code} error${
        expectedType === 'UNKNOWN_ERROR' ? ' with UNKNOWN_ERROR type' : ''
      }`, async () => {
        const nativeError = { code, message };
        mockBridge.getCredentials.mockRejectedValue(nativeError);

        await expect(manager.getCredentials()).rejects.toThrow(
          CredentialsManagerError
        );

        try {
          await manager.getCredentials();
        } catch (e) {
          const err = e as CredentialsManagerError;
          expect(err.type).toBe(expectedType);
          expect(err.message).toBe(message);
        }
      });
    });
  });

  describe('Android Biometric Error Mappings', () => {
    const biometricErrorTestCases = [
      'BIOMETRIC_NO_ACTIVITY',
      'BIOMETRIC_ERROR_STATUS_UNKNOWN',
      'BIOMETRIC_ERROR_UNSUPPORTED',
      'BIOMETRIC_ERROR_HW_UNAVAILABLE',
      'BIOMETRIC_ERROR_NONE_ENROLLED',
      'BIOMETRIC_ERROR_NO_HARDWARE',
      'BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED',
      'BIOMETRIC_AUTHENTICATION_CHECK_FAILED',
      'BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE',
      'BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE',
      'BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL',
      'BIOMETRIC_ERROR_NEGATIVE_BUTTON',
      'BIOMETRIC_ERROR_HW_NOT_PRESENT',
      'BIOMETRIC_ERROR_NO_BIOMETRICS',
      'BIOMETRIC_ERROR_USER_CANCELED',
      'BIOMETRIC_ERROR_LOCKOUT_PERMANENT',
      'BIOMETRIC_ERROR_VENDOR',
      'BIOMETRIC_ERROR_LOCKOUT',
      'BIOMETRIC_ERROR_CANCELED',
      'BIOMETRIC_ERROR_NO_SPACE',
      'BIOMETRIC_ERROR_TIMEOUT',
      'BIOMETRIC_ERROR_UNABLE_TO_PROCESS',
      'BIOMETRICS_INVALID_USER',
      'BIOMETRIC_AUTHENTICATION_FAILED',
    ];

    biometricErrorTestCases.forEach((errorCode) => {
      it(`should map ${errorCode} to BIOMETRICS_FAILED`, async () => {
        const nativeError = {
          code: errorCode,
          message: `Biometric error: ${errorCode}`,
        };
        mockBridge.getCredentials.mockRejectedValue(nativeError);

        await expect(manager.getCredentials()).rejects.toThrow(
          CredentialsManagerError
        );

        try {
          await manager.getCredentials();
        } catch (e) {
          const err = e as CredentialsManagerError;
          expect(err.type).toBe('BIOMETRICS_FAILED');
          expect(err.message).toBe(`Biometric error: ${errorCode}`);
        }
      });
    });
  });
});
