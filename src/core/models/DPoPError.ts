import { AuthError } from './AuthError';

const ERROR_CODE_MAP: Record<string, string> = {
  // --- DPoP-specific error codes ---
  DPOP_GENERATION_FAILED: 'DPOP_GENERATION_FAILED',
  DPOP_PROOF_FAILED: 'DPOP_PROOF_FAILED',
  DPOP_KEY_GENERATION_FAILED: 'DPOP_KEY_GENERATION_FAILED',
  DPOP_KEY_STORAGE_FAILED: 'DPOP_KEY_STORAGE_FAILED',
  DPOP_KEY_RETRIEVAL_FAILED: 'DPOP_KEY_RETRIEVAL_FAILED',
  DPOP_NONCE_MISMATCH: 'DPOP_NONCE_MISMATCH',
  DPOP_INVALID_TOKEN_TYPE: 'DPOP_INVALID_TOKEN_TYPE',
  DPOP_MISSING_PARAMETER: 'DPOP_MISSING_PARAMETER',
  DPOP_CLEAR_KEY_FAILED: 'DPOP_CLEAR_KEY_FAILED',

  // --- Native platform mappings ---
  // iOS
  DPOP_KEY_NOT_FOUND: 'DPOP_KEY_RETRIEVAL_FAILED',
  DPOP_KEYCHAIN_ERROR: 'DPOP_KEY_STORAGE_FAILED',

  // Android
  DPOP_KEYSTORE_ERROR: 'DPOP_KEY_STORAGE_FAILED',
  DPOP_CRYPTO_ERROR: 'DPOP_KEY_GENERATION_FAILED',

  // Web
  dpop_generation_failed: 'DPOP_GENERATION_FAILED',
  dpop_proof_failed: 'DPOP_PROOF_FAILED',
  dpop_key_error: 'DPOP_KEY_GENERATION_FAILED',

  // --- Generic fallback ---
  UNKNOWN: 'UNKNOWN_DPOP_ERROR',
  OTHER: 'UNKNOWN_DPOP_ERROR',
};

/**
 * Represents an error that occurred during DPoP (Demonstrating Proof-of-Possession) operations.
 *
 * This class wraps authentication errors related to DPoP functionality, such as:
 * - Key generation and storage failures
 * - DPoP proof generation failures
 * - Token binding validation errors
 * - Nonce handling errors
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS, Android, and Web.
 *
 * @example
 * ```typescript
 * try {
 *   const headers = await auth0.getDPoPHeaders({
 *     url: 'https://api.example.com/data',
 *     method: 'GET',
 *     accessToken: credentials.accessToken,
 *     tokenType: credentials.tokenType
 *   });
 * } catch (error) {
 *   if (error instanceof DPoPError) {
 *     switch (error.type) {
 *       case 'DPOP_GENERATION_FAILED':
 *         console.log('Failed to generate DPoP proof');
 *         break;
 *       case 'DPOP_KEY_STORAGE_FAILED':
 *         console.log('Failed to store DPoP key securely');
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class DPoPError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   */
  public readonly type: string;

  /**
   * Constructs a new DPoPError instance from an AuthError.
   *
   * @param originalError The original AuthError that occurred during a DPoP operation.
   */
  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    // Map the original error code to a normalized type
    this.type = ERROR_CODE_MAP[originalError.code] || 'UNKNOWN_DPOP_ERROR';
  }
}
