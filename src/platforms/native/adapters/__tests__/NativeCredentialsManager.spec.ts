import { NativeCredentialsManager } from '../NativeCredentialsManager';
import { INativeBridge } from '../../bridge';

// 1. Create a mock of the INativeBridge dependency.
const mockBridge: jest.Mocked<INativeBridge> = {
  // We only need to mock the methods that this specific adapter uses.
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  clearDPoPKey: jest.fn(),
  getSSOCredentials: jest.fn(),
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
    it('should call the bridge to clear credentials', async () => {
      mockBridge.clearCredentials.mockResolvedValueOnce();
      await manager.clearCredentials();
      expect(mockBridge.clearCredentials).toHaveBeenCalledTimes(1);
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
});
