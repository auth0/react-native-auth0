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

describe('NativeCredentialsManager Error Handling', () => {
  let manager: NativeCredentialsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new NativeCredentialsManager(mockBridge);
  });

  it('should convert an Android "NO_CREDENTIALS" error from getCredentials into a CredentialsManagerError', async () => {
    const nativeError = {
      code: 'NO_CREDENTIALS',
      message: 'No credentials stored.',
    };
    mockBridge.getCredentials.mockRejectedValue(nativeError);

    await expect(manager.getCredentials()).rejects.toThrow(
      CredentialsManagerError
    );
    try {
      await manager.getCredentials();
    } catch (e) {
      const err = e as CredentialsManagerError;
      expect(err.type).toBe('NO_CREDENTIALS');
      expect(err.message).toBe('No credentials stored.');
    }
  });

  it('should convert an iOS "noRefreshToken" error from getCredentials into a CredentialsManagerError', async () => {
    const nativeError = {
      code: 'NO_REFRESH_TOKEN',
      message: 'No refresh token available.',
    };
    mockBridge.getCredentials.mockRejectedValue(nativeError);

    await expect(manager.getCredentials()).rejects.toThrow(
      CredentialsManagerError
    );
    try {
      await manager.getCredentials();
    } catch (e) {
      const err = e as CredentialsManagerError;
      // Note: The mapping for iOS's 'noRefreshToken' should resolve to 'NO_REFRESH_TOKEN'
      expect(err.type).toBe('NO_REFRESH_TOKEN');
    }
  });

  it('should convert an Android "BIOMETRIC_ERROR_LOCKOUT" error from getCredentials into a CredentialsManagerError with type "BIOMETRICS_FAILED"', async () => {
    const nativeError = {
      code: 'BIOMETRIC_ERROR_LOCKOUT',
      message: 'Biometrics are locked.',
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
    }
  });
});
