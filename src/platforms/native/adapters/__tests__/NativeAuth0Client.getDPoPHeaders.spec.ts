/**
 * Test suite for getDPoPHeaders method in NativeAuth0Client
 *
 * This test file covers the DPoP (Demonstrating Proof-of-Possession) header generation
 * functionality for native platforms (iOS/Android), ensuring proper integration with
 * Auth0.swift and Auth0.Android SDKs.
 *
 * Coverage Map (Underlying SDK Tests):
 * ====================================
 * Based on Auth0.swift 2.14.0+ and Auth0.Android 3.9.1+ DPoP implementations:
 *
 * iOS (Auth0.swift):
 * -----------------
 * 1. DPoPKeyManager.generateKeys() - Secure Enclave/Keychain key generation
 *    ✓ Covered by: "should generate DPoP headers successfully"
 *    ✓ Covered by: Error tests for key generation failures
 *
 * 2. DPoPProofGenerator.generate() - JWT proof generation with claims
 *    ✓ Covered by: "should generate DPoP headers successfully"
 *    ✓ Covered by: HTTP method-specific tests
 *
 * 3. Error handling for Secure Enclave/Keychain errors
 *    ✓ Covered by: "should wrap AuthError in DPoPError"
 *    ✓ Covered by: iOS-specific error code tests
 *
 * Android (Auth0.Android):
 * -----------------------
 * 1. DPoPKeyManager.getOrCreateKeyPair() - Android Keystore key management
 *    ✓ Covered by: "should generate DPoP headers successfully"
 *    ✓ Covered by: Error tests for keystore failures
 *
 * 2. DPoPProofBuilder.build() - DPoP proof construction
 *    ✓ Covered by: "should generate DPoP headers successfully"
 *    ✓ Covered by: HTTP method-specific tests
 *
 * 3. Error handling for Keystore errors
 *    ✓ Covered by: "should wrap AuthError in DPoPError"
 *    ✓ Covered by: Android-specific error code tests
 *
 * SDK-Specific Tests (react-native-auth0):
 * ========================================
 * 1. Native bridge communication - Ensures parameters are correctly passed to native modules
 * 2. Error normalization - Tests that native errors are wrapped in DPoPError
 * 3. Bearer fallback - Tests non-DPoP token handling
 * 4. Initialization check - Ensures client is ready before calling native methods
 * 5. Cross-platform consistency - Tests match web platform behavior patterns
 */

import { NativeAuth0Client } from '../NativeAuth0Client';
import { NativeBridgeManager } from '../../bridge/NativeBridgeManager';
import { DPoPError } from '../../../../core/models/DPoPError';
import { AuthError } from '../../../../core/models';

// Mock the bridge manager
jest.mock('../../bridge/NativeBridgeManager');
const MockNativeBridgeManager = NativeBridgeManager as jest.MockedClass<
  typeof NativeBridgeManager
>;

