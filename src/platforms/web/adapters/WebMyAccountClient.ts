import {
  Auth0Client,
  MyAccountApiError,
  MyAccountApiClient,
  type EnrollmentChallengeOptions,
  type EnrollmentVerifyOptions,
  type Factor as SpaFactor,
  type AuthenticationMethod as SpaAuthenticationMethod,
  type EnrollmentChallengeResponse as SpaEnrollmentChallengeResponse,
  type PasskeyEnrollmentChallengeResponse as SpaPasskeyEnrollmentChallengeResponse,
  type TotpEnrollmentChallengeResponse as SpaTotpEnrollmentChallengeResponse,
  type PushNotificationEnrollmentChallengeResponse as SpaPushEnrollmentChallengeResponse,
  type RecoveryCodeEnrollmentChallengeResponse as SpaRecoveryCodeEnrollmentChallengeResponse,
} from '@auth0/auth0-spa-js';
import type { MyAccountClient } from '../../../core/interfaces';
import type {
  PasskeyEnrollmentChallengeParameters,
  PasskeyEnrollmentChallengeResponse,
  EnrollPasskeyParameters,
  PasskeyAuthenticationMethod,
  GetAuthenticationMethodsParameters,
  GetAuthenticationMethodByIdParameters,
  UpdateAuthenticationMethodByIdParameters,
  DeleteAuthenticationMethodByIdParameters,
  AuthenticationMethod,
  EnrollPhoneParameters,
  EnrollEmailParameters,
  EnrollTOTPParameters,
  EnrollPushNotificationParameters,
  EnrollRecoveryCodeParameters,
  ConfirmOTPEnrollmentParameters,
  ConfirmRecoveryCodeEnrollmentParameters,
  ConfirmPushNotificationEnrollmentParameters,
  GetFactorsParameters,
  EnrollmentChallenge,
  TOTPEnrollmentChallenge,
  RecoveryCodeEnrollmentChallenge,
  Factor,
} from '../../../types';
import {
  AuthError,
  PasskeyError,
  PasskeyErrorCodes,
  MyAccountError,
} from '../../../core/models';

/**
 * Web implementation of the My Account API, backed by `@auth0/auth0-spa-js`.
 *
 * Each call builds a spa-js `MyAccountApiClient` whose fetcher is configured to
 * use the caller-supplied `accessToken` verbatim (via a `getAccessToken`
 * override), giving parity with the native platforms where the caller owns the
 * token. When the client is configured with DPoP, spa-js attaches a DPoP proof
 * signed with its own keypair — so DPoP My Account calls only succeed when the
 * passed token was issued by this same spa-js client. Bearer tokens always work.
 */
export class WebMyAccountClient implements MyAccountClient {
  private readonly spaClient: Auth0Client;
  private readonly apiBase: string;
  private readonly useDPoP: boolean;

  constructor(spaClient: Auth0Client, domain: string, useDPoP: boolean) {
    this.spaClient = spaClient;
    this.apiBase = `https://${domain}/me/`;
    this.useDPoP = useDPoP;
  }

  // A fresh client is built per call because each RN method carries its own
  // `accessToken` (parity with native, where the caller owns the token). The
  // fetcher's `getAccessToken` closes over that token, so it must be
  // re-instantiated for each call; reusing a single client would require
  // mutable token state and risk interleaving concurrent calls. `createFetcher`
  // does no I/O, so the per-call cost is negligible.
  private makeClient(accessToken: string): MyAccountApiClient {
    const fetcher = this.spaClient.createFetcher<Response>({
      getAccessToken: async () => accessToken,
      baseUrl: this.apiBase,
      ...(this.useDPoP && { dpopNonceId: '__auth0_my_account_api__' }),
    });
    return new MyAccountApiClient(fetcher, this.apiBase);
  }

  private locationFor(id: string): string {
    return `${this.apiBase}v1/authentication-methods/${encodeURIComponent(id)}`;
  }

