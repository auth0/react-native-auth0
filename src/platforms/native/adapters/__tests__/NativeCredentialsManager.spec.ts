import { NativeCredentialsManager } from '../NativeCredentialsManager';
import { INativeBridge } from '../../bridge';
import { AuthError, CredentialsManagerError } from '../../../../core/models';

// 1. Create a mock of the INativeBridge dependency.
const mockBridge: jest.Mocked<INativeBridge> = {
  // We only need to mock the methods that this specific adapter uses.
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  clearDPoPKey: jest.fn(),
  getSSOCredentials: jest.fn(),
  getApiCredentials: jest.fn(),
  clearApiCredentials: jest.fn(),
  // Add stubs for other INativeBridge methods to satisfy the type.
  initialize: jest.fn(),
  hasValidInstance: jest.fn(),
  getBundleIdentifier: jest.fn(),
  authorize: jest.fn(),
  clearSession: jest.fn(),
  cancelWebAuth: jest.fn(),
  resumeWebAuth: jest.fn(),
  getDPoPHeaders: jest.fn(),
};

describe('NativeCredentialsManager', () => {
  let manager: NativeCredentialsManager;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Create a new manager instance for each test, injecting the mock bridge.
    manager = new NativeCredentialsManager(mockBridge);
  });

  describe('saveCredentials', () => {
    const validCredentials = {
      idToken: 'id_token_123',
      accessToken: 'access_token_456',
      tokenType: 'Bearer',
      expiresAt: Date.now() / 1000 + 3600,
      scope: 'openid profile',
      refreshToken: 'refresh_token_789',
    };

    it('should call the bridge to save credentials', async () => {
      mockBridge.saveCredentials.mockResolvedValueOnce(); // Mock a successful save

      await manager.saveCredentials(validCredentials);

      expect(mockBridge.saveCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.saveCredentials).toHaveBeenCalledWith(validCredentials);
    });

    it('should propagate errors from the bridge', async () => {
      const saveError = new Error('Failed to save to Keychain.');
      mockBridge.saveCredentials.mockRejectedValueOnce(saveError);

      await expect(manager.saveCredentials(validCredentials)).rejects.toThrow(
        saveError
      );
    });
  });

  describe('getCredentials', () => {
    it('should call the bridge to get credentials with all parameters', async () => {
      const scope = 'openid profile read:data';
      const minTtl = 300;
      const forceRefresh = true;

      await manager.getCredentials(scope, minTtl, undefined, forceRefresh);

      expect(mockBridge.getCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.getCredentials).toHaveBeenCalledWith(
        scope,
        minTtl,
        undefined,
        forceRefresh
      );
    });

    it('should call the bridge with default parameters if none are provided', async () => {
      await manager.getCredentials();

      // Note: The orchestrator provides defaults, but we test the adapter's pass-through behavior.
      // Our adapter doesn't set defaults, it just passes what it receives.
      expect(mockBridge.getCredentials).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should return the credentials from the bridge on success', async () => {
      const expectedCredentials = {
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 123,
      };
      mockBridge.getCredentials.mockResolvedValueOnce(expectedCredentials);

      const result = await manager.getCredentials();

      expect(result).toEqual(expectedCredentials);
    });
  });

  describe('hasValidCredentials', () => {
    it('should call the bridge to check for credentials', async () => {
      const minTtl = 60;
      mockBridge.hasValidCredentials.mockResolvedValueOnce(true);

      const result = await manager.hasValidCredentials(minTtl);

      expect(mockBridge.hasValidCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.hasValidCredentials).toHaveBeenCalledWith(minTtl);
      expect(result).toBe(true);
    });

    it('should call the bridge with a default minTtl of undefined', async () => {
      mockBridge.hasValidCredentials.mockResolvedValueOnce(false);
      const result = await manager.hasValidCredentials();
      expect(mockBridge.hasValidCredentials).toHaveBeenCalledWith(undefined);
      expect(result).toBe(false);
    });
  });

  describe('clearCredentials', () => {
    it('should call the bridge to clear all credentials when no parameters provided', async () => {
      mockBridge.clearCredentials.mockResolvedValueOnce();
      await manager.clearCredentials();
      expect(mockBridge.clearCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.clearCredentials).toHaveBeenCalledWith(
        undefined,
        undefined
      );
    });

    it('should call the bridge to clear credentials for specific audience', async () => {
      mockBridge.clearCredentials.mockResolvedValueOnce();
      await manager.clearCredentials('https://api.example.com');
      expect(mockBridge.clearCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.clearCredentials).toHaveBeenCalledWith(
        'https://api.example.com',
        undefined
      );
    });

    it('should call the bridge to clear credentials for specific audience and scope', async () => {
      mockBridge.clearCredentials.mockResolvedValueOnce();
      await manager.clearCredentials('https://api.example.com', 'read:data');
      expect(mockBridge.clearCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.clearCredentials).toHaveBeenCalledWith(
        'https://api.example.com',
        'read:data'
      );
    });

    it('should propagate errors from the bridge', async () => {
      const clearError = new AuthError('CLEAR_FAILED', 'Failed to clear', {
        code: 'CLEAR_FAILED',
      });
      mockBridge.clearCredentials.mockRejectedValueOnce(clearError);
      await expect(manager.clearCredentials()).rejects.toThrow(
        CredentialsManagerError
      );
    });
  });

  describe('getSSOCredentials', () => {
    const validSSOCredentials = {
      sessionTransferToken: 'stt_xyz123',
      tokenType: 'Bearer',
      expiresIn: 3600,
      idToken: 'id_token_123',
      refreshToken: 'refresh_token_789',
    };

    it('should call the bridge to get SSO credentials without parameters', async () => {
      mockBridge.getSSOCredentials.mockResolvedValueOnce(validSSOCredentials);

      const result = await manager.getSSOCredentials();

      expect(mockBridge.getSSOCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.getSSOCredentials).toHaveBeenCalledWith(
        undefined,
        undefined
      );
      expect(result).toEqual(validSSOCredentials);
    });

    it('should call the bridge to get SSO credentials with parameters', async () => {
      const parameters = { audience: 'https://api.example.com' };
      mockBridge.getSSOCredentials.mockResolvedValueOnce(validSSOCredentials);

      const result = await manager.getSSOCredentials(parameters);

      expect(mockBridge.getSSOCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.getSSOCredentials).toHaveBeenCalledWith(
        parameters,
        undefined
      );
      expect(result).toEqual(validSSOCredentials);
    });

    it('should call the bridge to get SSO credentials with headers', async () => {
      const headers = { 'X-Custom-Header': 'value' };
      mockBridge.getSSOCredentials.mockResolvedValueOnce(validSSOCredentials);

      const result = await manager.getSSOCredentials(undefined, headers);

      expect(mockBridge.getSSOCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.getSSOCredentials).toHaveBeenCalledWith(
        undefined,
        headers
      );
      expect(result).toEqual(validSSOCredentials);
    });

    it('should call the bridge to get SSO credentials with both parameters and headers', async () => {
      const parameters = {
        audience: 'https://api.example.com',
        scope: 'openid profile',
      };
      const headers = { 'X-Custom-Header': 'value' };
      mockBridge.getSSOCredentials.mockResolvedValueOnce(validSSOCredentials);

      const result = await manager.getSSOCredentials(parameters, headers);

      expect(mockBridge.getSSOCredentials).toHaveBeenCalledTimes(1);
      expect(mockBridge.getSSOCredentials).toHaveBeenCalledWith(
        parameters,
        headers
      );
      expect(result).toEqual(validSSOCredentials);
    });

    it('should return SSO credentials without optional tokens', async () => {
      const minimalSSOCredentials = {
        sessionTransferToken: 'stt_xyz123',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
      mockBridge.getSSOCredentials.mockResolvedValueOnce(minimalSSOCredentials);

      const result = await manager.getSSOCredentials();

      expect(result).toEqual(minimalSSOCredentials);
      expect(result.idToken).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });

    it('should propagate errors from the bridge', async () => {
      const ssoError = new Error(
        'Failed to get SSO credentials from native SDK.'
      );
      mockBridge.getSSOCredentials.mockRejectedValueOnce(ssoError);

      await expect(manager.getSSOCredentials()).rejects.toThrow(ssoError);
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('No valid credentials stored');
      mockBridge.getSSOCredentials.mockRejectedValueOnce(authError);

      await expect(manager.getSSOCredentials()).rejects.toThrow(authError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      mockBridge.getSSOCredentials.mockRejectedValueOnce(networkError);

      await expect(
        manager.getSSOCredentials({ audience: 'https://api.example.com' })
      ).rejects.toThrow(networkError);
    });
  });
  describe('getApiCredentials', () => {
    it('should throw CredentialsManagerError on NO_CREDENTIALS error', async () => {
      const authError = new AuthError('NO_CREDENTIALS', 'No credentials', {
        code: 'NO_CREDENTIALS',
      });
      mockBridge.getApiCredentials.mockRejectedValue(authError);

      await expect(
        manager.getApiCredentials('https://api.example.com')
      ).rejects.toThrow(CredentialsManagerError);

      await expect(
        manager.getApiCredentials('https://api.example.com')
      ).rejects.toMatchObject({
        type: 'NO_CREDENTIALS',
        message: 'No credentials',
      });
    });

    it('should throw CredentialsManagerError on NO_REFRESH_TOKEN error', async () => {
      const authError = new AuthError('NO_REFRESH_TOKEN', 'No refresh token', {
        code: 'NO_REFRESH_TOKEN',
      });
      mockBridge.getApiCredentials.mockRejectedValue(authError);

      await expect(
        manager.getApiCredentials('https://api.example.com', 'read:data')
      ).rejects.toThrow(CredentialsManagerError);

      await expect(
        manager.getApiCredentials('https://api.example.com', 'read:data')
      ).rejects.toMatchObject({
        type: 'NO_REFRESH_TOKEN',
        message: 'No refresh token',
      });
    });

    it('should throw CredentialsManagerError on API_EXCHANGE_FAILED error', async () => {
      const authError = new AuthError(
        'invalid_grant',
        'Refresh token is invalid',
        {
          code: 'invalid_grant',
          status: 403,
        }
      );
      mockBridge.getApiCredentials.mockRejectedValue(authError);

      await expect(
        manager.getApiCredentials('https://api.example.com')
      ).rejects.toThrow(CredentialsManagerError);

      const error = await manager
        .getApiCredentials('https://api.example.com')
        .catch((e) => e);

      expect(error).toBeInstanceOf(CredentialsManagerError);
      expect(error.type).toBe('RENEW_FAILED');
      expect(error.message).toBe('Refresh token is invalid');
      expect(error.status).toBe(403);
    });

    it('should throw CredentialsManagerError with proper error code mapping', async () => {
      const authError = new AuthError('RENEW_FAILED', 'Renewal failed', {
        code: 'RENEW_FAILED',
      });
      mockBridge.getApiCredentials.mockRejectedValue(authError);

      const error = await manager
        .getApiCredentials('https://api.example.com')
        .catch((e) => e);

      expect(error).toBeInstanceOf(CredentialsManagerError);
      expect(error.type).toBe('RENEW_FAILED');
    });

    it('should return API credentials on success', async () => {
      const mockCredentials = {
        accessToken: 'access_token_123',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
        scope: 'read:data',
      };
      mockBridge.getApiCredentials.mockResolvedValue(mockCredentials);

      const result = await manager.getApiCredentials(
        'https://api.example.com',
        'read:data'
      );

      expect(result.accessToken).toBe('access_token_123');
      expect(result.tokenType).toBe('Bearer');
      expect(mockBridge.getApiCredentials).toHaveBeenCalledWith(
        'https://api.example.com',
        'read:data',
        0,
        undefined
      );
    });
  });

  describe('clearApiCredentials', () => {
    it('should throw CredentialsManagerError on error', async () => {
      const authError = new AuthError('CLEAR_FAILED', 'Clear failed', {
        code: 'CLEAR_FAILED',
      });
      mockBridge.clearApiCredentials.mockRejectedValue(authError);

      await expect(
        manager.clearApiCredentials('https://api.example.com')
      ).rejects.toThrow(CredentialsManagerError);
    });

    it('should clear credentials for audience without scope', async () => {
      mockBridge.clearApiCredentials.mockResolvedValue(undefined);

      await expect(
        manager.clearApiCredentials('https://api.example.com')
      ).resolves.toBeUndefined();

      expect(mockBridge.clearApiCredentials).toHaveBeenCalledWith(
        'https://api.example.com',
        undefined
      );
    });

    it('should clear credentials for audience with scope', async () => {
      mockBridge.clearApiCredentials.mockResolvedValue(undefined);

      await expect(
        manager.clearApiCredentials(
          'https://api.example.com',
          'read:data write:data'
        )
      ).resolves.toBeUndefined();

      expect(mockBridge.clearApiCredentials).toHaveBeenCalledWith(
        'https://api.example.com',
        'read:data write:data'
      );
    });

    it('should handle multiple different audiences', async () => {
      mockBridge.clearApiCredentials.mockResolvedValue(undefined);

      await manager.clearApiCredentials('https://api1.example.com');
      await manager.clearApiCredentials(
        'https://api2.example.com',
        'admin:write'
      );

      expect(mockBridge.clearApiCredentials).toHaveBeenCalledTimes(2);
      expect(mockBridge.clearApiCredentials).toHaveBeenNthCalledWith(
        1,
        'https://api1.example.com',
        undefined
      );
      expect(mockBridge.clearApiCredentials).toHaveBeenNthCalledWith(
        2,
        'https://api2.example.com',
        'admin:write'
      );
    });
  });
});
