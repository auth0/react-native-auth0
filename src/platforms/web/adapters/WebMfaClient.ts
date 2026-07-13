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

  // IDs are type-prefixed (e.g. "otp|dev_x"). Authenticator apps use 'otp';
  // all out-of-band factors (sms/voice/email/push) use 'oob'.
  private static challengeTypeFor(authenticatorId: string): 'otp' | 'oob' {
    const prefix = authenticatorId.split('|')[0];
    return prefix === 'otp' || prefix === 'totp' ? 'otp' : 'oob';
  }

  // spa-js reads `oob_channels` (plural) but /mfa/authenticators returns
  // `oob_channel` (singular), so its mapped `oobChannels` is always undefined.
  // Fall back to any explicit channel, then to the type-prefixed id.
  private static readonly CHANNEL_ID_PREFIXES = [
    'sms',
    'voice',
    'email',
    'auth0',
  ];

  private static resolveOobChannel(authenticator: {
    id?: string;
    oobChannels?: string[];
    oobChannel?: string;
    oob_channel?: string;
  }): string | undefined {
    const explicit =
      authenticator.oobChannels?.[0] ??
      authenticator.oobChannel ??
      authenticator.oob_channel;
    if (explicit) return explicit;
    const prefix = authenticator.id?.split('|')[0];
    return prefix && WebMfaClient.CHANNEL_ID_PREFIXES.includes(prefix)
      ? prefix
      : undefined;
  }

  // Match against the requested factor via `type` (the discriminator native
  // also uses; spa-js maps it correctly). sms and voice both surface as `phone`,
  // so they're narrowed by resolved channel; an unresolved channel matches
  // either to avoid dropping a usable factor.
  private static matchesFactor(
    authenticator: {
      authenticatorType: string;
      type?: string;
      oobChannels?: string[];
      oobChannel?: string;
      oob_channel?: string;
      id?: string;
    },
    factor: string
  ): boolean {
    const type = authenticator.type;
    switch (factor) {
      case 'otp':
        return (
          type === 'otp' ||
          type === 'totp' ||
          authenticator.authenticatorType === 'otp'
        );
      case 'sms': {
        if (type !== 'phone') return false;
        const channel = WebMfaClient.resolveOobChannel(authenticator);
        return channel === undefined || channel === 'sms';
      }
      case 'voice': {
        if (type !== 'phone') return false;
        const channel = WebMfaClient.resolveOobChannel(authenticator);
        return channel === undefined || channel === 'voice';
      }
      case 'email':
        return type === 'email';
      case 'push':
        return type === 'push-notification';
      default:
        return false;
    }
  }

  // spa-js filters by the challenge types in its MFA context, which is only
  // populated by its own login flow. Here the mfa_token comes from outside
  // spa-js, so the context is empty and getAuthenticators throws
  // "challengeType is required". Seed a permissive context to get all
  // authenticators, then apply our own factorsAllowed filter.
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
        // Only synthesize when spa-js reports the context is missing, so a real
        // one from its own login flow is preserved.
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
                WebMfaClient.matchesFactor(a as any, factor)
              )
            )
          : authenticators;

      return filtered.map((a) => ({
        id: a.id,
        type: (a as { type?: string }).type,
        authenticatorType: a.authenticatorType,
        active: a.active,
        name: a.name,
        oobChannel: WebMfaClient.resolveOobChannel(a as any),
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

      // Push enrolls as OOB but returns a barcodeUri for QR pairing; surface
      // it as a dedicated push type.
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
      // spa-js reads scope/audience from the stored context, not verify()
      // params, so seed it when either is supplied. Omitting both preserves
      // whatever spa-js's login flow set.
      if (parameters.scope !== undefined || parameters.audience !== undefined) {
        this.spaMfa.setMFAAuthDetails(
          parameters.mfaToken,
          parameters.scope,
          parameters.audience
        );
      }

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
