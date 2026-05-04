import type { MfaApiClient } from '@auth0/auth0-spa-js';
import type { IMfaClient } from '../../../core/interfaces';
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
} from '../../../types';
import { AuthError, MfaError } from '../../../core/models';

export class WebMfaClient implements IMfaClient {
  private readonly spaMfa: MfaApiClient;
  private readonly tokenType: string;

  private static readonly ALL_CHALLENGE_TYPES = [
    { type: 'otp' },
    { type: 'oob' },
    { type: 'recovery-code' },
  ];

  constructor(spaMfa: MfaApiClient, tokenType: string) {
    this.spaMfa = spaMfa;
    this.tokenType = tokenType;
  }

  private ensureMfaContext(mfaToken: string): void {
    this.spaMfa.setMFAAuthDetails(mfaToken, undefined, undefined, {
      challenge: WebMfaClient.ALL_CHALLENGE_TYPES,
    });
  }

  async getAuthenticators(
    parameters: MfaGetAuthenticatorsParameters
  ): Promise<MfaAuthenticator[]> {
    try {
      this.ensureMfaContext(parameters.mfaToken);
      const authenticators = await this.spaMfa.getAuthenticators(
        parameters.mfaToken
      );
      return authenticators.map((a) => ({
        id: a.id,
        authenticatorType: a.authenticatorType,
        active: a.active,
        name: a.name,
      }));
    } catch (e: any) {
      const authError = new AuthError(
        e.error ?? 'mfa_list_authenticators_failed',
        e.error_description ?? e.message,
        {
          status: e.status,
          code: e.error ?? 'mfa_list_authenticators_failed',
          json: e,
        }
      );
      throw new MfaError(authError);
    }
  }

  async enroll(
    parameters: MfaEnrollParameters
  ): Promise<MfaEnrollmentChallenge> {
    try {
      this.ensureMfaContext(parameters.mfaToken);
      const { factorType } = parameters;
      let spaParams: any = {
        mfaToken: parameters.mfaToken,
        factorType,
      };

      if (factorType === 'sms' || factorType === 'voice') {
        spaParams.phoneNumber = (
          parameters as MfaEnrollSmsParameters | MfaEnrollVoiceParameters
        ).phoneNumber;
      } else if (factorType === 'email') {
        spaParams.email = (parameters as MfaEnrollEmailParameters).email;
      }

      const response = await this.spaMfa.enroll(spaParams);

      if (response.authenticatorType === 'otp') {
        return {
          type: 'totp',
          barcodeUri: response.barcodeUri,
          secret: response.secret,
          recoveryCodes: response.recoveryCodes,
        };
      }

      return {
        type: 'oob',
        oobCode: response.oobCode ?? '',
        bindingMethod: response.bindingMethod,
        recoveryCodes: response.recoveryCodes,
      };
    } catch (e: any) {
      if (e instanceof MfaError) throw e;
      const authError = new AuthError(
        e.error ?? 'mfa_enrollment_failed',
        e.error_description ?? e.message,
        {
          status: e.status,
          code: e.error ?? 'mfa_enrollment_failed',
          json: e,
        }
      );
      throw new MfaError(authError);
    }
  }

  async challenge(
    parameters: MfaChallengeWithAuthenticatorParameters
  ): Promise<MfaChallengeResult> {
    try {
      this.ensureMfaContext(parameters.mfaToken);
      const response = await this.spaMfa.challenge({
        mfaToken: parameters.mfaToken,
        challengeType: 'oob',
        authenticatorId: parameters.authenticatorId,
      });

      return {
        challengeType: response.challengeType,
        oobCode: response.oobCode,
        bindingMethod: response.bindingMethod,
      };
    } catch (e: any) {
      if (e instanceof MfaError) throw e;
      const authError = new AuthError(
        e.error ?? 'mfa_challenge_failed',
        e.error_description ?? e.message,
        {
          status: e.status,
          code: e.error ?? 'mfa_challenge_failed',
          json: e,
        }
      );
      throw new MfaError(authError);
    }
  }

  async verify(parameters: MfaVerifyParameters): Promise<Credentials> {
    try {
      this.ensureMfaContext(parameters.mfaToken);
      const spaParams: any = { mfaToken: parameters.mfaToken };

      if ('otp' in parameters) {
        spaParams.otp = parameters.otp;
      } else if ('oobCode' in parameters) {
        spaParams.oobCode = parameters.oobCode;
        if ('bindingCode' in parameters) {
          spaParams.bindingCode = parameters.bindingCode;
        }
      } else if ('recoveryCode' in parameters) {
        spaParams.recoveryCode = parameters.recoveryCode;
      }

      const response = await this.spaMfa.verify(spaParams);

      const expiresAt = Math.floor(Date.now() / 1000) + response.expires_in;
      return {
        accessToken: response.access_token,
        idToken: response.id_token,
        tokenType: response.token_type ?? this.tokenType,
        expiresAt,
        scope: response.scope,
        refreshToken: response.refresh_token,
      };
    } catch (e: any) {
      if (e instanceof MfaError) throw e;
      const authError = new AuthError(
        e.error ?? 'mfa_verify_failed',
        e.error_description ?? e.message,
        {
          status: e.status,
          code: e.error ?? 'mfa_verify_failed',
          json: e,
        }
      );
      throw new MfaError(authError);
    }
  }
}
