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

  constructor(spaMfa: MfaApiClient, tokenType: string) {
    this.spaMfa = spaMfa;
    this.tokenType = tokenType;
  }

  // Auth0 authenticator IDs are prefixed with their type (e.g. "otp|dev_x",
  // "sms|dev_x", "push|dev_x"). Authenticator apps use the 'otp' challenge type;
  // all out-of-band factors (sms/voice/email/push) use 'oob'.
  private static challengeTypeFor(authenticatorId: string): 'otp' | 'oob' {
    const prefix = authenticatorId.split('|')[0];
    return prefix === 'otp' || prefix === 'totp' ? 'otp' : 'oob';
  }

  // Decide whether an authenticator matches one of the requested
  // MfaFactorType values. spa-js exposes `authenticatorType` (otp/oob) plus an
  // `oobChannels` array; the public MfaFactorType vocabulary maps onto those.
  private static matchesFactor(
    authenticator: { authenticatorType: string; oobChannels?: string[] },
    factor: string
  ): boolean {
    const oobChannels = authenticator.oobChannels ?? [];
    switch (factor) {
      case 'otp':
        return authenticator.authenticatorType === 'otp';
      case 'sms':
        return oobChannels.includes('sms');
      case 'voice':
        return oobChannels.includes('voice');
      case 'email':
        return oobChannels.includes('email');
      // Guardian push enrolls as an OOB authenticator on the `auth0` channel.
      case 'push':
        return oobChannels.includes('auth0');
      default:
        return false;
    }
  }

  // spa-js filters authenticators by the challenge types stored in its MFA
  // context, which is only auto-populated when spa-js's own login flow hits
  // mfa_required. In this SDK the mfa_token comes from outside spa-js (e.g. a
  // native/password-realm login), so the context is empty and getAuthenticators
  // throws "challengeType is required". We seed a permissive context covering
  // every challenge type so spa-js returns all authenticators, then apply our
  // own factorsAllowed filter on top.
  private static readonly ALL_CHALLENGE_TYPES = [
    { type: 'otp' },
    { type: 'totp' },
    { type: 'phone' },
    { type: 'email' },
    { type: 'push-notification' },
    { type: 'recovery-code' },
  ];

  async getAuthenticators(
    parameters: MfaGetAuthenticatorsParameters
  ): Promise<MfaAuthenticator[]> {
    try {
      let authenticators;
      try {
        authenticators = await this.spaMfa.getAuthenticators(
          parameters.mfaToken
        );
      } catch (inner: any) {
        // Only synthesize a context when spa-js reports it is missing; this
        // preserves a real context populated by spa-js's own login flow.
        if (inner?.error !== 'invalid_request') throw inner;
        this.spaMfa.setMFAAuthDetails(
          parameters.mfaToken,
          undefined,
          undefined,
          {
            challenge: WebMfaClient.ALL_CHALLENGE_TYPES,
          }
        );
        authenticators = await this.spaMfa.getAuthenticators(
          parameters.mfaToken
        );
      }

      const { factorsAllowed } = parameters;
      const filtered =
        factorsAllowed && factorsAllowed.length > 0
          ? authenticators.filter((a) =>
              factorsAllowed.some((factor) =>
                WebMfaClient.matchesFactor(
                  a as {
                    authenticatorType: string;
                    oobChannels?: string[];
                  },
                  factor
                )
              )
            )
          : authenticators;

      return filtered.map((a) => ({
        id: a.id,
        authenticatorType: a.authenticatorType,
        active: a.active,
        name: a.name,
        oobChannel: (a as { oobChannels?: string[] }).oobChannels?.[0],
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

      // Push (Auth0 Guardian) enrolls as an OOB authenticator but additionally
      // returns a barcodeUri for QR pairing. Surface it as a dedicated push type.
      if (factorType === 'push') {
        return {
          type: 'push',
          barcodeUri: response.barcodeUri ?? '',
          oobCode: response.oobCode,
          oobChannel: response.oobChannel,
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
      const response = await this.spaMfa.challenge({
        mfaToken: parameters.mfaToken,
        challengeType: WebMfaClient.challengeTypeFor(
          parameters.authenticatorId
        ),
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