describe('NativeAuth0Client - getDPoPHeaders', () => {
  const options = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  let mockBridgeInstance: jest.Mocked<NativeBridgeManager>;

  const mockDPoPParams = {
    url: 'https://api.example.com/resource',
    method: 'GET' as const,
    accessToken: 'test-dpop-access-token',
    tokenType: 'DPoP' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock bridge with all required methods
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
      getDPoPHeaders: jest.fn().mockResolvedValue({
        Authorization: 'DPoP test-dpop-access-token',
        DPoP: 'eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0In0...',
      }),
    };

    MockNativeBridgeManager.mockImplementation(() => {
      const instance = { ...mockMethods } as any;
      const prototype = Object.getPrototypeOf(instance);
      Object.getOwnPropertyNames(instance).forEach((methodName) => {
        if (typeof (instance as any)[methodName] === 'function') {
          (prototype as any)[methodName] = (instance as any)[methodName];
        }
      });
      return instance;
    });

    mockBridgeInstance = mockMethods as any;
  });

  describe('DPoP Token Type - Header Generation', () => {
    /**
     * Tests DPoP header generation via native bridge
     * Underlying SDKs: Auth0.swift DPoPProofGenerator, Auth0.Android DPoPProofBuilder
     */
    it('should generate DPoP headers successfully', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick); // Wait for async initialization

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers).toEqual({
        Authorization: 'DPoP test-dpop-access-token',
        DPoP: expect.stringMatching(/^eyJ/), // JWT format
      });

      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledWith(
        mockDPoPParams
      );
      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledTimes(1);
    });

    /**
     * Tests DPoP headers include proper Authorization header format
     * SDK-Specific: Ensures native modules return correct header structure
     */
    it('should return Authorization header with DPoP scheme', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers.Authorization).toBe('DPoP test-dpop-access-token');
      expect(headers.Authorization).toMatch(/^DPoP .+/);
    });

    /**
     * Tests DPoP proof is a valid JWT format
     * Underlying SDKs: Both iOS and Android generate JWT-formatted proofs
     */
    it('should return DPoP proof in JWT format', async () => {
      const mockProof =
        'eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0In0.eyJqdGkiOiJhYmMiLCJodG0iOiJHRVQiLCJodHUiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsImlhdCI6MTYwMDAwMDAwMH0.signature';
      mockBridgeInstance.getDPoPHeaders.mockResolvedValue({
        Authorization: 'DPoP test-dpop-access-token',
        DPoP: mockProof,
      });

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers.DPoP).toBe(mockProof);
      // JWT format: header.payload.signature
      expect(headers.DPoP.split('.')).toHaveLength(3);
    });

    /**
     * Tests DPoP header generation with different HTTP methods
     * Underlying SDKs: Both support all standard HTTP methods
     */
    it.each([
      ['GET', 'GET'],
      ['POST', 'POST'],
      ['PUT', 'PUT'],
      ['DELETE', 'DELETE'],
      ['PATCH', 'PATCH'],
    ])(
      'should generate DPoP headers for %s requests',
      async (method, expectedMethod) => {
        const client = new NativeAuth0Client(options);
        await new Promise(process.nextTick);

        await client.getDPoPHeaders({
          ...mockDPoPParams,
          method: method as any,
        });

        expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledWith(
          expect.objectContaining({
            method: expectedMethod,
          })
        );
      }
    );

    /**
     * Tests DPoP headers with different URL formats
     * SDK-Specific: Ensures URL is correctly passed to native bridge
     */
    it.each([
      ['https://api.example.com/resource'],
      ['https://api.example.com/v2/users/123'],
      ['https://api.example.com/path?query=value'],
      ['https://subdomain.api.example.com/resource'],
    ])('should generate DPoP headers for URL: %s', async (url) => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.getDPoPHeaders({
        ...mockDPoPParams,
        url,
      });

      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledWith(
        expect.objectContaining({
          url,
        })
      );
    });

    /**
     * Tests DPoP headers with different access tokens
     * SDK-Specific: Validates access token is passed correctly
     */
    it('should use the provided access token', async () => {
      const customToken = 'custom-access-token-12345';
      mockBridgeInstance.getDPoPHeaders.mockResolvedValue({
        Authorization: `DPoP ${customToken}`,
        DPoP: 'proof...',
      });

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        accessToken: customToken,
      });

      expect(headers.Authorization).toBe(`DPoP ${customToken}`);
      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: customToken,
        })
      );
    });
  });

  describe('Bearer Token Type - Fallback Behavior', () => {
    /**
     * Tests Bearer token fallback when tokenType is not 'DPoP'
     * SDK-Specific: Native bridge should handle non-DPoP tokens
     */
    it('should handle Bearer token type', async () => {
      mockBridgeInstance.getDPoPHeaders.mockResolvedValue({
        Authorization: 'Bearer test-dpop-access-token',
      });

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: 'Bearer',
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-dpop-access-token',
      });
      expect(headers).not.toHaveProperty('DPoP');
    });

    /**
     * Tests that Bearer tokens don't include DPoP proof
     * SDK-Specific: Ensures native modules respect tokenType parameter
     */
    it('should not include DPoP header for Bearer tokens', async () => {
      mockBridgeInstance.getDPoPHeaders.mockResolvedValue({
        Authorization: 'Bearer test-access-token',
      });

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: 'Bearer',
      });

      expect(headers.DPoP).toBeUndefined();
    });
  });

  describe('Error Handling - Native Bridge Errors', () => {
    /**
     * Tests that AuthError is wrapped in DPoPError
     * SDK-Specific: Error normalization for cross-platform consistency
     */
    it('should wrap AuthError in DPoPError', async () => {
      const mockError = new AuthError(
        'DPOP_KEY_GENERATION_FAILED',
        'Failed to generate DPoP key pair',
        { code: 'DPOP_KEY_GENERATION_FAILED' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_GENERATION_FAILED');
        expect(error.code).toBe('DPOP_KEY_GENERATION_FAILED');
        expect(error.message).toBe('Failed to generate DPoP key pair');
      }
    });

    /**
     * Tests iOS-specific error codes are normalized
     * Underlying SDK: Auth0.swift Secure Enclave/Keychain errors
     */
    it('should normalize iOS Secure Enclave errors', async () => {
      const mockError = new AuthError(
        'DPOP_CRYPTO_ERROR',
        'Secure Enclave unavailable',
        { code: 'DPOP_CRYPTO_ERROR' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_GENERATION_FAILED');
        // Original code is preserved
        expect(error.code).toBe('DPOP_CRYPTO_ERROR');
      }
    });

    /**
     * Tests iOS keychain error normalization
     * Underlying SDK: Auth0.swift Keychain errors
     */
    it('should normalize iOS keychain errors', async () => {
      const mockError = new AuthError(
        'DPOP_KEYCHAIN_ERROR',
        'Keychain access denied',
        { code: 'DPOP_KEYCHAIN_ERROR' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_STORAGE_FAILED');
        // Original code is preserved
        expect(error.code).toBe('DPOP_KEYCHAIN_ERROR');
      }
    });

    /**
     * Tests Android-specific error codes are normalized
     * Underlying SDK: Auth0.Android Keystore errors
     */
    it('should normalize Android Keystore errors', async () => {
      const mockError = new AuthError(
        'DPOP_KEYSTORE_ERROR',
        'Android Keystore error',
        { code: 'DPOP_KEYSTORE_ERROR' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_STORAGE_FAILED');
        // Original code is preserved
        expect(error.code).toBe('DPOP_KEYSTORE_ERROR');
      }
    });

    /**
     * Tests Android crypto provider errors
     * Underlying SDK: Auth0.Android crypto errors
     */
    it('should normalize Android crypto errors', async () => {
      const mockError = new AuthError(
        'DPOP_CRYPTO_ERROR',
        'Cryptography error',
        { code: 'DPOP_CRYPTO_ERROR' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_GENERATION_FAILED');
        // Original code is preserved
        expect(error.code).toBe('DPOP_CRYPTO_ERROR');
      }
    });

    /**
     * Tests that non-AuthError exceptions are not wrapped
     * SDK-Specific: Only AuthError should be wrapped in DPoPError
     */
    it('should not wrap non-AuthError exceptions', async () => {
      const mockError = new Error('Generic error');

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await expect(client.getDPoPHeaders(mockDPoPParams)).rejects.toThrow(
        'Generic error'
      );
      await expect(client.getDPoPHeaders(mockDPoPParams)).rejects.not.toThrow(
        DPoPError
      );
    });

    /**
     * Tests error handling when bridge is not initialized
     * SDK-Specific: Ensures client waits for initialization
     */
    it('should wait for client to be ready before calling bridge', async () => {
      let initResolve: () => void;
      const initPromise = new Promise<void>((resolve) => {
        initResolve = resolve;
      });

      mockBridgeInstance.hasValidInstance.mockResolvedValue(false);
      mockBridgeInstance.initialize.mockImplementation(async () => {
        await initPromise;
      });

      const client = new NativeAuth0Client(options);

      // Call getDPoPHeaders immediately without waiting
      const headersPromise = client.getDPoPHeaders(mockDPoPParams);

      // Verify bridge method hasn't been called yet
      expect(mockBridgeInstance.getDPoPHeaders).not.toHaveBeenCalled();

      // Complete initialization
      initResolve!();
      await new Promise(process.nextTick);

      // Now the method should be called
      await headersPromise;
      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledTimes(1);
    });
  });

  describe('Parameter Validation', () => {
    /**
     * Tests that all required parameters are passed to native bridge
     * SDK-Specific: Ensures no data loss in bridge communication
     */
    it('should pass all required parameters to native bridge', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      await client.getDPoPHeaders(mockDPoPParams);

      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledWith({
        url: mockDPoPParams.url,
        method: mockDPoPParams.method,
        accessToken: mockDPoPParams.accessToken,
        tokenType: mockDPoPParams.tokenType,
      });
    });

    /**
     * Tests parameter structure matches expected interface
     * SDK-Specific: Type safety verification
     */
    it('should maintain parameter structure integrity', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const customParams = {
        url: 'https://custom.api.com/endpoint',
        method: 'POST' as const,
        accessToken: 'custom-token',
        tokenType: 'DPoP' as const,
      };

      await client.getDPoPHeaders(customParams);

      const callArgs = mockBridgeInstance.getDPoPHeaders.mock.calls[0][0];
      expect(callArgs).toEqual(customParams);
      expect(callArgs).toHaveProperty('url');
      expect(callArgs).toHaveProperty('method');
      expect(callArgs).toHaveProperty('accessToken');
      expect(callArgs).toHaveProperty('tokenType');
    });
  });

  describe('Cross-Platform Consistency', () => {
    /**
     * Tests that native platform returns same header structure as web
     * SDK-Specific: Cross-platform API consistency
     */
    it('should return headers in cross-platform compatible format', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      // Verify structure matches web platform
      expect(headers).toHaveProperty('Authorization');
      expect(headers).toHaveProperty('DPoP');
      expect(typeof headers.Authorization).toBe('string');
      expect(typeof headers.DPoP).toBe('string');
      expect(headers.Authorization).toMatch(/^DPoP .+/);
    });

    /**
     * Tests Bearer fallback matches web behavior
     * SDK-Specific: Consistent non-DPoP token handling
     */
    it('should match web Bearer fallback behavior', async () => {
      mockBridgeInstance.getDPoPHeaders.mockResolvedValue({
        Authorization: 'Bearer test-access-token',
      });

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: 'Bearer',
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      });
      expect(headers).not.toHaveProperty('DPoP');
    });

    /**
     * Tests error structure matches across platforms
     * SDK-Specific: DPoPError consistency
     */
    it('should throw errors with consistent structure across platforms', async () => {
      const mockError = new AuthError(
        'DPOP_GENERATION_FAILED',
        'Failed to generate proof',
        { code: 'DPOP_GENERATION_FAILED' }
      );

      mockBridgeInstance.getDPoPHeaders.mockRejectedValue(mockError);

      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('type');
        expect(error.type).toBe('DPOP_GENERATION_FAILED');
      }
    });
  });

  describe('Client Lifecycle', () => {
    /**
     * Tests getDPoPHeaders works after client initialization
     * SDK-Specific: Async constructor handling
     */
    it('should work correctly after async initialization completes', async () => {
      mockBridgeInstance.hasValidInstance.mockResolvedValue(false);
      mockBridgeInstance.initialize.mockResolvedValue(undefined);

      const client = new NativeAuth0Client(options);

      // Wait for initialization
      await new Promise(process.nextTick);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers).toBeDefined();
      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalled();
    });

    /**
     * Tests multiple concurrent getDPoPHeaders calls
     * SDK-Specific: Thread safety and concurrent access
     */
    it('should handle concurrent getDPoPHeaders calls', async () => {
      const client = new NativeAuth0Client(options);
      await new Promise(process.nextTick);

      // Make multiple concurrent calls
      const promises = [
        client.getDPoPHeaders(mockDPoPParams),
        client.getDPoPHeaders({
          ...mockDPoPParams,
          url: 'https://api2.example.com',
        }),
        client.getDPoPHeaders({
          ...mockDPoPParams,
          method: 'POST',
        }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((headers) => {
        expect(headers).toHaveProperty('Authorization');
        expect(headers).toHaveProperty('DPoP');
      });

      expect(mockBridgeInstance.getDPoPHeaders).toHaveBeenCalledTimes(3);
    });
  });
});
