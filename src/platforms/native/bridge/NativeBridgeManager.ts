import type { INativeBridge } from './INativeBridge';
import type {
  ApiCredentials,
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  NativeClearSessionOptions,
  DPoPHeadersParams,
  SessionTransferCredentials,
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
  PasskeyChallengeResponse,
} from '../../../types';
import {
  SafariViewControllerPresentationStyle,
  type LocalAuthenticationOptions,
  type NativeAuthorizeOptions,
} from '../../../types/platform-specific';
import {
  AuthError,
  Credentials as CredentialsModel,
} from '../../../core/models';
import Auth0NativeModule from '../../../specs/NativeA0Auth0';
import type { NativeModuleError } from '../../../core/interfaces';

/**
 * Manages the direct communication with the native Auth0 module.
 * It implements the INativeBridge interface and is responsible for:
 * - Calling the actual native methods.
 *-  Normalizing data and parameters between JS and Native.
 * - Catching native errors and re-throwing them as structured AuthError objects.
 */
export class NativeBridgeManager implements INativeBridge {
  private async a0_call<T>(
    nativeMethod: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    try {
      return await nativeMethod(...args);
    } catch (e) {
      const { code, message } = e as NativeModuleError;
      throw new AuthError(code, message, { code, json: e });
    }
  }

  async hasValidInstance(clientId: string, domain: string): Promise<boolean> {
    return this.a0_call(
      Auth0NativeModule.hasValidAuth0InstanceWithConfiguration.bind(
        Auth0NativeModule
      ),
      clientId,
      domain
    );
  }

  async initialize(
    clientId: string,
    domain: string,
    localAuthenticationOptions?: LocalAuthenticationOptions,
    useDPoP: boolean = true,
    maxRetries: number = 0,
    credentialsManagerStorageKey?: string
  ): Promise<void> {
    // This is a new method we'd add to the native side to ensure the
    // underlying Auth0.swift/Auth0.android SDKs are configured.
    return this.a0_call(
      Auth0NativeModule.initializeAuth0WithConfiguration.bind(
        Auth0NativeModule
      ),
      clientId,
      domain,
      localAuthenticationOptions,
      useDPoP,
      maxRetries,
      credentialsManagerStorageKey
    );
  }

  getBundleIdentifier(): Promise<string> {
    return this.a0_call(
      Auth0NativeModule.getBundleIdentifier.bind(Auth0NativeModule)
    );
  }

  async authorize(
    parameters: WebAuthorizeParameters,
    options: NativeAuthorizeOptions
  ): Promise<Credentials> {
    let presentationStyle = options.useSFSafariViewController
      ? ((options.useSFSafariViewController as { presentationStyle: number })
          ?.presentationStyle ??
        SafariViewControllerPresentationStyle.fullScreen)
      : undefined;
    const scheme =
      parameters.redirectUrl?.split('://')[0] ?? options.customScheme;
    const credential = await this.a0_call(
      Auth0NativeModule.webAuth.bind(Auth0NativeModule),
      scheme,
      parameters.redirectUrl,
      parameters.state,
      parameters.nonce,
      parameters.audience,
      parameters.scope,
      parameters.connection,
      parameters.maxAge ?? 0,
      parameters.organization,
      parameters.invitationUrl,
      options.leeway ?? 0,
      options.ephemeralSession ?? false,
      presentationStyle ?? 99, // Since we can't pass null to the native layer, and we need a value to represent this parameter is not set, we are using 99.
      // //The native layer will check for this and ignore if the value is 99
      parameters.additionalParameters ?? {},
      options.allowedBrowserPackages,
      options.useTrustedWebActivity ?? false
    );
    return new CredentialsModel(credential);
  }

