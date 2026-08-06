import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebAuth0Client } from '../WebAuth0Client';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { WebCredentialsManager } from '../WebCredentialsManager';
import { WebMyAccountClient } from '../WebMyAccountClient';
import { AuthenticationOrchestrator } from '../../../../core/services';
import { HttpClient } from '../../../../core/services/HttpClient';

// Mock all dependencies
jest.mock('@auth0/auth0-spa-js');
jest.mock('../WebWebAuthProvider');
jest.mock('../WebCredentialsManager');
jest.mock('../../../../core/services/AuthenticationOrchestrator');
jest.mock('../../../../core/services/HttpClient');

// Mock AuthError and AuthenticationException properly to support inheritance
jest.mock('../../../../core/models', () => {
  class MockAuthError extends Error {
    code: string;
    json: any;
    constructor(name: string, message: string, details?: any) {
      super(message);
      this.name = name;
      this.code = details?.code ?? name;
      this.json = details?.json;
      if (details) {
        Object.assign(this, details);
      }
    }
  }

  class MockAuthenticationException extends Error {
    type: string;
    underlyingError: MockAuthError;
    constructor(underlyingError: MockAuthError) {
      super(underlyingError.message);
      this.name = 'AuthenticationException';
      this.underlyingError = underlyingError;
      // Map error codes to types
      const codeMap: Record<string, string> = {
        'invalid_grant': 'INVALID_GRANT',
        'a0.token_exchange_failed': 'TOKEN_EXCHANGE_DENIED',
        'custom_token_exchange_failed': 'UNKNOWN_ERROR',
      };
      this.type = codeMap[underlyingError.code] ?? 'UNKNOWN_ERROR';
    }
  }

  class MockPasskeyError extends Error {
    type: string;
    code: string;
    json: any;
    constructor(
      originalError: MockAuthError | Error,
      fallbackType = 'PASSKEY_UNKNOWN_ERROR'
    ) {
      super(originalError.message);
      this.name = 'PasskeyError';
      const isAuthError = originalError instanceof MockAuthError;
      this.code = isAuthError ? originalError.code : originalError.name;
      this.json = isAuthError ? originalError.json : originalError;

      // Simplified ERROR_CODE_MAP matching the real PasskeyError
      const codeMap: Record<string, string> = {
        InvalidParameter: 'PASSKEY_INVALID_PARAMETER',
        passkey_challenge_error: 'PASSKEY_CHALLENGE_FAILED',
        passkey_get_token_error: 'PASSKEY_EXCHANGE_FAILED',
        passkey_invalid_credential: 'PASSKEY_INVALID_CREDENTIAL',
        mfa_required: 'PASSKEY_MFA_REQUIRED',
        // Add others as needed by tests
      };
      this.type = codeMap[this.code] ?? fallbackType;
    }

    getMfaRequiredPayload() {
      if (this.type !== 'PASSKEY_MFA_REQUIRED') {
        return null;
      }
      return {
        mfaToken: this.json.mfa_token ?? '',
        error: this.json.error ?? this.code,
        errorDescription: this.json.error_description ?? this.message,
        mfaRequirements: this.json.mfa_requirements,
      };
    }
  }

  return {
    AuthError: MockAuthError,
    AuthenticationException: MockAuthenticationException,
    PasskeyError: MockPasskeyError,
    // Add other exports from models if needed
    Credentials: jest.fn(),
    Auth0User: jest.fn(),
  };
});

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
      passkey: {
        getSignupChallenge: jest.fn(),
        getLoginChallenge: jest.fn(),
        getTokenWithPasskey: jest.fn(),
      },
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

      expect(MockAuthenticationOrchestrator).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: defaultOptions.clientId,
          httpClient: mockHttpClient,
          tokenType: 'Bearer',
          baseUrl: `https://${defaultOptions.domain}`,
        })
      );

      expect(MockWebWebAuthProvider).toHaveBeenCalledWith(mockSpaClient);
      expect(MockWebCredentialsManager).toHaveBeenCalledWith(mockSpaClient);
    });

    it('should use DPoP token type when useDPoP is enabled', () => {
      MockAuthenticationOrchestrator.mockClear();

      const dpopClient = new WebAuth0Client({
        ...defaultOptions,
        useDPoP: true,
      });

      expect(dpopClient).toBeDefined();
      expect(MockAuthenticationOrchestrator).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenType: 'DPoP',
          getDPoPHeaders: expect.any(Function),
        })
      );
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

    it('should provide a WebMyAccountClient wired with the shared spa-js client', () => {
      expect(client.myAccount).toBeInstanceOf(WebMyAccountClient);
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
      expect(MockHttpClient).toHaveBeenCalledTimes(1);
    });

    it('should pass the same SPA client instance to all web adapters', () => {
      // Check that the constructors were called with the correct SPA client instance
      expect(MockWebWebAuthProvider).toHaveBeenCalledWith(mockSpaClient);
      expect(MockWebCredentialsManager).toHaveBeenCalledWith(mockSpaClient);
    });
  });

  describe('customTokenExchange method', () => {
    const mockExchangeResponse = {
      access_token: 'exchanged-access-token',
      id_token: 'exchanged-id-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile email',
      refresh_token: 'exchanged-refresh-token',
    };

    beforeEach(() => {
      mockSpaClient.loginWithCustomTokenExchange = jest
        .fn()
        .mockResolvedValue(mockExchangeResponse);
    });

    it('should call loginWithCustomTokenExchange on SPA client with all parameters', async () => {
      const parameters = {
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
        audience: 'https://api.example.com',
        scope: 'openid profile email',
        organization: 'org_123',
      };

      await client.customTokenExchange(parameters);

      expect(mockSpaClient.loginWithCustomTokenExchange).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-token',
        audience: 'https://api.example.com',
        scope: 'openid profile email',
        organization: 'org_123',
      });
    });

    it('should call loginWithCustomTokenExchange with only required parameters', async () => {
      const parameters = {
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      };

      await client.customTokenExchange(parameters);

      expect(mockSpaClient.loginWithCustomTokenExchange).toHaveBeenCalledWith({
        subject_token: 'external-token',
        subject_token_type: 'urn:acme:legacy-token',
        audience: undefined,
        scope: 'openid profile email', // Default scope applied
        organization: undefined,
      });
    });

    it('should return credentials with correct structure', async () => {
      const result = await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      expect(result.accessToken).toBe('exchanged-access-token');
      expect(result.idToken).toBe('exchanged-id-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.scope).toBe('openid profile email');
      expect(result.refreshToken).toBe('exchanged-refresh-token');
      // expiresAt should be a timestamp in the future
      expect(result.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should convert expires_in to expiresAt timestamp', async () => {
      const beforeCall = Math.floor(Date.now() / 1000);

      const result = await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      const afterCall = Math.floor(Date.now() / 1000);

      // expiresAt should be approximately now + expires_in (3600 seconds)
      expect(result.expiresAt).toBeGreaterThanOrEqual(beforeCall + 3600);
      expect(result.expiresAt).toBeLessThanOrEqual(afterCall + 3600);
    });

    it('should use client tokenType as fallback when response token_type is missing', async () => {
      const dpopClient = new WebAuth0Client({
        ...defaultOptions,
        useDPoP: true,
      });
      mockSpaClient.loginWithCustomTokenExchange.mockResolvedValueOnce({
        ...mockExchangeResponse,
        token_type: undefined,
      });

      const result = await dpopClient.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      // Should use client's configured tokenType (DPoP)
      expect(result.tokenType).toBe('DPoP');
    });

    it('should propagate errors from loginWithCustomTokenExchange as AuthenticationException', async () => {
      const exchangeError = {
        error: 'invalid_grant',
        error_description: 'Token exchange failed',
        message: 'Token exchange failed',
      };
      mockSpaClient.loginWithCustomTokenExchange.mockRejectedValueOnce(
        exchangeError
      );

      await expect(
        client.customTokenExchange({
          subjectToken: 'bad-token',
          subjectTokenType: 'urn:acme:legacy-token',
        })
      ).rejects.toThrow('Token exchange failed');

      try {
        await client.customTokenExchange({
          subjectToken: 'bad-token',
          subjectTokenType: 'urn:acme:legacy-token',
        });
      } catch (e: any) {
        expect(e.name).toBe('AuthenticationException');
        expect(e.type).toBe('INVALID_GRANT');
      }
    });

    it('should wrap generic errors in AuthenticationException', async () => {
      const genericError = new Error('Network error');
      mockSpaClient.loginWithCustomTokenExchange.mockRejectedValueOnce(
        genericError
      );

      await expect(
        client.customTokenExchange({
          subjectToken: 'bad-token',
          subjectTokenType: 'urn:acme:legacy-token',
        })
      ).rejects.toThrow('Network error');

      try {
        await client.customTokenExchange({
          subjectToken: 'bad-token',
          subjectTokenType: 'urn:acme:legacy-token',
        });
      } catch (e: any) {
        expect(e.name).toBe('AuthenticationException');
      }
    });

    it('should forward actor token parameters as snake_case when provided', async () => {
      await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
        actorToken: 'actor-token',
        actorTokenType: 'http://corporate-idp/id-token',
      });

      expect(mockSpaClient.loginWithCustomTokenExchange).toHaveBeenCalledWith(
        expect.objectContaining({
          actor_token: 'actor-token',
          actor_token_type: 'http://corporate-idp/id-token',
        })
      );
    });

    it('returns an undefined refreshToken when the actor exchange omits refresh_token', async () => {
      mockSpaClient.loginWithCustomTokenExchange.mockResolvedValueOnce({
        ...mockExchangeResponse,
        refresh_token: undefined,
      });

      const result = await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
        actorToken: 'actor-token',
        actorTokenType: 'http://corporate-idp/id-token',
      });

      expect(result.refreshToken).toBeUndefined();
      expect(result.accessToken).toBe('exchanged-access-token');
    });

    it('should not include actor token keys when not provided', async () => {
      await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      const callArg =
        mockSpaClient.loginWithCustomTokenExchange.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('actor_token');
      expect(callArg).not.toHaveProperty('actor_token_type');
    });

    it('should not forward whitespace-only actor token values', async () => {
      await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
        actorToken: '   ',
        actorTokenType: '   ',
      });

      const callArg =
        mockSpaClient.loginWithCustomTokenExchange.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('actor_token');
      expect(callArg).not.toHaveProperty('actor_token_type');
    });

    it('should throw before the network call when only actorToken is provided', async () => {
      await expect(
        client.customTokenExchange({
          subjectToken: 'external-token',
          subjectTokenType: 'urn:acme:legacy-token',
          actorToken: 'actor-token',
        })
      ).rejects.toMatchObject({ code: 'invalid_actor_token_parameters' });

      expect(mockSpaClient.loginWithCustomTokenExchange).not.toHaveBeenCalled();
    });

    it('should throw before the network call when only actorTokenType is provided', async () => {
      await expect(
        client.customTokenExchange({
          subjectToken: 'external-token',
          subjectTokenType: 'urn:acme:legacy-token',
          actorTokenType: 'http://corporate-idp/id-token',
        })
      ).rejects.toMatchObject({ code: 'invalid_actor_token_parameters' });

      expect(mockSpaClient.loginWithCustomTokenExchange).not.toHaveBeenCalled();
    });
  });

  describe('passkeySignupChallenge method', () => {
    const mockPublicKey = {
      challenge: 'challenge-value',
      rp: { id: 'test.auth0.com', name: 'Test App' },
      user: { id: 'user-id', name: 'user@example.com', displayName: 'User' },
    };

    it('should request a signup challenge and map the response', async () => {
      mockSpaClient.passkey.getSignupChallenge.mockResolvedValue({
        authSession: 'auth-session-123',
        publicKey: mockPublicKey,
      });

      const result = await client.passkeySignupChallenge({
        email: 'user@example.com',
        name: 'John Doe',
        realm: 'Username-Password-Authentication',
      });

      expect(mockSpaClient.passkey.getSignupChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          name: 'John Doe',
          realm: 'Username-Password-Authentication',
        })
      );
      expect(result).toEqual({
        authSession: 'auth-session-123',
        authParamsPublicKey: mockPublicKey,
      });
    });

    it('should throw PasskeyError when the challenge request fails', async () => {
      mockSpaClient.passkey.getSignupChallenge.mockRejectedValue({
        code: 'passkey_register_error',
        message: 'Failed to request signup challenge',
      });

      await expect(
        client.passkeySignupChallenge({ email: 'user@example.com' })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_register_error',
      });
    });

    it('should forward the request to the SPA client even without a client-side identifier check, letting the connection reject it server-side', async () => {
      // Matches native, which also forwards these fields as-is with no
      // client-side validation — which identifiers are accepted depends
      // on the database connection's configuration, not a fixed SDK rule.
      mockSpaClient.passkey.getSignupChallenge.mockRejectedValue({
        code: 'passkey_register_error',
        message: 'At least one of email, phone_number or username is required',
      });

      await expect(
        client.passkeySignupChallenge({
          name: 'John Doe',
          realm: 'Username-Password-Authentication',
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_register_error',
      });
      expect(mockSpaClient.passkey.getSignupChallenge).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' })
      );
    });

    it('should preserve the original message for a network failure with no .code or .error', async () => {
      mockSpaClient.passkey.getSignupChallenge.mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(
        client.passkeySignupChallenge({ email: 'user@example.com' })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        message: 'Failed to fetch',
      });
    });

    it('should accept phoneNumber as the sole identifier', async () => {
      mockSpaClient.passkey.getSignupChallenge.mockResolvedValue({
        authSession: 'auth-session-123',
        publicKey: mockPublicKey,
      });

      await client.passkeySignupChallenge({ phoneNumber: '+15551234567' });

      expect(mockSpaClient.passkey.getSignupChallenge).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: '+15551234567' })
      );
    });

    it('should accept username as the sole identifier', async () => {
      mockSpaClient.passkey.getSignupChallenge.mockResolvedValue({
        authSession: 'auth-session-123',
        publicKey: mockPublicKey,
      });

      await client.passkeySignupChallenge({ username: 'johndoe' });

      expect(mockSpaClient.passkey.getSignupChallenge).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'johndoe' })
      );
    });
  });

  describe('passkeyLoginChallenge method', () => {
    const mockPublicKey = {
      challenge: 'challenge-value',
      rpId: 'test.auth0.com',
    };

    it('should request a login challenge and map the response', async () => {
      mockSpaClient.passkey.getLoginChallenge.mockResolvedValue({
        authSession: 'auth-session-456',
        publicKey: mockPublicKey,
      });

      const result = await client.passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
      });

      expect(mockSpaClient.passkey.getLoginChallenge).toHaveBeenCalledWith({
        realm: 'Username-Password-Authentication',
        organization: undefined,
      });
      expect(result).toEqual({
        authSession: 'auth-session-456',
        authParamsPublicKey: mockPublicKey,
      });
    });

    it('should throw PasskeyError when the challenge request fails', async () => {
      mockSpaClient.passkey.getLoginChallenge.mockRejectedValue({
        code: 'passkey_challenge_error',
        message: 'Failed to request login challenge',
      });

      await expect(client.passkeyLoginChallenge({})).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_challenge_error',
      });
    });

    it('should extract the OAuth2-style .error field when the SPA client rejects without a .code', async () => {
      mockSpaClient.passkey.getLoginChallenge.mockRejectedValue({
        error: 'passkey_not_supported',
        error_description: 'WebAuthn is not supported in this browser.',
        message: 'WebAuthn is not supported in this browser.',
      });

      await expect(client.passkeyLoginChallenge({})).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_not_supported',
      });
    });
  });

  describe('getTokenByPasskey method', () => {
    it('should exchange the credential for tokens', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      mockSpaClient.passkey.getTokenWithPasskey.mockResolvedValue({
        access_token: 'passkey-access-token',
        id_token: 'passkey-id-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email',
        refresh_token: 'passkey-refresh-token',
      });

      const result = await client.getTokenByPasskey({
        authSession: 'auth-session-123',
        authResponse: rawCredential,
        realm: 'Username-Password-Authentication',
      });

      expect(mockSpaClient.passkey.getTokenWithPasskey).toHaveBeenCalledWith({
        authSession: 'auth-session-123',
        credential: rawCredential,
        realm: 'Username-Password-Authentication',
        audience: undefined,
        scope: 'openid profile email',
        organization: undefined,
      });
      expect(result.accessToken).toBe('passkey-access-token');
      expect(result.idToken).toBe('passkey-id-token');
      expect(result.refreshToken).toBe('passkey-refresh-token');
      expect(result.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('should use the provided scope instead of the default when given', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      mockSpaClient.passkey.getTokenWithPasskey.mockResolvedValue({
        access_token: 'passkey-access-token',
        id_token: 'passkey-id-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email offline_access',
        refresh_token: 'passkey-refresh-token',
      });

      await client.getTokenByPasskey({
        authSession: 'auth-session-123',
        authResponse: rawCredential,
        realm: 'Username-Password-Authentication',
        scope: 'openid profile email offline_access',
      });

      expect(mockSpaClient.passkey.getTokenWithPasskey).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: 'openid profile email offline_access',
        })
      );
    });

    it('should throw PasskeyError when the exchange fails', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      mockSpaClient.passkey.getTokenWithPasskey.mockRejectedValue({
        code: 'passkey_get_token_error',
        message: 'Failed to exchange credential',
      });

      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_get_token_error',
      });
    });

    it('should extract the OAuth2-style .error field from a GenericError-shaped rejection (no .code)', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      // auth0-spa-js's getTokenWithPasskey funnels through _requestToken,
      // which throws GenericError/MfaRequiredError/MissingRefreshTokenError/
      // UseDpopNonceError for the webauthn grant — none of these set `.code`,
      // only the OAuth2-style `.error`/`.error_description` fields.
      mockSpaClient.passkey.getTokenWithPasskey.mockRejectedValue({
        error: 'invalid_grant',
        error_description: 'Invalid authorization grant',
        message: 'Invalid authorization grant',
      });

      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'invalid_grant',
        message: 'Invalid authorization grant',
      });
    });

    it('should propagate mfa_token/mfa_requirements when the exchange requires MFA', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      mockSpaClient.passkey.getTokenWithPasskey.mockRejectedValue({
        error: 'mfa_required',
        error_description: 'MFA is required',
        mfa_token: 'mfa_tok_123',
        mfa_requirements: {
          challenge: [{ type: 'sms' }, { type: 'otp' }],
          enroll: [{ type: 'email' }],
        },
      });

      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'mfa_required',
        type: 'PASSKEY_MFA_REQUIRED',
        json: expect.objectContaining({
          mfa_token: 'mfa_tok_123',
          mfa_requirements: {
            challenge: [{ type: 'sms' }, { type: 'otp' }],
            enroll: [{ type: 'email' }],
          },
        }),
      });

      // Also verify getMfaRequiredPayload() returns structured data
      try {
        await client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        });
      } catch (error: any) {
        const payload = error.getMfaRequiredPayload();
        expect(payload).toEqual({
          mfaToken: 'mfa_tok_123',
          error: 'mfa_required',
          errorDescription: 'MFA is required',
          mfaRequirements: {
            challenge: [{ type: 'sms' }, { type: 'otp' }],
            enroll: [{ type: 'email' }],
          },
        });
      }
    });

    it('should preserve the original message when the rejection has neither .code nor .error', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
      } as unknown as PublicKeyCredential;

      // e.g. the bare Error thrown by auth0-spa-js's ID token verification.
      mockSpaClient.passkey.getTokenWithPasskey.mockRejectedValue(
        new Error(
          'Signature algorithm of "none" is not supported. Expected the ID token to be signed with "RS256".'
        )
      );

      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        message:
          'Signature algorithm of "none" is not supported. Expected the ID token to be signed with "RS256".',
      });
    });

    it('should throw PasskeyError when getTokenWithPasskey fails for a raw credential', async () => {
      const rawCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        type: 'public-key',
        response: { clientDataJSON: new ArrayBuffer(8) },
      } as unknown as PublicKeyCredential;

      mockSpaClient.passkey.getTokenWithPasskey.mockRejectedValue({
        code: 'passkey_invalid_credential',
        message:
          'The provided credential is not a valid attestation or assertion response.',
      });

      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: rawCredential,
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'passkey_invalid_credential',
      });
    });

    it('should throw PasskeyError with INVALID_PARAMETER when authResponse is a string', async () => {
      await expect(
        client.getTokenByPasskey({
          authSession: 'auth-session-123',
          authResponse: '{"id":"credential-id","type":"public-key"}',
        })
      ).rejects.toMatchObject({
        name: 'PasskeyError',
        code: 'InvalidParameter',
        type: 'PASSKEY_INVALID_PARAMETER',
        message:
          'authResponse must be a PublicKeyCredential object on web, not a JSON string.',
      });

      expect(mockSpaClient.passkey.getTokenWithPasskey).not.toHaveBeenCalled();
    });
  });

  describe('ssoExchange', () => {
    it('should reject with UnsupportedOperation error on web', async () => {
      await expect(
        client.auth.ssoExchange({ refreshToken: 'test_token' })
      ).rejects.toMatchObject({
        name: 'UnsupportedOperation',
        message: expect.stringContaining(
          'Native to Web SSO Exchange is only supported on native platforms'
        ),
      });
    });
  });
});
