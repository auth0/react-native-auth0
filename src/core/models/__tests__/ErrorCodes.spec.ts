import {
  WebAuthErrorCodes,
  CredentialsManagerErrorCodes,
  DPoPErrorCodes,
} from '../';

describe('Error Code Constants', () => {
  describe('WebAuthErrorCodes', () => {
    it('should export all expected error code constants', () => {
      // Verify that all expected codes are defined
      expect(WebAuthErrorCodes.USER_CANCELLED).toBe('USER_CANCELLED');
      expect(WebAuthErrorCodes.ACCESS_DENIED).toBe('ACCESS_DENIED');
      expect(WebAuthErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(WebAuthErrorCodes.ID_TOKEN_VALIDATION_FAILED).toBe(
        'ID_TOKEN_VALIDATION_FAILED'
      );
      expect(WebAuthErrorCodes.BIOMETRICS_CONFIGURATION_ERROR).toBe(
        'BIOMETRICS_CONFIGURATION_ERROR'
      );
      expect(WebAuthErrorCodes.BROWSER_NOT_AVAILABLE).toBe(
        'BROWSER_NOT_AVAILABLE'
      );
      expect(WebAuthErrorCodes.FAILED_TO_LOAD_URL).toBe('FAILED_TO_LOAD_URL');
      expect(WebAuthErrorCodes.BROWSER_TERMINATED).toBe('BROWSER_TERMINATED');
      expect(WebAuthErrorCodes.NO_BUNDLE_IDENTIFIER).toBe(
        'NO_BUNDLE_IDENTIFIER'
      );
      expect(WebAuthErrorCodes.TRANSACTION_ACTIVE_ALREADY).toBe(
        'TRANSACTION_ACTIVE_ALREADY'
      );
      expect(WebAuthErrorCodes.NO_AUTHORIZATION_CODE).toBe(
        'NO_AUTHORIZATION_CODE'
      );
      expect(WebAuthErrorCodes.PKCE_NOT_ALLOWED).toBe('PKCE_NOT_ALLOWED');
      expect(WebAuthErrorCodes.INVALID_INVITATION_URL).toBe(
        'INVALID_INVITATION_URL'
      );
      expect(WebAuthErrorCodes.INVALID_STATE).toBe('INVALID_STATE');
      expect(WebAuthErrorCodes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(WebAuthErrorCodes.CONSENT_REQUIRED).toBe('CONSENT_REQUIRED');
      expect(WebAuthErrorCodes.INVALID_CONFIGURATION).toBe(
        'INVALID_CONFIGURATION'
      );
      expect(WebAuthErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should have exactly 18 error codes', () => {
      const keys = Object.keys(WebAuthErrorCodes);
      expect(keys).toHaveLength(18);
    });

    it('should be immutable (as const)', () => {
      // TypeScript should enforce this at compile time,
      // but we can verify the object is defined
      expect(WebAuthErrorCodes).toBeDefined();
      expect(typeof WebAuthErrorCodes).toBe('object');
    });

    it('should be usable in switch statements', () => {
      const testErrorType = 'USER_CANCELLED';
      let result = '';

      switch (testErrorType) {
        case WebAuthErrorCodes.USER_CANCELLED:
          result = 'cancelled';
          break;
        case WebAuthErrorCodes.NETWORK_ERROR:
          result = 'network';
          break;
        default:
          result = 'unknown';
      }

      expect(result).toBe('cancelled');
    });
  });

  describe('CredentialsManagerErrorCodes', () => {
    it('should export all expected error code constants', () => {
      expect(CredentialsManagerErrorCodes.INVALID_CREDENTIALS).toBe(
        'INVALID_CREDENTIALS'
      );
      expect(CredentialsManagerErrorCodes.NO_CREDENTIALS).toBe(
        'NO_CREDENTIALS'
      );
      expect(CredentialsManagerErrorCodes.NO_REFRESH_TOKEN).toBe(
        'NO_REFRESH_TOKEN'
      );
      expect(CredentialsManagerErrorCodes.RENEW_FAILED).toBe('RENEW_FAILED');
      expect(CredentialsManagerErrorCodes.STORE_FAILED).toBe('STORE_FAILED');
      expect(CredentialsManagerErrorCodes.REVOKE_FAILED).toBe('REVOKE_FAILED');
      expect(CredentialsManagerErrorCodes.LARGE_MIN_TTL).toBe('LARGE_MIN_TTL');
      expect(CredentialsManagerErrorCodes.CREDENTIAL_MANAGER_ERROR).toBe(
        'CREDENTIAL_MANAGER_ERROR'
      );
      expect(CredentialsManagerErrorCodes.BIOMETRICS_FAILED).toBe(
        'BIOMETRICS_FAILED'
      );
      expect(CredentialsManagerErrorCodes.NO_NETWORK).toBe('NO_NETWORK');
      expect(CredentialsManagerErrorCodes.API_ERROR).toBe('API_ERROR');
      expect(CredentialsManagerErrorCodes.API_EXCHANGE_FAILED).toBe(
        'API_EXCHANGE_FAILED'
      );
      expect(CredentialsManagerErrorCodes.INCOMPATIBLE_DEVICE).toBe(
        'INCOMPATIBLE_DEVICE'
      );
      expect(CredentialsManagerErrorCodes.CRYPTO_EXCEPTION).toBe(
        'CRYPTO_EXCEPTION'
      );
      expect(CredentialsManagerErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should have exactly 15 error codes', () => {
      const keys = Object.keys(CredentialsManagerErrorCodes);
      expect(keys).toHaveLength(15);
    });

    it('should be immutable (as const)', () => {
      expect(CredentialsManagerErrorCodes).toBeDefined();
      expect(typeof CredentialsManagerErrorCodes).toBe('object');
    });

    it('should be usable in switch statements', () => {
      const testErrorType = 'NO_CREDENTIALS';
      let result = '';

      switch (testErrorType) {
        case CredentialsManagerErrorCodes.NO_CREDENTIALS:
          result = 'no_creds';
          break;
        case CredentialsManagerErrorCodes.NO_REFRESH_TOKEN:
          result = 'no_refresh';
          break;
        default:
          result = 'unknown';
      }

      expect(result).toBe('no_creds');
    });
  });

  describe('DPoPErrorCodes', () => {
    it('should export all expected error code constants', () => {
      expect(DPoPErrorCodes.DPOP_GENERATION_FAILED).toBe(
        'DPOP_GENERATION_FAILED'
      );
      expect(DPoPErrorCodes.DPOP_PROOF_FAILED).toBe('DPOP_PROOF_FAILED');
      expect(DPoPErrorCodes.DPOP_KEY_GENERATION_FAILED).toBe(
        'DPOP_KEY_GENERATION_FAILED'
      );
      expect(DPoPErrorCodes.DPOP_KEY_STORAGE_FAILED).toBe(
        'DPOP_KEY_STORAGE_FAILED'
      );
      expect(DPoPErrorCodes.DPOP_KEY_RETRIEVAL_FAILED).toBe(
        'DPOP_KEY_RETRIEVAL_FAILED'
      );
      expect(DPoPErrorCodes.DPOP_NONCE_MISMATCH).toBe('DPOP_NONCE_MISMATCH');
      expect(DPoPErrorCodes.DPOP_INVALID_TOKEN_TYPE).toBe(
        'DPOP_INVALID_TOKEN_TYPE'
      );
      expect(DPoPErrorCodes.DPOP_MISSING_PARAMETER).toBe(
        'DPOP_MISSING_PARAMETER'
      );
      expect(DPoPErrorCodes.DPOP_CLEAR_KEY_FAILED).toBe(
        'DPOP_CLEAR_KEY_FAILED'
      );
      expect(DPoPErrorCodes.UNKNOWN_DPOP_ERROR).toBe('UNKNOWN_DPOP_ERROR');
    });

    it('should have exactly 10 error codes', () => {
      const keys = Object.keys(DPoPErrorCodes);
      expect(keys).toHaveLength(10);
    });

    it('should be immutable (as const)', () => {
      expect(DPoPErrorCodes).toBeDefined();
      expect(typeof DPoPErrorCodes).toBe('object');
    });

    it('should be usable in switch statements', () => {
      const testErrorType = 'DPOP_GENERATION_FAILED';
      let result = '';

      switch (testErrorType) {
        case DPoPErrorCodes.DPOP_GENERATION_FAILED:
          result = 'generation_failed';
          break;
        case DPoPErrorCodes.DPOP_KEY_STORAGE_FAILED:
          result = 'storage_failed';
          break;
        default:
          result = 'unknown';
      }

      expect(result).toBe('generation_failed');
    });
  });

  describe('Cross-Error-Code Uniqueness', () => {
    it('should not have overlapping error codes between WebAuth and CredentialsManager', () => {
      const webAuthCodes = new Set(Object.values(WebAuthErrorCodes));
      const credentialsManagerCodes = new Set(
        Object.values(CredentialsManagerErrorCodes)
      );

      // Only UNKNOWN_ERROR should overlap intentionally
      const webAuthArray = Array.from(webAuthCodes);
      const credentialsArray = Array.from(credentialsManagerCodes);

      const overlaps = webAuthArray.filter((code) =>
        credentialsArray.includes(code)
      );

      // Only UNKNOWN_ERROR should be shared
      expect(overlaps).toEqual(['UNKNOWN_ERROR']);
    });

    it('should not have overlapping error codes between DPoP and other error types', () => {
      const dpopCodes = new Set(Object.values(DPoPErrorCodes));
      const webAuthCodes = new Set(Object.values(WebAuthErrorCodes));
      const credentialsManagerCodes = new Set(
        Object.values(CredentialsManagerErrorCodes)
      );

      const dpopArray = Array.from(dpopCodes);
      const webAuthArray = Array.from(webAuthCodes);
      const credentialsArray = Array.from(credentialsManagerCodes);

      const webAuthOverlaps = dpopArray.filter((code) =>
        webAuthArray.includes(code)
      );
      const credentialsOverlaps = dpopArray.filter((code) =>
        credentialsArray.includes(code)
      );

      // No overlaps expected
      expect(webAuthOverlaps).toEqual([]);
      expect(credentialsOverlaps).toEqual([]);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should allow type-safe comparisons with error types', () => {
      // This test verifies TypeScript compilation works correctly
      // At runtime, we just verify the values match
      const mockErrorType: string = 'USER_CANCELLED';

      // This should compile without errors in TypeScript
      const isUserCancelled =
        mockErrorType === WebAuthErrorCodes.USER_CANCELLED;
      expect(isUserCancelled).toBe(true);
    });

    it('should provide autocomplete-friendly constant access', () => {
      // Verify all constants are accessible and have string values
      expect(typeof WebAuthErrorCodes.USER_CANCELLED).toBe('string');
      expect(typeof CredentialsManagerErrorCodes.NO_CREDENTIALS).toBe('string');
      expect(typeof DPoPErrorCodes.DPOP_GENERATION_FAILED).toBe('string');
    });
  });
});