  private async run<T>(
    fn: () => Promise<T>,
    wrap: (e: AuthError) => Error
  ): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof MyAccountApiError) {
        const authError = new AuthError(
          e.type || 'my_account_error',
          JSON.stringify({
            type: e.type,
            title: e.title,
            detail: e.detail,
            statusCode: e.status,
          }),
          { status: e.status, code: e.type, json: e.validation_errors }
        );
        throw wrap(authError);
      }
      throw e;
    }
  }

  private mapAuthenticationMethod(
    m: SpaAuthenticationMethod
  ): AuthenticationMethod {
    const raw = m as Record<string, any>;
    return {
      id: raw.id,
      type: raw.type,
      createdAt: raw.created_at,
      usage: raw.usage,
      confirmed: raw.confirmed,
      name: raw.name,
      keyId: raw.key_id,
      publicKey: raw.public_key,
      userHandle: raw.user_handle,
      credentialDeviceType: raw.credential_device_type,
      credentialBackedUp: raw.credential_backed_up,
      userAgent: raw.user_agent,
      aaguid: raw.aaguid,
      relyingPartyId: raw.relying_party_id,
      identityUserId: raw.identity_user_id,
      transports: raw.transports,
      phoneNumber: raw.phone_number,
      preferredAuthenticationMethod: raw.preferred_authentication_method,
      email: raw.email,
      lastPasswordReset: raw.last_password_reset,
    };
  }

  // --- Passkey Enrollment (uses PasskeyError) ---

  async passkeyEnrollmentChallenge(
    parameters: PasskeyEnrollmentChallengeParameters
  ): Promise<PasskeyEnrollmentChallengeResponse> {
    const { accessToken, userIdentity, connection } = parameters;
    return this.run(
      async () => {
        const options: EnrollmentChallengeOptions = {
          type: 'passkey',
          ...(connection && { connection }),
          ...(userIdentity && { identity_user_id: userIdentity }),
        };
        const res = (await this.makeClient(accessToken).enrollmentChallenge(
          options
        )) as SpaPasskeyEnrollmentChallengeResponse;
        return {
          authenticationMethodId: res.id,
          authSession: res.auth_session,
          authParamsPublicKey: res.authn_params_public_key as Record<
            string,
            any
          >,
        };
      },
      (e) => new PasskeyError(e, PasskeyErrorCodes.CHALLENGE_FAILED)
    );
  }

  async enrollPasskey(
    parameters: EnrollPasskeyParameters
  ): Promise<PasskeyAuthenticationMethod> {
    const { accessToken, authenticationMethodId, authSession, authResponse } =
      parameters;
    return this.run(
      async () => {
        let authnResponse: any;
        try {
          authnResponse = JSON.parse(authResponse);
        } catch {
          throw new PasskeyError(
            new AuthError(
              'invalid_auth_response',
              'authResponse is not valid JSON'
            ),
            PasskeyErrorCodes.EXCHANGE_FAILED
          );
        }
        const options: EnrollmentVerifyOptions = {
          type: 'passkey',
          location: this.locationFor(authenticationMethodId),
          auth_session: authSession,
          authn_response: authnResponse,
        };
        const res = (await this.makeClient(accessToken).enrollmentVerify(
          options
        )) as Record<string, any>;
        return {
          id: res.id,
          type: res.type,
          userIdentityId: res.identity_user_id,
          userAgent: res.user_agent,
          keyId: res.key_id,
          publicKey: res.public_key,
          userHandle: res.user_handle,
          credentialDeviceType: res.credential_device_type,
          credentialBackedUp: res.credential_backed_up,
          createdAt: res.created_at,
          aaguid: res.aaguid,
          relyingPartyId: res.relying_party_id,
        };
      },
      (e) => new PasskeyError(e, PasskeyErrorCodes.EXCHANGE_FAILED)
    );
  }

  // --- Factor Enrollment (uses MyAccountError) ---

  async enrollPhone(
    parameters: EnrollPhoneParameters
  ): Promise<EnrollmentChallenge> {
    const { accessToken, phoneNumber, preferredAuthenticationMethod } =
      parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentChallenge({
          type: 'phone',
          phone_number: phoneNumber,
          ...(preferredAuthenticationMethod && {
            preferred_authentication_method: preferredAuthenticationMethod,
          }),
        });
        return this.mapChallenge(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async enrollEmail(
    parameters: EnrollEmailParameters
  ): Promise<EnrollmentChallenge> {
    const { accessToken, emailAddress } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentChallenge({
          type: 'email',
          email: emailAddress,
        });
        return this.mapChallenge(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async enrollTOTP(
    parameters: EnrollTOTPParameters
  ): Promise<TOTPEnrollmentChallenge> {
    const { accessToken } = parameters;
    return this.run(
      async () => {
        const res = (await this.makeClient(accessToken).enrollmentChallenge({
          type: 'totp',
        })) as SpaTotpEnrollmentChallengeResponse;
        return {
          id: res.id,
          authSession: res.auth_session,
          barcodeUri: res.barcode_uri,
          manualInputCode: res.manual_input_code,
        };
      },
      (e) => new MyAccountError(e)
    );
  }

  async enrollPushNotification(
    parameters: EnrollPushNotificationParameters
  ): Promise<TOTPEnrollmentChallenge> {
    const { accessToken } = parameters;
    return this.run(
      async () => {
        const res = (await this.makeClient(accessToken).enrollmentChallenge({
          type: 'push-notification',
        })) as SpaPushEnrollmentChallengeResponse;
        return {
          id: res.id,
          authSession: res.auth_session,
          barcodeUri: res.barcode_uri,
          manualInputCode: res.manual_input_code,
        };
      },
      (e) => new MyAccountError(e)
    );
  }

  async enrollRecoveryCode(
    parameters: EnrollRecoveryCodeParameters
  ): Promise<RecoveryCodeEnrollmentChallenge> {
    const { accessToken } = parameters;
    return this.run(
      async () => {
        const res = (await this.makeClient(accessToken).enrollmentChallenge({
          type: 'recovery-code',
        })) as SpaRecoveryCodeEnrollmentChallengeResponse;
        return {
          id: res.id,
          authSession: res.auth_session,
          recoveryCode: res.recovery_code,
        };
      },
      (e) => new MyAccountError(e)
    );
  }

  private mapChallenge(
    res: SpaEnrollmentChallengeResponse
  ): EnrollmentChallenge {
    return { id: res.id, authSession: res.auth_session };
  }

  // --- Enrollment Confirmation (uses MyAccountError) ---

  async confirmPhoneEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentVerify({
          type: 'phone',
          location: this.locationFor(id),
          auth_session: authSession,
          otp_code: otpCode,
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async confirmEmailEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentVerify({
          type: 'email',
          location: this.locationFor(id),
          auth_session: authSession,
          otp_code: otpCode,
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async confirmTOTPEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentVerify({
          type: 'totp',
          location: this.locationFor(id),
          auth_session: authSession,
          otp_code: otpCode,
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async confirmPushNotificationEnrollment(
    parameters: ConfirmPushNotificationEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentVerify({
          type: 'push-notification',
          location: this.locationFor(id),
          auth_session: authSession,
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async confirmRecoveryCodeEnrollment(
    parameters: ConfirmRecoveryCodeEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).enrollmentVerify({
          type: 'recovery-code',
          location: this.locationFor(id),
          auth_session: authSession,
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  // --- Authentication Method Management (uses MyAccountError) ---

  async getAuthenticationMethods(
    parameters: GetAuthenticationMethodsParameters
  ): Promise<AuthenticationMethod[]> {
    const { accessToken, type } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).getAuthenticationMethods(
          type || undefined
        );
        return res.map((m) => this.mapAuthenticationMethod(m));
      },
      (e) => new MyAccountError(e)
    );
  }

  async getAuthenticationMethodById(
    parameters: GetAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id } = parameters;
    return this.run(
      async () => {
        const res =
          await this.makeClient(accessToken).getAuthenticationMethod(id);
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async updateAuthenticationMethodById(
    parameters: UpdateAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, name, preferredAuthenticationMethod } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(
          accessToken
        ).updateAuthenticationMethod(id, {
          ...(name !== undefined && { name }),
          ...(preferredAuthenticationMethod !== undefined && {
            preferred_authentication_method: preferredAuthenticationMethod,
          }),
        });
        return this.mapAuthenticationMethod(res);
      },
      (e) => new MyAccountError(e)
    );
  }

  async deleteAuthenticationMethodById(
    parameters: DeleteAuthenticationMethodByIdParameters
  ): Promise<void> {
    const { accessToken, id } = parameters;
    return this.run(
      async () => {
        await this.makeClient(accessToken).deleteAuthenticationMethod(id);
      },
      (e) => new MyAccountError(e)
    );
  }

  // --- Factors (uses MyAccountError) ---

  async getFactors(parameters: GetFactorsParameters): Promise<Factor[]> {
    const { accessToken } = parameters;
    return this.run(
      async () => {
        const res = await this.makeClient(accessToken).getFactors();
        return res.map((f: SpaFactor) => ({ type: f.type, usage: f.usage }));
      },
      (e) => new MyAccountError(e)
    );
  }
}
