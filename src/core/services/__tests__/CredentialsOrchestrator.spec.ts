import {
  CredentialsOrchestrator,
  ICredentialsStorage,
} from '../CredentialsOrchestrator';
import { IAuthenticationProvider } from '../../interfaces';
import { Credentials, AuthError } from '../../models';

// 1. Create mocks for the orchestrator's dependencies.
const mockStorage: jest.Mocked<ICredentialsStorage> = {
  save: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
};

const mockAuthProvider: jest.Mocked<IAuthenticationProvider> = {
  refreshToken: jest.fn(),
  // Add stubs for other methods to satisfy the interface, even if not used in this test.
  passwordRealm: jest.fn(),
  userInfo: jest.fn(),
  revoke: jest.fn(),
  exchange: jest.fn(),
  passwordlessWithEmail: jest.fn(),
  passwordlessWithSMS: jest.fn(),
  loginWithEmail: jest.fn(),
  loginWithSMS: jest.fn(),
  loginWithOTP: jest.fn(),
  loginWithOOB: jest.fn(),
  loginWithRecoveryCode: jest.fn(),
  multifactorChallenge: jest.fn(),
  resetPassword: jest.fn(),
  createUser: jest.fn(),
  exchangeNativeSocial: jest.fn(),
};

// 2. Test data
const validIdToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHwxMjM0NSJ9.s-V2h_Yfxb19i5d6sB7B5p9a8j_hS_p-A-gNq8lT9iY';
const nowInSeconds = Math.floor(Date.now() / 1000);

const validCredentials = new Credentials({
  idToken: validIdToken,
  accessToken: 'valid-access-token',
  tokenType: 'Bearer',
  expiresAt: nowInSeconds + 3600, // Expires in 1 hour
  refreshToken: 'a-refresh-token',
  scope: 'openid profile',
});

const expiredCredentials = new Credentials({
  idToken: validIdToken,
  accessToken: 'expired-access-token',
  tokenType: 'Bearer',
  expiresAt: nowInSeconds - 1, // Expired 1 second ago
  refreshToken: 'a-refresh-token-for-expired',
  scope: 'openid profile',
});

const refreshedCredentials = new Credentials({
  idToken: validIdToken,
  accessToken: 'refreshed-access-token',
  tokenType: 'Bearer',
  expiresAt: nowInSeconds + 3600, // New expiry
  refreshToken: 'a-new-refresh-token',
  scope: 'openid profile',
});

describe('CredentialsOrchestrator', () => {
  let orchestrator: CredentialsOrchestrator;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    orchestrator = new CredentialsOrchestrator(mockStorage, mockAuthProvider);
  });

  describe('saveCredentials', () => {
    it('should stringify and save the credentials to storage', async () => {
      await orchestrator.saveCredentials(validCredentials);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(
        'auth0.credentials',
        JSON.stringify(validCredentials)
      );
    });
  });

  describe('getCredentials', () => {
    it('should return valid, non-expired credentials directly from storage', async () => {
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(validCredentials));

      const credentials = await orchestrator.getCredentials();

      expect(mockStorage.get).toHaveBeenCalledWith('auth0.credentials');
      // refreshToken should NOT be called
      expect(mockAuthProvider.refreshToken).not.toHaveBeenCalled();
      expect(credentials).toEqual(validCredentials);
    });

    it('should throw an error if no credentials are in storage', async () => {
      mockStorage.get.mockResolvedValueOnce(null);

      await expect(orchestrator.getCredentials()).rejects.toThrow(AuthError);
      await expect(orchestrator.getCredentials()).rejects.toMatchObject({
        code: 'no_credentials',
      });
    });

    it('should refresh the credentials if they are expired', async () => {
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(expiredCredentials));
      mockAuthProvider.refreshToken.mockResolvedValueOnce(refreshedCredentials);

      const credentials = await orchestrator.getCredentials();

      // Should have called refreshToken with the expired refresh token
      expect(mockAuthProvider.refreshToken).toHaveBeenCalledWith({
        refreshToken: expiredCredentials.refreshToken,
        scope: undefined,
      });

      // Should have saved the new, refreshed credentials
      expect(mockStorage.save).toHaveBeenCalledWith(
        'auth0.credentials',
        JSON.stringify(refreshedCredentials)
      );

      // Should return the new credentials
      expect(credentials).toEqual(refreshedCredentials);
    });

    it('should use minTtl to trigger a refresh for a soon-to-expire token', async () => {
      // Token expires in 50 seconds
      const soonToExpireCreds = new Credentials({
        ...validCredentials,
        expiresAt: nowInSeconds + 50,
      });
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(soonToExpireCreds));
      mockAuthProvider.refreshToken.mockResolvedValueOnce(refreshedCredentials);

      // A minTtl of 60 seconds makes the token invalid, triggering a refresh
      await orchestrator.getCredentials(undefined, 60);

      expect(mockAuthProvider.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should use forceRefresh to trigger a refresh even for a valid token', async () => {
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(validCredentials));
      mockAuthProvider.refreshToken.mockResolvedValueOnce(refreshedCredentials);

      await orchestrator.getCredentials(undefined, 0, undefined, true);

      expect(mockAuthProvider.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if credentials have expired and there is no refresh token', async () => {
      const expiredNoRefresh = new Credentials({
        ...expiredCredentials,
        refreshToken: undefined,
      });
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(expiredNoRefresh));

      await expect(orchestrator.getCredentials()).rejects.toMatchObject({
        code: 'no_refresh_token',
      });
    });

    it('should clear credentials if refresh fails', async () => {
      const refreshError = new AuthError(
        'invalid_grant',
        'The refresh token is invalid.'
      );
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(expiredCredentials));
      mockAuthProvider.refreshToken.mockRejectedValueOnce(refreshError);

      await expect(orchestrator.getCredentials()).rejects.toThrow(refreshError);

      // Crucially, it should also clear the bad credentials from storage
      expect(mockStorage.remove).toHaveBeenCalledWith('auth0.credentials');
    });
  });

  describe('hasValidCredentials', () => {
    it('should return true for valid, non-expired credentials', async () => {
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(validCredentials));
      await expect(orchestrator.hasValidCredentials()).resolves.toBe(true);
    });

    it('should return true for expired credentials that have a refresh token', async () => {
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(expiredCredentials));
      // It's considered "valid" because getCredentials() can renew it.
      await expect(orchestrator.hasValidCredentials()).resolves.toBe(true);
    });

    it('should return false for expired credentials without a refresh token', async () => {
      const expiredNoRefresh = new Credentials({
        ...expiredCredentials,
        refreshToken: undefined,
      });
      mockStorage.get.mockResolvedValueOnce(JSON.stringify(expiredNoRefresh));
      await expect(orchestrator.hasValidCredentials()).resolves.toBe(false);
    });

    it('should return false if no credentials are in storage', async () => {
      mockStorage.get.mockResolvedValueOnce(null);
      await expect(orchestrator.hasValidCredentials()).resolves.toBe(false);
    });
  });

  describe('clearCredentials', () => {
    it('should call remove on the storage provider', async () => {
      await orchestrator.clearCredentials();
      expect(mockStorage.remove).toHaveBeenCalledWith('auth0.credentials');
    });
  });
});
