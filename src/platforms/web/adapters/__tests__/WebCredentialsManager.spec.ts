import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebCredentialsManager } from '../WebCredentialsManager';

// Mock the Auth0Client
jest.mock('@auth0/auth0-spa-js');

// Mock the core models with factory functions
jest.mock('../../../../core/models', () => ({
  AuthError: jest.fn().mockImplementation(function (name, message, details) {
    const error = new Error(message);
    error.name = name;
    if (details) Object.assign(error, details);
    return error;
  }),
  CredentialsManagerError: jest
    .fn()
    .mockImplementation(function (originalError) {
      const error = new Error(originalError.message);
      error.name = originalError.name;
      (error as any).type = 'MOCKED_TYPE';
      return error;
    }),
  Credentials: jest.fn().mockImplementation(function (data) {
    return Object.assign(this, data);
  }),
}));

describe('WebCredentialsManager', () => {
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let credentialsManager: WebCredentialsManager;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSpaClient = {
      getTokenSilently: jest.fn().mockResolvedValue({}),
      getIdTokenClaims: jest.fn().mockResolvedValue({}),
      isAuthenticated: jest.fn().mockResolvedValue(false),
      logout: jest.fn().mockResolvedValue(undefined),
    } as any;

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    credentialsManager = new WebCredentialsManager(mockSpaClient);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('saveCredentials', () => {
    it('should log a warning and resolve without doing anything', async () => {
      const credentials = {
        idToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
        accessToken: 'access_token_123',
        tokenType: 'Bearer',
        expiresAt: 1234567890,
        scope: 'openid profile email',
      };

      await credentialsManager.saveCredentials(credentials);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '`saveCredentials` is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.'
      );
    });
  });

  describe('getCredentials', () => {
    const mockTokenResponse = {
      id_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
      access_token: 'access_token_123',
      scope: 'openid profile email',
    };

    const mockIdTokenClaims = {
      sub: 'auth0|123',
      exp: 1234567890,
      iat: 1234567800,
      aud: 'test-client-id',
      iss: 'https://test.auth0.com/',
      __raw: 'raw-token-string',
    };

    it('should get credentials successfully with default parameters', async () => {
      mockSpaClient.getTokenSilently.mockResolvedValue(mockTokenResponse);
      mockSpaClient.getIdTokenClaims.mockResolvedValue(mockIdTokenClaims);

      const result = await credentialsManager.getCredentials();

      expect(mockSpaClient.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
        authorizationParams: { scope: undefined },
        detailedResponse: true,
      });
      expect(mockSpaClient.getIdTokenClaims).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        idToken: mockTokenResponse.id_token,
        accessToken: mockTokenResponse.access_token,
        tokenType: 'Bearer',
        expiresAt: mockIdTokenClaims.exp,
        scope: mockTokenResponse.scope,
      });
    });

    it('should get credentials with custom scope and parameters', async () => {
      mockSpaClient.getTokenSilently.mockResolvedValue(mockTokenResponse);
      mockSpaClient.getIdTokenClaims.mockResolvedValue(mockIdTokenClaims);

      const scope = 'openid profile email read:data';
      const parameters = { audience: 'https://api.example.com' };

      await credentialsManager.getCredentials(scope, undefined, parameters);

      expect(mockSpaClient.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'on',
        authorizationParams: { ...parameters, scope },
        detailedResponse: true,
      });
    });

    it('should force refresh when forceRefresh is true', async () => {
      mockSpaClient.getTokenSilently.mockResolvedValue(mockTokenResponse);
      mockSpaClient.getIdTokenClaims.mockResolvedValue(mockIdTokenClaims);

      await credentialsManager.getCredentials(
        undefined,
        undefined,
        undefined,
        true
      );

      expect(mockSpaClient.getTokenSilently).toHaveBeenCalledWith({
        cacheMode: 'off',
        authorizationParams: { scope: undefined },
        detailedResponse: true,
      });
    });

    it('should throw error when ID token claims are missing', async () => {
      mockSpaClient.getTokenSilently.mockResolvedValue(mockTokenResponse);
      mockSpaClient.getIdTokenClaims.mockResolvedValue(null);

      await expect(credentialsManager.getCredentials()).rejects.toThrow(
        'ID token or expiration claim is missing.'
      );
    });

    it('should throw error when exp claim is missing', async () => {
      mockSpaClient.getTokenSilently.mockResolvedValue(mockTokenResponse);
      mockSpaClient.getIdTokenClaims.mockResolvedValue({
        sub: 'auth0|123',
        iat: 1234567800,
      } as any);

      await expect(credentialsManager.getCredentials()).rejects.toThrow(
        'ID token or expiration claim is missing.'
      );
    });

    it('should handle other errors with error and error_description', async () => {
      const genericError = {
        error: 'access_denied',
        error_description: 'Access denied',
      };
      mockSpaClient.getTokenSilently.mockRejectedValue(genericError);

      await expect(credentialsManager.getCredentials()).rejects.toThrow(
        'Access denied'
      );
    });

    it('should handle errors without error field', async () => {
      const genericError = {
        message: 'Something went wrong',
      };
      mockSpaClient.getTokenSilently.mockRejectedValue(genericError);

      await expect(credentialsManager.getCredentials()).rejects.toThrow(
        'Something went wrong'
      );
    });
  });

  describe('hasValidCredentials', () => {
    it('should return true when user is authenticated', async () => {
      mockSpaClient.isAuthenticated.mockResolvedValue(true);

      const result = await credentialsManager.hasValidCredentials();

      expect(result).toBe(true);
      expect(mockSpaClient.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should return false when user is not authenticated', async () => {
      mockSpaClient.isAuthenticated.mockResolvedValue(false);

      const result = await credentialsManager.hasValidCredentials();

      expect(result).toBe(false);
      expect(mockSpaClient.isAuthenticated).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCredentials', () => {
    it('should call logout with openUrl false', async () => {
      await credentialsManager.clearCredentials();

      expect(mockSpaClient.logout).toHaveBeenCalledWith({ openUrl: false });
    });

    it('should handle logout errors', async () => {
      const logoutError = new Error('Logout failed');
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(credentialsManager.clearCredentials()).rejects.toThrow(
        'Logout failed'
      );
    });
  });
});
