import { NativeAuth0Client } from '../NativeAuth0Client';
import { NativeWebAuthProvider } from '../NativeWebAuthProvider';
import { NativeCredentialsManager } from '../NativeCredentialsManager';
import { NativeBridgeManager } from '../../bridge/NativeBridgeManager';
import { act } from 'react';

// Mock the entire bridge manager, which is the direct dependency of the client.
jest.mock('../../bridge/NativeBridgeManager');
const MockNativeBridgeManager = NativeBridgeManager as jest.MockedClass<
  typeof NativeBridgeManager
>;

describe('NativeAuth0Client', () => {
  const options = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  let mockBridgeInstance: jest.Mocked<NativeBridgeManager>;

  beforeEach(() => {
    // Reset mocks for each test
    jest.clearAllMocks();

    // Create the mock functions that can be shared and overridden
    const mockMethods = {
      hasValidInstance: jest.fn().mockResolvedValue(true),
      initialize: jest.fn().mockResolvedValue(undefined),
      authorize: jest.fn().mockResolvedValue({} as any),
      clearSession: jest.fn().mockResolvedValue(undefined),
      getCredentials: jest.fn().mockResolvedValue({} as any),
      getBundleIdentifier: jest.fn().mockResolvedValue('com.my-app.mock'),
      cancelWebAuth: jest.fn().mockResolvedValue(undefined),
      saveCredentials: jest.fn().mockResolvedValue(undefined),
      hasValidCredentials: jest.fn().mockResolvedValue(true),
      clearCredentials: jest.fn().mockResolvedValue(undefined),
      clearDPoPKey: jest.fn().mockResolvedValue(undefined),
      resumeWebAuth: jest.fn().mockResolvedValue(undefined),
      getDPoPHeaders: jest.fn().mockResolvedValue({} as any),
    };

    // Set up the mock implementation with a proper prototype
    MockNativeBridgeManager.mockImplementation(() => {
      // Create a mock instance with all methods directly on the instance
      const instance = { ...mockMethods };

      // Add methods to the prototype as well so createGuardedBridge can find them
      const prototype = Object.getPrototypeOf(instance);
      Object.getOwnPropertyNames(instance).forEach((methodName) => {
        if (typeof instance[methodName] === 'function') {
          prototype[methodName] = instance[methodName];
        }
      });

      return instance as any;
    });

    // Store reference to the mock methods so tests can override them
    mockBridgeInstance = mockMethods as any;
  });

  it('should instantiate its providers upon construction', () => {
    const client = new NativeAuth0Client(options);

    // Verify that the client has created instances of its child adapters.
    expect(client.webAuth).toBeInstanceOf(NativeWebAuthProvider);
    expect(client.credentialsManager).toBeInstanceOf(NativeCredentialsManager);
  });

  it('should check for a valid native instance during initialization', async () => {
    // Create the client, which kicks off the async initialization
    const client = new NativeAuth0Client(options);
    // We need a microtask tick to allow the async constructor logic to run.
    await new Promise(process.nextTick);

    expect(mockBridgeInstance.hasValidInstance).toHaveBeenCalledTimes(1);
    expect(mockBridgeInstance.hasValidInstance).toHaveBeenCalledWith(
      options.clientId,
      options.domain
    );

    // Use client to avoid unused variable warning
    expect(client).toBeDefined();
  });

  it('should NOT call initialize if a valid instance already exists', async () => {
    // The default mock for hasValidInstance returns true.
    const client = new NativeAuth0Client(options);
    await new Promise(process.nextTick);

    expect(mockBridgeInstance.hasValidInstance).toHaveBeenCalledTimes(1);
    // Since a valid instance exists, `initialize` should not be called.
    expect(mockBridgeInstance.initialize).not.toHaveBeenCalled();

    // Use client to avoid unused variable warning
    expect(client).toBeDefined();
  });

  it('should call initialize if a valid instance does NOT exist', async () => {
    // Override the mock for this specific test.
    mockBridgeInstance.hasValidInstance.mockResolvedValue(false);

    const client = new NativeAuth0Client(options);
    await new Promise(process.nextTick);

    expect(mockBridgeInstance.hasValidInstance).toHaveBeenCalledTimes(1);
    // Since no valid instance exists, `initialize` should be called.
    expect(mockBridgeInstance.initialize).toHaveBeenCalledTimes(1);
    expect(mockBridgeInstance.initialize).toHaveBeenCalledWith(
      options.clientId,
      options.domain,
      undefined, // No local auth options provided in this test
      true, // useDPoP defaults to true
      undefined // maxRetries not provided
    );

    // Use client to avoid unused variable warning
    expect(client).toBeDefined();
  });

  it('should pass localAuthenticationOptions to initialize when provided', async () => {
    mockBridgeInstance.hasValidInstance.mockResolvedValue(false);
    const localAuthOptions = { title: 'Please Authenticate' };

    const client = new NativeAuth0Client({
      ...options,
      localAuthenticationOptions: localAuthOptions,
    });
    await new Promise(process.nextTick);

    expect(mockBridgeInstance.initialize).toHaveBeenCalledWith(
      options.clientId,
      options.domain,
      localAuthOptions,
      true, // useDPoP defaults to true
      undefined // maxRetries not provided
    );

    // Use client to avoid unused variable warning
    expect(client).toBeDefined();
  });

  it('should ensure initialization is complete before calling a bridge method', async () => {
    let resolveInitialization: () => void;
    const initializationPromise = new Promise<void>((resolve) => {
      resolveInitialization = resolve;
    });

    // Make `initialize` return a promise that we control.
    mockBridgeInstance.initialize.mockReturnValue(initializationPromise);
    mockBridgeInstance.hasValidInstance.mockResolvedValue(false);

    const client = new NativeAuth0Client(options);

    // Call an adapter method immediately.
    const authorizePromise = client.webAuth.authorize();

    // At this point, the underlying authorize call on the bridge should NOT have been made
    // because it's waiting for the `ready` promise from initialization.
    expect(mockBridgeInstance.authorize).not.toHaveBeenCalled();

    // Now, resolve the initialization promise.
    await act(async () => {
      resolveInitialization!();
    });

    // After initialization is resolved, the authorize call should proceed.
    await authorizePromise;
    expect(mockBridgeInstance.authorize).toHaveBeenCalledTimes(1);
  });

  describe('customTokenExchange', () => {
    const mockCredentials = {
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      tokenType: 'Bearer',
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      refreshToken: 'mock-refresh-token',
      scope: 'openid profile email',
    };

    beforeEach(() => {
      // Add customTokenExchange to the mock methods
      (mockBridgeInstance as any).customTokenExchange = jest
        .fn()
        .mockResolvedValue(mockCredentials);
    });

    it('should call customTokenExchange on the guarded bridge with all parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const parameters = {
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
        audience: 'https://api.example.com',
        scope: 'openid profile email',
        organization: 'org_123',
      };

      await client.customTokenExchange(parameters);

      expect(
        (mockBridgeInstance as any).customTokenExchange
      ).toHaveBeenCalledWith(
        'external-token',
        'urn:acme:legacy-token',
        'https://api.example.com',
        'openid profile email',
        'org_123'
      );
    });

    it('should call customTokenExchange with only required parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const parameters = {
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      };

      await client.customTokenExchange(parameters);

      expect(
        (mockBridgeInstance as any).customTokenExchange
      ).toHaveBeenCalledWith(
        'external-token',
        'urn:acme:legacy-token',
        undefined,
        undefined,
        undefined
      );
    });

    it('should return credentials from customTokenExchange', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      expect(result).toEqual(mockCredentials);
    });

    it('should wait for initialization before calling customTokenExchange', async () => {
      let resolveInitialization: () => void;
      const initializationPromise = new Promise<void>((resolve) => {
        resolveInitialization = resolve;
      });

      mockBridgeInstance.initialize.mockReturnValue(initializationPromise);
      mockBridgeInstance.hasValidInstance.mockResolvedValue(false);

      const client = new NativeAuth0Client(options);

      const exchangePromise = client.customTokenExchange({
        subjectToken: 'external-token',
        subjectTokenType: 'urn:acme:legacy-token',
      });

      // Should not be called yet since initialization is pending
      expect(
        (mockBridgeInstance as any).customTokenExchange
      ).not.toHaveBeenCalled();

      // Resolve initialization
      await act(async () => {
        resolveInitialization!();
      });

      await exchangePromise;
      expect(
        (mockBridgeInstance as any).customTokenExchange
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('passkeySignupChallenge', () => {
    const mockChallengeResponse = {
      authSession: 'mock-auth-session-123',
      authParamsPublicKey: {
        rp: { id: 'my-tenant.auth0.com', name: 'My App' },
        user: {
          id: 'dXNlci1pZA',
          name: 'user@example.com',
          displayName: 'User',
        },
        challenge: 'Y2hhbGxlbmdl',
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      },
    };

    beforeEach(() => {
      (mockBridgeInstance as any).passkeySignupChallenge = jest
        .fn()
        .mockResolvedValue(mockChallengeResponse);
    });

    it('should call passkeySignupChallenge on the guarded bridge with all parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.passkeySignupChallenge({
        email: 'user@example.com',
        phoneNumber: '+1234567890',
        username: 'johndoe',
        name: 'John Doe',
        givenName: 'John',
        familyName: 'Doe',
        nickname: 'johnny',
        picture: 'https://example.com/photo.png',
        userMetadata: { signup_source: 'mobile_app' },
        realm: 'Username-Password-Authentication',
        organization: 'org_123',
      });

      expect(
        (mockBridgeInstance as any).passkeySignupChallenge
      ).toHaveBeenCalledWith(
        'user@example.com',
        '+1234567890',
        'johndoe',
        'John Doe',
        'John',
        'Doe',
        'johnny',
        'https://example.com/photo.png',
        { signup_source: 'mobile_app' },
        'Username-Password-Authentication',
        'org_123'
      );
    });

    it('should convert empty strings to undefined', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.passkeySignupChallenge({
        email: 'user@example.com',
        phoneNumber: '',
        username: '',
        name: '',
        realm: 'Username-Password-Authentication',
      });

      expect(
        (mockBridgeInstance as any).passkeySignupChallenge
      ).toHaveBeenCalledWith(
        'user@example.com',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Username-Password-Authentication',
        undefined
      );
    });

    it('should return challenge response from passkeySignupChallenge', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.passkeySignupChallenge({
        email: 'user@example.com',
        realm: 'Username-Password-Authentication',
      });

      expect(result).toEqual(mockChallengeResponse);
    });

    it('should throw PasskeyError on failure', async () => {
      const { AuthError } = require('../../../../core/models');
      const { PasskeyError } = require('../../../../core/models');

      (mockBridgeInstance as any).passkeySignupChallenge = jest
        .fn()
        .mockRejectedValue(
          new AuthError('PASSKEY_CHALLENGE_FAILED', 'Challenge failed', {
            code: 'PASSKEY_CHALLENGE_FAILED',
          })
        );

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(
        client.passkeySignupChallenge({
          email: 'user@example.com',
          realm: 'Username-Password-Authentication',
        })
      ).rejects.toBeInstanceOf(PasskeyError);
    });
  });

  describe('passkeyLoginChallenge', () => {
    const mockChallengeResponse = {
      authSession: 'mock-auth-session-456',
      authParamsPublicKey: {
        rpId: 'my-tenant.auth0.com',
        challenge: 'Y2hhbGxlbmdl',
        allowCredentials: [],
      },
    };

    beforeEach(() => {
      (mockBridgeInstance as any).passkeyLoginChallenge = jest
        .fn()
        .mockResolvedValue(mockChallengeResponse);
    });

    it('should call passkeyLoginChallenge on the guarded bridge with all parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
        organization: 'org_123',
      });

      expect(
        (mockBridgeInstance as any).passkeyLoginChallenge
      ).toHaveBeenCalledWith('Username-Password-Authentication', 'org_123');
    });

    it('should return challenge response from passkeyLoginChallenge', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
      });

      expect(result).toEqual(mockChallengeResponse);
    });

    it('should throw PasskeyError on failure', async () => {
      const { AuthError } = require('../../../../core/models');
      const { PasskeyError } = require('../../../../core/models');

      (mockBridgeInstance as any).passkeyLoginChallenge = jest
        .fn()
        .mockRejectedValue(
          new AuthError('PASSKEY_CHALLENGE_FAILED', 'Challenge failed', {
            code: 'PASSKEY_CHALLENGE_FAILED',
          })
        );

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(
        client.passkeyLoginChallenge({
          realm: 'Username-Password-Authentication',
        })
      ).rejects.toBeInstanceOf(PasskeyError);
    });
  });

  describe('passkeyExchange', () => {
    const mockCredentials = {
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      tokenType: 'Bearer',
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      refreshToken: 'mock-refresh-token',
      scope: 'openid profile email',
    };

    beforeEach(() => {
      (mockBridgeInstance as any).passkeyExchange = jest
        .fn()
        .mockResolvedValue(mockCredentials);
    });

    it('should call passkeyExchange on the guarded bridge with all parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.passkeyExchange({
        authSession: 'auth-session-123',
        authResponse: '{"id":"cred-id","type":"public-key","response":{}}',
        realm: 'Username-Password-Authentication',
        audience: 'https://api.example.com',
        scope: 'openid profile email',
        organization: 'org_123',
      });

      expect((mockBridgeInstance as any).passkeyExchange).toHaveBeenCalledWith(
        'auth-session-123',
        '{"id":"cred-id","type":"public-key","response":{}}',
        'Username-Password-Authentication',
        'https://api.example.com',
        'openid profile email',
        'org_123'
      );
    });

    it('should call passkeyExchange with only required parameters', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.passkeyExchange({
        authSession: 'auth-session-123',
        authResponse: '{"id":"cred-id","type":"public-key","response":{}}',
      });

      expect((mockBridgeInstance as any).passkeyExchange).toHaveBeenCalledWith(
        'auth-session-123',
        '{"id":"cred-id","type":"public-key","response":{}}',
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should return credentials from passkeyExchange', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.passkeyExchange({
        authSession: 'auth-session-123',
        authResponse: '{"id":"cred-id","type":"public-key","response":{}}',
      });

      expect(result).toEqual(mockCredentials);
    });

    it('should throw PasskeyError on failure', async () => {
      const { AuthError } = require('../../../../core/models');
      const { PasskeyError } = require('../../../../core/models');

      (mockBridgeInstance as any).passkeyExchange = jest.fn().mockRejectedValue(
        new AuthError('PASSKEY_EXCHANGE_FAILED', 'Exchange failed', {
          code: 'PASSKEY_EXCHANGE_FAILED',
        })
      );

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(
        client.passkeyExchange({
          authSession: 'auth-session-123',
          authResponse: '{"id":"cred-id","type":"public-key","response":{}}',
        })
      ).rejects.toBeInstanceOf(PasskeyError);
    });
  });

  describe('passkeyRegistration', () => {
    const mockResponseJson =
      '{"id":"cred-id","rawId":"cred-id","type":"public-key","response":{"clientDataJSON":"abc","attestationObject":"def"},"authenticatorAttachment":"platform"}';

    beforeEach(() => {
      (mockBridgeInstance as any).passkeyRegistration = jest
        .fn()
        .mockResolvedValue(mockResponseJson);
    });

    it('should call passkeyRegistration on the guarded bridge with challengeJson', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const challengeJson =
        '{"rp":{"id":"example.com"},"challenge":"abc","user":{"id":"123","name":"user@example.com"}}';

      await client.passkeyRegistration({ challengeJson });

      expect(
        (mockBridgeInstance as any).passkeyRegistration
      ).toHaveBeenCalledWith(challengeJson);
    });

    it('should return credential response JSON string', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.passkeyRegistration({
        challengeJson:
          '{"rp":{"id":"example.com"},"challenge":"abc","user":{"id":"123","name":"user@example.com"}}',
      });

      expect(result).toEqual(mockResponseJson);
    });

    it('should throw PasskeyError on failure', async () => {
      const { AuthError } = require('../../../../core/models');
      const { PasskeyError } = require('../../../../core/models');

      (mockBridgeInstance as any).passkeyRegistration = jest
        .fn()
        .mockRejectedValue(
          new AuthError('PASSKEY_REGISTRATION_FAILED', 'Registration failed', {
            code: 'PASSKEY_REGISTRATION_FAILED',
          })
        );

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(
        client.passkeyRegistration({
          challengeJson:
            '{"rp":{"id":"example.com"},"challenge":"abc","user":{"id":"123","name":"user@example.com"}}',
        })
      ).rejects.toBeInstanceOf(PasskeyError);
    });
  });

  describe('passkeyAssertion', () => {
    const mockResponseJson =
      '{"id":"cred-id","rawId":"cred-id","type":"public-key","response":{"clientDataJSON":"abc","authenticatorData":"def","signature":"ghi","userHandle":"jkl"},"authenticatorAttachment":"platform"}';

    beforeEach(() => {
      (mockBridgeInstance as any).passkeyAssertion = jest
        .fn()
        .mockResolvedValue(mockResponseJson);
    });

    it('should call passkeyAssertion on the guarded bridge with challengeJson', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const challengeJson =
        '{"rpId":"example.com","challenge":"abc","allowCredentials":[]}';

      await client.passkeyAssertion({ challengeJson });

      expect((mockBridgeInstance as any).passkeyAssertion).toHaveBeenCalledWith(
        challengeJson
      );
    });

    it('should return credential response JSON string', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const result = await client.passkeyAssertion({
        challengeJson:
          '{"rpId":"example.com","challenge":"abc","allowCredentials":[]}',
      });

      expect(result).toEqual(mockResponseJson);
    });

    it('should throw PasskeyError on failure', async () => {
      const { AuthError } = require('../../../../core/models');
      const { PasskeyError } = require('../../../../core/models');

      (mockBridgeInstance as any).passkeyAssertion = jest
        .fn()
        .mockRejectedValue(
          new AuthError('PASSKEY_ASSERTION_FAILED', 'Assertion failed', {
            code: 'PASSKEY_ASSERTION_FAILED',
          })
        );

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(
        client.passkeyAssertion({
          challengeJson:
            '{"rpId":"example.com","challenge":"abc","allowCredentials":[]}',
        })
      ).rejects.toBeInstanceOf(PasskeyError);
    });
  });
});
