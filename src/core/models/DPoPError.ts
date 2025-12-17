import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for DPoP (Demonstrating Proof-of-Possession) operations.
 *
 * Use these constants for type-safe error handling when working with DPoP-bound tokens.
 * DPoP enhances OAuth 2.0 security by binding tokens to cryptographic keys.
 * Each constant corresponds to a specific error type in the {@link DPoPError.type} property.
 *
 * @example
 * ```typescript
 * import { DPoPError, DPoPErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   const headers = await auth0.getDPoPHeaders({
 *     url: 'https://api.example.com/data',
 *     method: 'GET',
 *     accessToken: credentials.accessToken,
 *     tokenType: credentials.tokenType
 *   });
 * } catch (e) {
 *   if (e instanceof DPoPError) {
 *     switch (e.type) {
 *       case DPoPErrorCodes.DPOP_KEY_GENERATION_FAILED:
 *         // Failed to generate DPoP key pair
 *         break;
 *       case DPoPErrorCodes.DPOP_PROOF_FAILED:
 *         // Failed to create DPoP proof
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link DPoPError}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9449|RFC 9449 - OAuth 2.0 DPoP}
 */
export const DPoPErrorCodes = {
  /** Failed to generate DPoP proof JWT */
  DPOP_GENERATION_FAILED: 'DPOP_GENERATION_FAILED',
  /** DPoP proof validation or creation failed */
  DPOP_PROOF_FAILED: 'DPOP_PROOF_FAILED',
  /** Failed to generate DPoP key pair */
  DPOP_KEY_GENERATION_FAILED: 'DPOP_KEY_GENERATION_FAILED',
  /** Failed to store DPoP key securely (keychain/keystore) */
  DPOP_KEY_STORAGE_FAILED: 'DPOP_KEY_STORAGE_FAILED',
  /** Failed to retrieve stored DPoP key */
  DPOP_KEY_RETRIEVAL_FAILED: 'DPOP_KEY_RETRIEVAL_FAILED',
  /** DPoP nonce mismatch - server rejected the proof */
  DPOP_NONCE_MISMATCH: 'DPOP_NONCE_MISMATCH',
  /** Invalid token type for DPoP operation */
  DPOP_INVALID_TOKEN_TYPE: 'DPOP_INVALID_TOKEN_TYPE',
  /** Required DPoP parameter is missing */
  DPOP_MISSING_PARAMETER: 'DPOP_MISSING_PARAMETER',
  /** Failed to clear/delete DPoP key */
  DPOP_CLEAR_KEY_FAILED: 'DPOP_CLEAR_KEY_FAILED',
  /** Unknown or uncategorized DPoP error */
  UNKNOWN_DPOP_ERROR: 'UNKNOWN_DPOP_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  // --- DPoP-specific error codes ---
  DPOP_GENERATION_FAILED: DPoPErrorCodes.DPOP_GENERATION_FAILED,
  DPOP_PROOF_FAILED: DPoPErrorCodes.DPOP_PROOF_FAILED,
  DPOP_KEY_GENERATION_FAILED: DPoPErrorCodes.DPOP_KEY_GENERATION_FAILED,
  DPOP_KEY_STORAGE_FAILED: DPoPErrorCodes.DPOP_KEY_STORAGE_FAILED,
  DPOP_KEY_RETRIEVAL_FAILED: DPoPErrorCodes.DPOP_KEY_RETRIEVAL_FAILED,
  DPOP_NONCE_MISMATCH: DPoPErrorCodes.DPOP_NONCE_MISMATCH,
  DPOP_INVALID_TOKEN_TYPE: DPoPErrorCodes.DPOP_INVALID_TOKEN_TYPE,
  DPOP_MISSING_PARAMETER: DPoPErrorCodes.DPOP_MISSING_PARAMETER,
  DPOP_CLEAR_KEY_FAILED: DPoPErrorCodes.DPOP_CLEAR_KEY_FAILED,

  // --- Native platform mappings ---
  // iOS
  DPOP_KEY_NOT_FOUND: DPoPErrorCodes.DPOP_KEY_RETRIEVAL_FAILED,
  DPOP_KEYCHAIN_ERROR: DPoPErrorCodes.DPOP_KEY_STORAGE_FAILED,

  // Android
  DPOP_KEYSTORE_ERROR: DPoPErrorCodes.DPOP_KEY_STORAGE_FAILED,
  DPOP_CRYPTO_ERROR: DPoPErrorCodes.DPOP_KEY_GENERATION_FAILED,

  // Web
  dpop_generation_failed: DPoPErrorCodes.DPOP_GENERATION_FAILED,
  dpop_proof_failed: DPoPErrorCodes.DPOP_PROOF_FAILED,
  dpop_key_error: DPoPErrorCodes.DPOP_KEY_GENERATION_FAILED,

  // --- Generic fallback ---
  UNKNOWN: DPoPErrorCodes.UNKNOWN_DPOP_ERROR,
  OTHER: DPoPErrorCodes.UNKNOWN_DPOP_ERROR,
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
    this.type =
      ERROR_CODE_MAP[originalError.code] || DPoPErrorCodes.UNKNOWN_DPOP_ERROR;
  }
}
