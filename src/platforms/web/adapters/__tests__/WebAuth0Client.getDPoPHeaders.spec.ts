/**
 * Test suite for getDPoPHeaders method in WebAuth0Client
 *
 * This test file covers the DPoP (Demonstrating Proof-of-Possession) header generation
 * functionality for the web platform, ensuring proper integration with auth0-spa-js.
 *
 * Coverage Map (Underlying SDK Tests):
 * ====================================
 * Based on auth0-spa-js 2.7.0+ DPoP implementation:
 *
 * 1. generateDpopProof() - Proof generation with nonce support
 *    ✓ Covered by: "should generate DPoP headers successfully with DPoP token"
 *    ✓ Covered by: "should generate DPoP headers with nonce"
 *
 * 2. getDpopNonce() - Nonce retrieval from SPA SDK
 *    ✓ Covered by: "should generate DPoP headers with nonce"
 *    ✓ Covered by: "should handle undefined nonce gracefully"
 *
 * 3. Bearer Token Fallback - Non-DPoP token handling
 *    ✓ Covered by: "should return Bearer header when tokenType is not DPoP"
 *
 * 4. Error Handling - auth0-spa-js error propagation
 *    ✓ Covered by: "should throw DPoPError when DPoP proof generation fails"
 *    ✓ Covered by: "should throw DPoPError when nonce retrieval fails"
 *
 * SDK-Specific Tests (react-native-auth0):
 * ========================================
 * 1. DPoPError wrapping - Ensures AuthError is wrapped in DPoPError
 * 2. Parameter validation - Validates required parameters (url, method, accessToken, tokenType)
 * 3. Header structure - Ensures correct Authorization and DPoP header format
 * 4. Cross-platform consistency - Tests match native platform behavior patterns
 */

import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebAuth0Client } from '../WebAuth0Client';
import { DPoPError } from '../../../../core/models/DPoPError';

// Mock auth0-spa-js
jest.mock('@auth0/auth0-spa-js');
jest.mock('../WebWebAuthProvider');
jest.mock('../WebCredentialsManager');
jest.mock('../../../../core/services/AuthenticationOrchestrator');
jest.mock('../../../../core/services/ManagementApiOrchestrator');
jest.mock('../../../../core/services/HttpClient');

// Mock AuthError and DPoPError properly
jest.mock('../../../../core/models', () => ({
  AuthError: class MockAuthError extends Error {
    code: string;
    details?: any;
    constructor(code: string, message: string, details?: any) {
      super(message);
      this.name = code;
      this.code = code;
      if (details) {
        this.details = details;
        Object.assign(this, details);
      }
    }
  },
  DPoPError: jest.requireActual('../../../../core/models/DPoPError').DPoPError,
  Credentials: jest.fn(),
  Auth0User: jest.fn(),
}));

const MockAuth0Client = Auth0Client as jest.MockedClass<typeof Auth0Client>;

