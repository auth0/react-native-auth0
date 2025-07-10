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
      resumeWebAuth: jest.fn().mockResolvedValue(undefined),
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
      undefined // No local auth options provided in this test
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
      localAuthOptions
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
});