  async clearSession(
    parameters: ClearSessionParameters,
    options: NativeClearSessionOptions
  ): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.webAuthLogout.bind(Auth0NativeModule),
      options.customScheme,
      parameters.federated ?? false,
      parameters.returnToUrl,
      options.allowedBrowserPackages,
      options.useTrustedWebActivity ?? false
    );
  }

  async cancelWebAuth(): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.cancelWebAuth.bind(Auth0NativeModule)
    );
  }

  async resumeSession(): Promise<Credentials | null> {
    const credential = await this.a0_call(
      Auth0NativeModule.resumeWebAuthSession.bind(Auth0NativeModule)
    );
    return credential ? new CredentialsModel(credential) : null;
  }

  async saveCredentials(credentials: Credentials): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.saveCredentials.bind(Auth0NativeModule),
      credentials
    );
  }

  async getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    // Assuming the native side can take an empty object for parameters.
    const params = parameters ?? {};
    return this.a0_call(
      Auth0NativeModule.getCredentials.bind(Auth0NativeModule),
      scope,
      minTtl ?? 0,
      params,
      forceRefresh ?? false
    );
  }

  getApiCredentials(
    audience: string,
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials> {
    const params = parameters ?? {};
    return this.a0_call(
      Auth0NativeModule.getApiCredentials.bind(Auth0NativeModule),
      audience,
      scope,
      minTtl ?? 0,
      params
    );
  }

  clearApiCredentials(audience: string, scope?: string): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.clearApiCredentials.bind(Auth0NativeModule),
      audience,
      scope
    );
  }

  async hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.a0_call(
      Auth0NativeModule.hasValidCredentials.bind(Auth0NativeModule),
      minTtl ?? 0
    );
  }

  async clearCredentials(): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.clearCredentials.bind(Auth0NativeModule)
    );
  }

  async resumeWebAuth(url: string): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.resumeWebAuth.bind(Auth0NativeModule),
      url
    );
  }

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    return this.a0_call(
      Auth0NativeModule.getDPoPHeaders.bind(Auth0NativeModule),
      params.url,
      params.method,
      params.accessToken,
      params.tokenType,
      params.nonce
    );
  }

  async clearDPoPKey(): Promise<void> {
    return this.a0_call(Auth0NativeModule.clearDPoPKey.bind(Auth0NativeModule));
  }

  async getSSOCredentials(
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<SessionTransferCredentials> {
    const params = parameters ?? {};
    const hdrs = headers ?? {};
    return this.a0_call(
      Auth0NativeModule.getSSOCredentials.bind(Auth0NativeModule),
      params,
      hdrs
    );
  }

  async customTokenExchange(
    subjectToken: string,
    subjectTokenType: string,
    audience?: string,
    scope?: string,
    organization?: string,
    actorToken?: string,
    actorTokenType?: string
  ): Promise<Credentials> {
    try {
      const credential = await this.a0_call(
        Auth0NativeModule.customTokenExchange.bind(Auth0NativeModule),
        subjectToken,
        subjectTokenType,
        audience,
        scope,
        organization,
        actorToken,
        actorTokenType
      );
      return new CredentialsModel(credential);
    } catch (e) {
      // Convert to AuthError if needed, then throw directly
      throw new AuthError(
        e instanceof AuthError ? e.code : 'custom_token_exchange_failed',
        e instanceof Error ? e.message : String(e),
        { code: 'custom_token_exchange_failed', json: e }
      );
    }
  }

  async getMfaAuthenticators(
    mfaToken: string,
    factorsAllowed?: string[]
  ): Promise<MfaAuthenticator[]> {
    return this.a0_call(
      Auth0NativeModule.getMfaAuthenticators.bind(Auth0NativeModule),
      mfaToken,
      factorsAllowed
    ) as Promise<MfaAuthenticator[]>;
  }

  async mfaEnroll(
    mfaToken: string,
    type: string,
    value?: string
  ): Promise<MfaEnrollmentChallenge> {
    return this.a0_call(
      Auth0NativeModule.mfaEnroll.bind(Auth0NativeModule),
      mfaToken,
      type,
      value
    ) as Promise<MfaEnrollmentChallenge>;
  }

  async mfaChallenge(
    mfaToken: string,
    authenticatorId: string
  ): Promise<MfaChallengeResult> {
    return this.a0_call(
      Auth0NativeModule.mfaChallenge.bind(Auth0NativeModule),
      mfaToken,
      authenticatorId
    ) as Promise<MfaChallengeResult>;
  }

  async mfaVerify(
    mfaToken: string,
    type: string,
    code: string,
    bindingCode?: string,
    scope?: string,
    audience?: string
  ): Promise<Credentials> {
    const credential = await this.a0_call(
      Auth0NativeModule.mfaVerify.bind(Auth0NativeModule),
      mfaToken,
      type,
      code,
      bindingCode,
      scope,
      audience
    );
    return new CredentialsModel(credential);
  }

  async passkeySignupChallenge(
    email?: string,
    phoneNumber?: string,
    username?: string,
    name?: string,
    givenName?: string,
    familyName?: string,
    nickname?: string,
    picture?: string,
    userMetadata?: Record<string, string>,
    realm?: string,
    organization?: string
  ): Promise<PasskeyChallengeResponse> {
    return this.a0_call(
      Auth0NativeModule.passkeySignupChallenge.bind(Auth0NativeModule),
      email,
      phoneNumber,
      username,
      name,
      givenName,
      familyName,
      nickname,
      picture,
      userMetadata,
      realm,
      organization
    );
  }

  async passkeyLoginChallenge(
    realm?: string,
    organization?: string
  ): Promise<PasskeyChallengeResponse> {
    return this.a0_call(
      Auth0NativeModule.passkeyLoginChallenge.bind(Auth0NativeModule),
      realm,
      organization
    );
  }

  async getTokenByPasskey(
    authSession: string,
    authResponse: string,
    realm?: string,
    audience?: string,
    scope?: string,
    organization?: string
  ): Promise<Credentials> {
    const credential = await this.a0_call(
      Auth0NativeModule.getTokenByPasskey.bind(Auth0NativeModule),
      authSession,
      authResponse,
      realm,
      audience,
      scope,
      organization
    );
    return new CredentialsModel(credential);
  }

  async passwordlessChallengeWithEmail(
    email: string,
    connection: string,
    allowSignup: boolean
  ): Promise<{ authSession: string }> {
    return this.a0_call(
      Auth0NativeModule.passwordlessChallengeWithEmail.bind(Auth0NativeModule),
      email,
      connection,
      allowSignup
    );
  }

  async passwordlessChallengeWithPhoneNumber(
    phoneNumber: string,
    connection: string,
    deliveryMethod: string,
    allowSignup: boolean
  ): Promise<{ authSession: string }> {
    return this.a0_call(
      Auth0NativeModule.passwordlessChallengeWithPhoneNumber.bind(
        Auth0NativeModule
      ),
      phoneNumber,
      connection,
      deliveryMethod,
      allowSignup
    );
  }

  async passwordlessLoginWithOTP(
    authSession: string,
    otp: string,
    audience?: string,
    scope?: string
  ): Promise<Credentials> {
    const credential = await this.a0_call(
      Auth0NativeModule.passwordlessLoginWithOTP.bind(Auth0NativeModule),
      authSession,
      otp,
      audience,
      scope
    );
    return new CredentialsModel(credential);
  }

  async passkeyEnrollmentChallenge(
    accessToken: string,
    userIdentity?: string,
    connection?: string
  ): Promise<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Record<string, any>;
  }> {
    return this.a0_call(
      Auth0NativeModule.passkeyEnrollmentChallenge.bind(Auth0NativeModule),
      accessToken,
      userIdentity,
      connection
    );
  }

  async enrollPasskey(
    accessToken: string,
    authenticationMethodId: string,
    authSession: string,
    authResponse: string,
    authParamsPublicKey: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollPasskey.bind(Auth0NativeModule),
      accessToken,
      authenticationMethodId,
      authSession,
      authResponse,
      authParamsPublicKey
    );
  }

  async getAuthenticationMethods(
    accessToken: string,
    type?: string
  ): Promise<Record<string, any>[]> {
    return this.a0_call(
      Auth0NativeModule.getAuthenticationMethods.bind(Auth0NativeModule),
      accessToken,
      type
    );
  }

  async getAuthenticationMethodById(
    accessToken: string,
    id: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.getAuthenticationMethodById.bind(Auth0NativeModule),
      accessToken,
      id
    );
  }

  async updateAuthenticationMethodById(
    accessToken: string,
    id: string,
    name?: string | null,
    preferredAuthenticationMethod?: string | null
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.updateAuthenticationMethodById.bind(Auth0NativeModule),
      accessToken,
      id,
      name,
      preferredAuthenticationMethod
    );
  }

  async deleteAuthenticationMethodById(
    accessToken: string,
    id: string
  ): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.deleteAuthenticationMethodById.bind(Auth0NativeModule),
      accessToken,
      id
    );
  }

  async enrollPhone(
    accessToken: string,
    phoneNumber: string,
    preferredAuthenticationMethod?: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollPhone.bind(Auth0NativeModule),
      accessToken,
      phoneNumber,
      preferredAuthenticationMethod
    );
  }

  async enrollEmail(
    accessToken: string,
    emailAddress: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollEmail.bind(Auth0NativeModule),
      accessToken,
      emailAddress
    );
  }

  async enrollTOTP(accessToken: string): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollTOTP.bind(Auth0NativeModule),
      accessToken
    );
  }

  async enrollPushNotification(
    accessToken: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollPushNotification.bind(Auth0NativeModule),
      accessToken
    );
  }

  async enrollRecoveryCode(accessToken: string): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.enrollRecoveryCode.bind(Auth0NativeModule),
      accessToken
    );
  }

  async confirmEnrollmentWithOtp(
    accessToken: string,
    id: string,
    authSession: string,
    otpCode: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.confirmEnrollmentWithOtp.bind(Auth0NativeModule),
      accessToken,
      id,
      authSession,
      otpCode
    );
  }

  async confirmEnrollment(
    accessToken: string,
    id: string,
    authSession: string
  ): Promise<Record<string, any>> {
    return this.a0_call(
      Auth0NativeModule.confirmEnrollment.bind(Auth0NativeModule),
      accessToken,
      id,
      authSession
    );
  }

  async getFactors(accessToken: string): Promise<Record<string, any>[]> {
    return this.a0_call(
      Auth0NativeModule.getFactors.bind(Auth0NativeModule),
      accessToken
    );
  }
}
