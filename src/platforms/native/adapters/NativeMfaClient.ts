import type { IMfaClient } from '../../../core/interfaces';
import type { INativeBridge } from '../bridge';
import type {
  Credentials,
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
  MfaGetAuthenticatorsParameters,
  MfaEnrollParameters,
  MfaEnrollPhoneParameters,
  MfaEnrollVoiceParameters,
  MfaEnrollEmailParameters,
  MfaEnrollTypeParameters,
  MfaChallengeWithAuthenticatorParameters,
  MfaVerifyParameters,
  MfaVerifyOtpParameters,
  MfaVerifyOobParameters,
  MfaVerifyRecoveryCodeParameters,
} from '../../../types';
import { AuthError, MfaError } from '../../../core/models';

export class NativeMfaClient implements IMfaClient {
  private readonly bridge: INativeBridge;

  constructor(bridge: INativeBridge) {
    this.bridge = bridge;
  }

  async getAuthenticators(
    parameters: MfaGetAuthenticatorsParameters
  ): Promise<MfaAuthenticator[]> {
    try {
      return await this.bridge.mfaGetAuthenticators(
        parameters.mfaToken,
        parameters.factorsAllowed
      );
    } catch (e) {
      throw e instanceof AuthError ? new MfaError(e) : e;
    }
  }

  async enroll(
    parameters: MfaEnrollParameters
  ): Promise<MfaEnrollmentChallenge> {
    const { mfaToken } = parameters;
    let type: string;
    let value: string | undefined;

    if (
      'voice' in parameters &&
      (parameters as MfaEnrollVoiceParameters).voice
    ) {
      type = 'voice';
      value = (parameters as MfaEnrollVoiceParameters).phoneNumber;
    } else if ('phoneNumber' in parameters) {
      type = 'phone';
      value = (parameters as MfaEnrollPhoneParameters).phoneNumber;
    } else if ('email' in parameters) {
      type = 'email';
      value = (parameters as MfaEnrollEmailParameters).email;
    } else {
      type = (parameters as MfaEnrollTypeParameters).type;
    }

    try {
      return await this.bridge.mfaEnroll(mfaToken, type, value);
    } catch (e) {
      throw e instanceof AuthError ? new MfaError(e) : e;
    }
  }

  async challenge(
    parameters: MfaChallengeWithAuthenticatorParameters
  ): Promise<MfaChallengeResult> {
    try {
      return await this.bridge.mfaChallenge(
        parameters.mfaToken,
        parameters.authenticatorId
      );
    } catch (e) {
      throw e instanceof AuthError ? new MfaError(e) : e;
    }
  }

  async verify(parameters: MfaVerifyParameters): Promise<Credentials> {
    const { mfaToken } = parameters;

    try {
      if ('otp' in parameters) {
        return await this.bridge.mfaVerify(
          mfaToken,
          'otp',
          (parameters as MfaVerifyOtpParameters).otp
        );
      }

      if ('oobCode' in parameters) {
        const oobParams = parameters as MfaVerifyOobParameters;
        return await this.bridge.mfaVerify(
          mfaToken,
          'oob',
          oobParams.oobCode,
          oobParams.bindingCode
        );
      }

      const recoveryParams = parameters as MfaVerifyRecoveryCodeParameters;
      return await this.bridge.mfaVerify(
        mfaToken,
        'recoveryCode',
        recoveryParams.recoveryCode
      );
    } catch (e) {
      throw e instanceof AuthError ? new MfaError(e) : e;
    }
  }
}
