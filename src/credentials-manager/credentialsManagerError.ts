import { handleInvalidToken } from '../auth/authError';
import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';

export default class CredentialsManagerError<
  CredentialsManagerErrorDetails
> extends BaseError {
  public json;
  public status;
  public invalid_parameter;
  public type;

  constructor(response: Auth0Response<CredentialsManagerErrorDetails>) {
    const { status, json, text } = response;
    const {
      error,
      error_description: description,
      invalid_parameter,
      code,
    }: {
      error?: string;
      error_description?: string;
      invalid_parameter?: string;
      code?: string;
    } = json ?? {
      error: undefined,
      error_description: undefined,
      invalid_parameter: undefined,
      code: undefined,
    };
    super(
      error || 'a0.response.invalid',
      description || text || handleInvalidToken(response) || 'unknown error'
    );
    this.json = json;
    this.status = status;
    this.type = this.convertToCommonErrorCode(code || '');

    if (invalid_parameter) {
      this.invalid_parameter = invalid_parameter;
    }
  }

  convertToCommonErrorCode(code: string): string {
    let errorMapping: Record<string, string> = {
      INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
      NO_CREDENTIALS: 'NO_CREDENTIALS',
      NO_REFRESH_TOKEN: 'NO_REFRESH_TOKEN',
      RENEW_FAILED: 'RENEW_FAILED',
      STORE_FAILED: 'STORE_FAILED',
      REVOKE_FAILED: 'REVOKE_FAILED',
      LARGE_MIN_TTL: 'LARGE_MIN_TTL',
      INCOMPATIBLE_DEVICE: 'INCOMPATIBLE_DEVICE',
      CRYPTO_EXCEPTION: 'CRYPTO_EXCEPTION',
      BIOMETRIC_NO_ACTIVITY: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_STATUS_UNKNOWN: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_UNSUPPORTED: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_HW_UNAVAILABLE: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NONE_ENROLLED: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NO_HARDWARE: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED: 'BIOMETRICS_FAILED',
      BIOMETRIC_AUTHENTICATION_CHECK_FAILED: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE:
        'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NEGATIVE_BUTTON: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_HW_NOT_PRESENT: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NO_BIOMETRICS: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_USER_CANCELED: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_LOCKOUT_PERMANENT: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_VENDOR: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_LOCKOUT: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_CANCELED: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_NO_SPACE: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_TIMEOUT: 'BIOMETRICS_FAILED',
      BIOMETRIC_ERROR_UNABLE_TO_PROCESS: 'BIOMETRICS_FAILED',
      BIOMETRICS_INVALID_USER: 'BIOMETRICS_FAILED',
      BIOMETRIC_AUTHENTICATION_FAILED: 'BIOMETRICS_FAILED',
      BIOMETRICS_FAILED: 'BIOMETRICS_FAILED',
      NO_NETWORK: 'NO_NETWORK',
      API_ERROR: 'API_ERROR',
    };
    return errorMapping[code] || 'UNKNOWN_ERROR';
  }
}

export interface CredentialsManagerErrorDetails {
  error?: string;
  error_description?: string;
  invalid_parameter?: string;
  code?: string;
}
