import { AuthError } from './AuthError';

/**
 * Public constants exposing all possible CredentialsManager error codes.
 */
export const CredentialsManagerErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NO_CREDENTIALS: 'NO_CREDENTIALS',
  NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN',
  RENEW_FAILED: 'RENEW_FAILED',
  STORE_FAILED: 'STORE_FAILED',
  REVOKE_FAILED: 'REVOKE_FAILED',
  LARGE_MIN_TTL: 'LARGE_MIN_TTL',
  CREDENTIAL_MANAGER_ERROR: 'CREDENTIAL_MANAGER_ERROR',
  BIOMETRICS_FAILED: 'BIOMETRICS_FAILED',
  NO_NETWORK: 'NO_NETWORK',
  API_ERROR: 'API_ERROR',
  INCOMPATIBLE_DEVICE: 'INCOMPATIBLE_DEVICE',
  CRYPTO_EXCEPTION: 'CRYPTO_EXCEPTION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

const ERROR_CODE_MAP: Record<string, string> = {
  INVALID_CREDENTIALS: CredentialsManagerErrorCodes.INVALID_CREDENTIALS,
  NO_CREDENTIALS: CredentialsManagerErrorCodes.NO_CREDENTIALS,
  NO_REFRESH_TOKEN: CredentialsManagerErrorCodes.NO_REFRESH_TOKEN,
  RENEW_FAILED: CredentialsManagerErrorCodes.RENEW_FAILED,
  STORE_FAILED: CredentialsManagerErrorCodes.STORE_FAILED,
  REVOKE_FAILED: CredentialsManagerErrorCodes.REVOKE_FAILED,
  LARGE_MIN_TTL: CredentialsManagerErrorCodes.LARGE_MIN_TTL,
  CREDENTIAL_MANAGER_ERROR: CredentialsManagerErrorCodes.CREDENTIAL_MANAGER_ERROR,
  BIOMETRICS_FAILED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  NO_NETWORK: CredentialsManagerErrorCodes.NO_NETWORK,
  API_ERROR: CredentialsManagerErrorCodes.API_ERROR,

  // --- Web (@auth0/auth0-spa-js) mappings ---
  login_required: CredentialsManagerErrorCodes.NO_CREDENTIALS,
  consent_required: CredentialsManagerErrorCodes.RENEW_FAILED,
  mfa_required: CredentialsManagerErrorCodes.RENEW_FAILED,
  invalid_grant: CredentialsManagerErrorCodes.RENEW_FAILED,
  invalid_refresh_token: CredentialsManagerErrorCodes.RENEW_FAILED,
  missing_refresh_token: CredentialsManagerErrorCodes.NO_REFRESH_TOKEN,

  // --- Many-to-one mapping for granular Android Biometric errors ---
  INCOMPATIBLE_DEVICE: CredentialsManagerErrorCodes.INCOMPATIBLE_DEVICE,
  CRYPTO_EXCEPTION: CredentialsManagerErrorCodes.CRYPTO_EXCEPTION,
  BIOMETRIC_NO_ACTIVITY: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_STATUS_UNKNOWN: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_UNSUPPORTED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_HW_UNAVAILABLE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NONE_ENROLLED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_HARDWARE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_AUTHENTICATION_CHECK_FAILED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE:
    CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NEGATIVE_BUTTON: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_HW_NOT_PRESENT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_BIOMETRICS: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_USER_CANCELED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_LOCKOUT_PERMANENT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_VENDOR: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_LOCKOUT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_CANCELED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_NO_SPACE: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_TIMEOUT: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_ERROR_UNABLE_TO_PROCESS: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRICS_INVALID_USER: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
  BIOMETRIC_AUTHENTICATION_FAILED: CredentialsManagerErrorCodes.BIOMETRICS_FAILED,
};

export class CredentialsManagerError extends AuthError {
  public readonly type: string;

  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    this.type =
      ERROR_CODE_MAP[originalError.code] || CredentialsManagerErrorCodes.UNKNOWN_ERROR;
  }
}