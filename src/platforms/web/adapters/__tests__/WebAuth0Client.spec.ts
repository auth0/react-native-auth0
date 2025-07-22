import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebAuth0Client } from '../WebAuth0Client';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { WebCredentialsManager } from '../WebCredentialsManager';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../../core/services';
import { HttpClient } from '../../../../core/services/HttpClient';

// Mock all dependencies
jest.mock('@auth0/auth0-spa-js');
jest.mock('../WebWebAuthProvider');
jest.mock('../WebCredentialsManager');
jest.mock('../../../../core/services/AuthenticationOrchestrator');
jest.mock('../../../../core/services/ManagementApiOrchestrator');
jest.mock('../../../../core/services/HttpClient');

// Mock AuthError properly to support inheritance
jest.mock('../../../../core/models', () => ({
  AuthError: class MockAuthError extends Error {
    constructor(name: string, message: string, details?: any) {
      super(message);
      this.name = name;
      if (details) {
        Object.assign(this, details);
      }
    }
  },
  // Add other exports from models if needed
  Credentials: jest.fn(),
  Auth0User: jest.fn(),
}));

const MockAuth0Client = Auth0Client as jest.MockedClass<typeof Auth0Client>;
const MockWebWebAuthProvider = WebWebAuthProvider as jest.MockedClass<
  typeof WebWebAuthProvider
>;
const MockWebCredentialsManager = WebCredentialsManager as jest.MockedClass<
  typeof WebCredentialsManager
>;
const MockAuthenticationOrchestrator =
  AuthenticationOrchestrator as jest.MockedClass<
    typeof AuthenticationOrchestrator
  >;
const MockManagementApiOrchestrator =
  ManagementApiOrchestrator as jest.MockedClass<
    typeof ManagementApiOrchestrator
  >;
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