describe('WebAuth0Client - getDPoPHeaders', () => {
  let client: WebAuth0Client;
  let mockSpaClient: jest.Mocked<Auth0Client>;

  const defaultOptions = {
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
  };

  const mockDPoPParams = {
    url: 'https://api.example.com/resource',
    method: 'GET' as const,
    accessToken: 'test-dpop-access-token',
    tokenType: 'DPoP' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    WebAuth0Client.resetSpaClientSingleton();

    // Setup window.location mock
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.example.com' },
      writable: true,
      configurable: true,
    });

    // Create mock SPA client with DPoP methods
    mockSpaClient = {
      logout: jest.fn().mockResolvedValue(undefined),
      loginWithRedirect: jest.fn(),
      handleRedirectCallback: jest.fn(),
      getTokenSilently: jest.fn(),
      getIdTokenClaims: jest.fn(),
      isAuthenticated: jest.fn(),
      getDpopNonce: jest.fn(),
      generateDpopProof: jest.fn(),
    } as any;

    MockAuth0Client.mockImplementation(() => mockSpaClient);

    client = new WebAuth0Client(defaultOptions);
  });

  describe('DPoP Token Type - Header Generation', () => {
    /**
     * Tests DPoP header generation when tokenType is 'DPoP'
     * Underlying SDK: auth0-spa-js generateDpopProof()
     */
    it('should generate DPoP headers successfully with DPoP token', async () => {
      const mockProof = 'eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0In0...';

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers).toEqual({
        Authorization: 'DPoP test-dpop-access-token',
        DPoP: mockProof,
      });

      expect(mockSpaClient.getDpopNonce).toHaveBeenCalledTimes(1);
      expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith({
        url: mockDPoPParams.url,
        method: mockDPoPParams.method,
        nonce: undefined,
        accessToken: mockDPoPParams.accessToken,
      });
    });

    /**
     * Tests DPoP header generation with nonce support
     * Underlying SDK: auth0-spa-js getDpopNonce() + generateDpopProof()
     */
    it('should generate DPoP headers with nonce', async () => {
      const mockNonce = 'test-nonce-12345';
      const mockProof = 'eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0In0...';

      mockSpaClient.getDpopNonce.mockResolvedValue(mockNonce);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers).toEqual({
        Authorization: 'DPoP test-dpop-access-token',
        DPoP: mockProof,
      });

      expect(mockSpaClient.getDpopNonce).toHaveBeenCalledTimes(1);
      expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith({
        url: mockDPoPParams.url,
        method: mockDPoPParams.method,
        nonce: mockNonce,
        accessToken: mockDPoPParams.accessToken,
      });
    });

    /**
     * Tests handling of undefined nonce (first request scenario)
     * Underlying SDK: auth0-spa-js getDpopNonce() returns undefined initially
     */
    it('should handle undefined nonce gracefully', async () => {
      const mockProof = 'eyJhbGciOiJFUzI1NiIsInR5cCI6ImRwb3Arand0In0...';

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers.DPoP).toBe(mockProof);
      expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith(
        expect.objectContaining({
          nonce: undefined,
        })
      );
    });

    /**
     * Tests handling of empty DPoP proof (edge case)
     * SDK-Specific: react-native-auth0 should handle null/undefined proof
     */
    it('should handle undefined DPoP proof gracefully', async () => {
      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(undefined as any);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      expect(headers).toEqual({
        Authorization: 'DPoP test-dpop-access-token',
      });
      expect(headers.DPoP).toBeUndefined();
    });

    /**
     * Tests DPoP header generation with different HTTP methods
     * Underlying SDK: auth0-spa-js supports all HTTP methods
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
        const mockProof = `proof-for-${method}`;
        mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
        mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

        const headers = await client.getDPoPHeaders({
          ...mockDPoPParams,
          method: method as any,
        });

        expect(headers.DPoP).toBe(mockProof);
        expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith(
          expect.objectContaining({
            method: expectedMethod,
          })
        );
      }
    );

    /**
     * Tests DPoP headers with different URL formats
     * SDK-Specific: Ensures URL is passed correctly to underlying SDK
     */
    it.each([
      ['https://api.example.com/resource'],
      ['https://api.example.com/v2/users/123'],
      ['https://api.example.com/path?query=value'],
      ['https://subdomain.api.example.com/resource'],
    ])('should generate DPoP headers for URL: %s', async (url) => {
      const mockProof = 'test-proof';
      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      await client.getDPoPHeaders({
        ...mockDPoPParams,
        url,
      });

      expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith(
        expect.objectContaining({
          url,
        })
      );
    });
  });

  describe('Bearer Token Type - Fallback Behavior', () => {
    /**
     * Tests Bearer token fallback when tokenType is not 'DPoP'
     * SDK-Specific: react-native-auth0 should handle non-DPoP tokens gracefully
     */
    it('should return Bearer header when tokenType is not DPoP', async () => {
      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: 'Bearer',
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-dpop-access-token',
      });

      // Should not call DPoP methods for Bearer tokens
      expect(mockSpaClient.getDpopNonce).not.toHaveBeenCalled();
      expect(mockSpaClient.generateDpopProof).not.toHaveBeenCalled();
    });

    /**
     * Tests Bearer fallback with undefined tokenType
     * SDK-Specific: Graceful handling of missing tokenType
     */
    it('should return Bearer header when tokenType is undefined', async () => {
      const headers = await client.getDPoPHeaders({
        url: mockDPoPParams.url,
        method: mockDPoPParams.method,
        accessToken: mockDPoPParams.accessToken,
        tokenType: undefined as any,
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-dpop-access-token',
      });

      expect(mockSpaClient.getDpopNonce).not.toHaveBeenCalled();
      expect(mockSpaClient.generateDpopProof).not.toHaveBeenCalled();
    });

    /**
     * Tests Bearer fallback with empty string tokenType
     * SDK-Specific: Edge case handling
     */
    it('should return Bearer header when tokenType is empty string', async () => {
      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: '' as any,
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-dpop-access-token',
      });
    });
  });

  describe('Error Handling - DPoP Operations', () => {
    /**
     * Tests error wrapping when DPoP proof generation fails
     * Underlying SDK: auth0-spa-js generateDpopProof() error handling
     * SDK-Specific: Wraps errors in DPoPError for cross-platform consistency
     */
    it('should throw DPoPError when DPoP proof generation fails', async () => {
      const mockError = {
        error: 'dpop_generation_failed',
        error_description: 'Failed to generate DPoP proof',
      };

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockRejectedValue(mockError);

      await expect(client.getDPoPHeaders(mockDPoPParams)).rejects.toThrow(
        DPoPError
      );

      try {
        await client.getDPoPHeaders(mockDPoPParams);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_GENERATION_FAILED');
        expect(error.message).toBe('Failed to generate DPoP proof');
      }
    });

    /**
     * Tests error handling when nonce retrieval fails
     * Underlying SDK: auth0-spa-js getDpopNonce() error handling
     */
    it('should throw DPoPError when nonce retrieval fails', async () => {
      const mockError = {
        error: 'dpop_nonce_error',
        error_description: 'Failed to retrieve DPoP nonce',
      };

      mockSpaClient.getDpopNonce.mockRejectedValue(mockError);

      await expect(client.getDPoPHeaders(mockDPoPParams)).rejects.toThrow(
        DPoPError
      );

      try {
        await client.getDPoPHeaders(mockDPoPParams);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.message).toContain('Failed to retrieve DPoP nonce');
      }
    });

    /**
     * Tests error handling for generic errors without error code
     * SDK-Specific: Ensures all errors are properly wrapped
     */
    it('should throw DPoPError with default message for unknown errors', async () => {
      const mockError = new Error('Unknown error');

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockRejectedValue(mockError);

      await expect(client.getDPoPHeaders(mockDPoPParams)).rejects.toThrow(
        DPoPError
      );

      try {
        await client.getDPoPHeaders(mockDPoPParams);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_GENERATION_FAILED');
        // Message comes from the wrapped error
        expect(error.message).toBe('Unknown error');
      }
    });

    /**
     * Tests error handling with dpop_proof_failed error code
     * Underlying SDK: auth0-spa-js proof validation errors
     */
    it('should normalize dpop_proof_failed error to DPOP_PROOF_FAILED', async () => {
      const mockError = {
        error: 'dpop_proof_failed',
        error_description: 'DPoP proof validation failed',
      };

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockRejectedValue(mockError);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_PROOF_FAILED');
      }
    });

    /**
     * Tests error handling with dpop_key_error error code
     * Underlying SDK: auth0-spa-js key generation/storage errors
     */
    it('should normalize dpop_key_error to DPOP_KEY_GENERATION_FAILED', async () => {
      const mockError = {
        error: 'dpop_key_error',
        error_description: 'DPoP key error',
      };

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockRejectedValue(mockError);

      try {
        await client.getDPoPHeaders(mockDPoPParams);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DPoPError);
        expect(error.type).toBe('DPOP_KEY_GENERATION_FAILED');
      }
    });
  });

  describe('Parameter Validation', () => {
    /**
     * Tests that all required parameters are passed to underlying SDK
     * SDK-Specific: Ensures bridge correctly forwards parameters
     */
    it('should pass all required parameters to generateDpopProof', async () => {
      const mockProof = 'test-proof';
      const mockNonce = 'test-nonce';

      mockSpaClient.getDpopNonce.mockResolvedValue(mockNonce);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      await client.getDPoPHeaders(mockDPoPParams);

      expect(mockSpaClient.generateDpopProof).toHaveBeenCalledWith({
        url: mockDPoPParams.url,
        method: mockDPoPParams.method,
        nonce: mockNonce,
        accessToken: mockDPoPParams.accessToken,
      });
    });

    /**
     * Tests correct access token is included in Authorization header
     * SDK-Specific: Header structure validation
     */
    it('should use the provided access token in Authorization header', async () => {
      const customToken = 'custom-access-token-12345';
      const mockProof = 'test-proof';

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        accessToken: customToken,
      });

      expect(headers.Authorization).toBe(`DPoP ${customToken}`);
    });
  });

  describe('Cross-Platform Consistency', () => {
    /**
     * Tests that DPoP headers format matches native platform expectations
     * SDK-Specific: Ensures web platform returns same structure as iOS/Android
     */
    it('should return headers in cross-platform compatible format', async () => {
      const mockProof = 'test-proof';

      mockSpaClient.getDpopNonce.mockResolvedValue(undefined);
      mockSpaClient.generateDpopProof.mockResolvedValue(mockProof);

      const headers = await client.getDPoPHeaders(mockDPoPParams);

      // Verify structure matches what native platforms return
      expect(headers).toHaveProperty('Authorization');
      expect(headers).toHaveProperty('DPoP');
      expect(typeof headers.Authorization).toBe('string');
      expect(typeof headers.DPoP).toBe('string');
      expect(headers.Authorization).toMatch(/^DPoP .+/);
    });

    /**
     * Tests Bearer fallback matches native behavior
     * SDK-Specific: Cross-platform consistency for non-DPoP tokens
     */
    it('should match native Bearer fallback behavior', async () => {
      const headers = await client.getDPoPHeaders({
        ...mockDPoPParams,
        tokenType: 'Bearer',
      });

      expect(headers).toEqual({
        Authorization: 'Bearer test-dpop-access-token',
      });
      expect(headers).not.toHaveProperty('DPoP');
    });
  });
});
