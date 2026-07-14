import type { IMfaClient } from '../../../core/interfaces';
import type { INativeBridge } from '../bridge';
import type {
  Credentials,
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
  MfaGetAuthenticatorsParameters,
  MfaEnrollParameters,
  MfaEnrollSmsParameters,
  MfaEnrollVoiceParameters,
  MfaEnrollEmailParameters,
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
      return await this.bridge.getMfaAuthenticators(
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
    const { mfaToken, factorType } = parameters;
    let type: string = factorType;
    let value: string | undefined;

    if (factorType === 'sms' || factorType === 'voice') {
      type = factorType === 'sms' ? 'phone' : 'voice';
      value = (parameters as MfaEnrollSmsParameters | MfaEnrollVoiceParameters)
        .phoneNumber;
    } else if (factorType === 'email') {
      value = (parameters as MfaEnrollEmailParameters).email;
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
    const { mfaToken, scope, audience } = parameters;

    try {
      if ('otp' in parameters) {
        return await this.bridge.mfaVerify(
          mfaToken,
          'otp',
          (parameters as MfaVerifyOtpParameters).otp,
          undefined,
          scope,
          audience
        );
      }

      if ('oobCode' in parameters) {
        const oobParams = parameters as MfaVerifyOobParameters;
        return await this.bridge.mfaVerify(
          mfaToken,
          'oob',
          oobParams.oobCode,
          oobParams.bindingCode,
          scope,
          audience
        );
      }

      const recoveryParams = parameters as MfaVerifyRecoveryCodeParameters;
      return await this.bridge.mfaVerify(
        mfaToken,
        'recoveryCode',
        recoveryParams.recoveryCode,
        undefined,
        scope,
        audience
      );
    } catch (e) {
      throw e instanceof AuthError ? new MfaError(e) : e;
    }
  }
}