describe('WebAuth0Client', () => {
  let client: WebAuth0Client;
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const defaultOptions = {
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
  };

  beforeEach(() => {
    // Clear all mocks first
    jest.clearAllMocks();

    // Reset the singleton to ensure fresh instances
    WebAuth0Client.resetSpaClientSingleton();

    // Setup window.location mock
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com',
      },
      writable: true,
      configurable: true,
    });

    // Create fresh mock instances for each test
    mockSpaClient = {
      logout: jest.fn().mockResolvedValue(undefined),
      loginWithRedirect: jest.fn(),
      handleRedirectCallback: jest.fn(),
      getTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      isAuthenticated: jest.fn(),
    } as any;

    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    } as any;

    // Setup mock implementations
    MockAuth0Client.mockImplementation(() => mockSpaClient);
    MockHttpClient.mockImplementation(() => mockHttpClient);
    MockAuthenticationOrchestrator.mockImplementation(() => ({}) as any);
    MockManagementApiOrchestrator.mockImplementation(() => ({}) as any);
    MockWebWebAuthProvider.mockImplementation(() => ({}) as any);
    MockWebCredentialsManager.mockImplementation(() => ({}) as any);

    client = new WebAuth0Client(defaultOptions);
  });

  afterEach(() => {
    // Clear all mocks and reset singleton
    jest.clearAllMocks();
    WebAuth0Client.resetSpaClientSingleton();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(MockHttpClient).toHaveBeenCalledWith({
        baseUrl: `https://${defaultOptions.domain}`,
        timeout: undefined,
        headers: undefined,
      });

      expect(MockAuthenticationOrchestrator).toHaveBeenCalledWith({
        clientId: defaultOptions.clientId,
        httpClient: mockHttpClient,
      });

      expect(MockWebWebAuthProvider).toHaveBeenCalledWith(mockSpaClient);
      expect(MockWebCredentialsManager).toHaveBeenCalledWith(mockSpaClient);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        domain: 'custom.auth0.com',
        clientId: 'custom-client-id',
        timeout: 10000,
        headers: { 'Custom-Header': 'value' },
        cacheLocation: 'localstorage' as const,
        useRefreshTokens: false,
        audience: 'https://api.example.com',
        scope: 'openid profile email',
      };

      // Clear previous mocks and create new client
      jest.clearAllMocks();
      MockHttpClient.mockImplementation(() => mockHttpClient);
      MockAuth0Client.mockImplementation(() => mockSpaClient);

      const customClient = new WebAuth0Client(customOptions);

      expect(MockHttpClient).toHaveBeenCalledWith({
        baseUrl: `https://${customOptions.domain}`,
        timeout: customOptions.timeout,
        headers: customOptions.headers,
      });

      // Verify the client was created
      expect(customClient).toBeDefined();
    });
  });

  describe('properties', () => {
    it('should provide access to WebWebAuthProvider instance', () => {
      expect(client.webAuth).toBeDefined();
    });

    it('should provide access to WebCredentialsManager instance', () => {
      expect(client.credentialsManager).toBeDefined();
    });

    it('should provide access to AuthenticationOrchestrator instance', () => {
      expect(client.auth).toBeDefined();
    });

    it('should provide access to the underlying Auth0Client instance', () => {
      expect(client.client).toBeDefined();
      expect(client.client).toBe(mockSpaClient);
    });
  });

  describe('users method', () => {
    it('should create and return ManagementApiOrchestrator instance', () => {
      const token = 'access_token_123';
      const usersClient = client.users(token);

      expect(MockManagementApiOrchestrator).toHaveBeenCalledWith({
        token,
        httpClient: mockHttpClient,
      });
      expect(usersClient).toBeDefined();
    });

    it('should create new instance for each call', () => {
      MockManagementApiOrchestrator.mockClear();

      const token1 = 'token1';
      const token2 = 'token2';

      client.users(token1);
      client.users(token2);

      expect(MockManagementApiOrchestrator).toHaveBeenCalledTimes(2);
      expect(MockManagementApiOrchestrator).toHaveBeenNthCalledWith(1, {
        token: token1,
        httpClient: mockHttpClient,
      });
      expect(MockManagementApiOrchestrator).toHaveBeenNthCalledWith(2, {
        token: token2,
        httpClient: mockHttpClient,
      });
    });
  });

  describe('logout method', () => {
    beforeEach(() => {
      // Reset logout mock before each test
      mockSpaClient.logout.mockClear();
      mockSpaClient.logout.mockResolvedValue(undefined);
    });

    it('should call the underlying SPA client logout method', async () => {
      const logoutOptions = {
        logoutParams: {
          returnTo: 'https://app.com/logged-out',
        },
      };

      await client.logout(logoutOptions);

      expect(mockSpaClient.logout).toHaveBeenCalledWith(logoutOptions);
    });

    it('should call logout without options', async () => {
      await client.logout();

      expect(mockSpaClient.logout).toHaveBeenCalledWith(undefined);
    });

    it('should prevent concurrent logout calls', async () => {
      let resolveLogout: () => void;
      const logoutPromise = new Promise<void>((resolve) => {
        resolveLogout = resolve;
      });
      mockSpaClient.logout.mockReturnValue(logoutPromise);

      const firstLogout = client.logout();
      const secondLogout = client.logout();

      await secondLogout;
      expect(mockSpaClient.logout).toHaveBeenCalledTimes(1);

      resolveLogout!();
      await firstLogout;
    });

    it('should throw AuthError when SPA client logout fails', async () => {
      const logoutError = {
        error: 'logout_failed',
        error_description: 'Could not log out',
      };
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(client.logout()).rejects.toThrow('Could not log out');
    });

    it('should reset logout flag on error to allow retry', async () => {
      const logoutError = new Error('Logout failed');
      mockSpaClient.logout.mockRejectedValueOnce(logoutError);

      await expect(client.logout()).rejects.toThrow();

      mockSpaClient.logout.mockResolvedValueOnce(undefined);
      await expect(client.logout()).resolves.toBeUndefined();

      expect(mockSpaClient.logout).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration', () => {
    it('should pass the same HttpClient instance to all services', () => {
      expect(MockAuthenticationOrchestrator).toHaveBeenCalledWith(
        expect.objectContaining({
          httpClient: mockHttpClient,
        })
      );

      const token = 'test_token';
      client.users(token);

      expect(MockManagementApiOrchestrator).toHaveBeenCalledWith(
        expect.objectContaining({
          httpClient: mockHttpClient,
        })
      );
    });

    it('should pass the same SPA client instance to all web adapters', () => {
      // Check that the constructors were called with the correct SPA client instance
      expect(MockWebWebAuthProvider).toHaveBeenCalledWith(mockSpaClient);
      expect(MockWebCredentialsManager).toHaveBeenCalledWith(mockSpaClient);
    });
  });
});
