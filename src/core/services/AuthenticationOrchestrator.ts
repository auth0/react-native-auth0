import type { IAuthenticationProvider } from '../interfaces';
import type {
  Credentials,
  User,
  MfaChallengeResponse,
  PasswordRealmParameters,
  RefreshTokenParameters,
  UserInfoParameters,
  RevokeOptions,
  ExchangeParameters,
  ExchangeNativeSocialParameters,
  PasswordlessEmailParameters,
  PasswordlessSmsParameters,
  LoginEmailParameters,
  LoginSmsParameters,
  LoginOtpParameters,
  LoginOobParameters,
  LoginRecoveryCodeParameters,
  MfaChallengeParameters,
  ResetPasswordParameters,
  CreateUserParameters,
  NativeCredentialsResponse,
  AuthorizeUrlParameters,
  LogoutUrlParameters,
} from '../../types';
import {
  Credentials as CredentialsModel,
  Auth0User,
  AuthError,
} from '../models';
import { validateParameters } from '../utils/validation';
import {
  HttpClient,
  getBearerHeader,
  type DPoPHeadersProvider,
} from './HttpClient';
import { TokenType } from '../../types/common';
import { deepCamelCase } from '../utils';

// Represents the raw user profile returned by an API (snake_case)
type RawUser = { [key: string]: any };

/**
 * Ensures the 'openid' scope is included in the scope string.
 * This is required for receiving an ID token in the response.
 * Follows the same pattern as Auth0.Android and Auth0.Swift SDKs.
 *
 * When no scope is provided, defaults to 'openid profile email' to match
 * the behavior of other Auth0 SDKs and provide a complete user profile.
 *
 * @param scope - The original scope string (optional)
 * @returns A scope string that includes 'openid'
 */
function includeRequiredScope(scope?: string): string {
  if (!scope) {
    return 'openid profile email';
  }

  const scopes = scope.split(' ');
  if (!scopes.includes('openid')) {
    return `openid ${scope}`;
  }

  return scope;
}

/**
 * Orchestrates all direct authentication flows by making calls to the Auth0 Authentication API.
 * This class is platform-agnostic and relies on an injected HttpClient.
 */
export class AuthenticationOrchestrator implements IAuthenticationProvider {
  private readonly client: HttpClient;
  private readonly clientId: string;
  private readonly tokenType: TokenType;
  private readonly baseUrl: string;
  private readonly getDPoPHeaders?: DPoPHeadersProvider;

  constructor(options: {
    clientId: string;
    httpClient: HttpClient;
    tokenType?: TokenType;
    baseUrl?: string;
    getDPoPHeaders?: DPoPHeadersProvider;
  }) {
    this.clientId = options.clientId;
    this.client = options.httpClient;
    this.tokenType = options.tokenType ?? TokenType.bearer;
    this.baseUrl = options.baseUrl ?? '';
    this.getDPoPHeaders = options.getDPoPHeaders;
  }

  authorizeUrl(parameters: AuthorizeUrlParameters): string {
    validateParameters(parameters, ['responseType', 'redirectUri', 'state']);

    const query = {
      ...parameters,
      client_id: this.clientId,
      redirect_uri: parameters.redirectUri,
    };

    return this.client.buildUrl('/authorize', query);
  }

  logoutUrl(parameters: LogoutUrlParameters = {}): string {
    const { returnToUrl, ...restParams } = parameters;

    const query = {
      ...restParams,
      client_id: this.clientId,
    };

    if (returnToUrl) {
      query.returnTo = returnToUrl;
    }

    return this.client.buildUrl('/v2/logout', query);
  }

  async exchange(parameters: ExchangeParameters): Promise<Credentials> {
    validateParameters(parameters, ['code', 'verifier', 'redirectUri']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code_verifier: payload.verifier,
      code: payload.code,
      redirect_uri: payload.redirectUri,
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async exchangeNativeSocial(
    parameters: ExchangeNativeSocialParameters
  ): Promise<Credentials> {
    validateParameters(parameters, ['subjectToken', 'subjectTokenType']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: this.clientId,
      subject_token: payload.subjectToken,
      subject_token_type: payload.subjectTokenType,
      user_profile: payload.userProfile,
      audience: payload.audience,
      scope: includeRequiredScope(payload.scope),
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async passwordRealm(
    parameters: PasswordRealmParameters
  ): Promise<Credentials> {
    validateParameters(parameters, ['username', 'password', 'realm']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      client_id: this.clientId,
      username: payload.username,
      password: payload.password,
      realm: payload.realm,
      audience: payload.audience,
      scope: includeRequiredScope(payload.scope),
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async refreshToken(parameters: RefreshTokenParameters): Promise<Credentials> {
    validateParameters(parameters, ['refreshToken']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: payload.refreshToken,
      scope: includeRequiredScope(payload.scope),
      audience: payload.audience,
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async passwordlessWithEmail(
    parameters: PasswordlessEmailParameters
  ): Promise<void> {
    validateParameters(parameters, ['email']);
    const { headers, ...payload } = parameters;
    const body = {
      client_id: this.clientId,
      connection: 'email',
      email: payload.email,
      send: payload.send,
      authParams: payload.authParams,
    };
    const { json, response } = await this.client.post<void>(
      '/passwordless/start',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
  }

  async passwordlessWithSMS(
    parameters: PasswordlessSmsParameters
  ): Promise<void> {
    validateParameters(parameters, ['phoneNumber']);
    const { headers, ...payload } = parameters;
    const body = {
      client_id: this.clientId,
      connection: 'sms',
      phone_number: payload.phoneNumber,
      send: payload.send,
      authParams: payload.authParams,
    };
    const { json, response } = await this.client.post<void>(
      '/passwordless/start',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
  }

  async loginWithEmail(parameters: LoginEmailParameters): Promise<Credentials> {
    validateParameters(parameters, ['email', 'code']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      client_id: this.clientId,
      username: payload.email,
      otp: payload.code,
      realm: 'email',
      audience: payload.audience,
      scope: includeRequiredScope(payload.scope),
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async loginWithSMS(parameters: LoginSmsParameters): Promise<Credentials> {
    validateParameters(parameters, ['phoneNumber', 'code']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      client_id: this.clientId,
      username: payload.phoneNumber,
      otp: payload.code,
      realm: 'sms',
      audience: payload.audience,
      scope: includeRequiredScope(payload.scope),
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async loginWithOTP(parameters: LoginOtpParameters): Promise<Credentials> {
    validateParameters(parameters, ['mfaToken', 'otp']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/mfa-otp',
      client_id: this.clientId,
      mfa_token: payload.mfaToken,
      otp: payload.otp,
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async loginWithOOB(parameters: LoginOobParameters): Promise<Credentials> {
    validateParameters(parameters, ['mfaToken', 'oobCode']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
      client_id: this.clientId,
      mfa_token: payload.mfaToken,
      oob_code: payload.oobCode,
      binding_code: payload.bindingCode,
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async loginWithRecoveryCode(
    parameters: LoginRecoveryCodeParameters
  ): Promise<Credentials> {
    validateParameters(parameters, ['mfaToken', 'recoveryCode']);
    const { headers, ...payload } = parameters;
    const body = {
      grant_type: 'http://auth0.com/oauth/grant-type/mfa-recovery-code',
      client_id: this.clientId,
      mfa_token: payload.mfaToken,
      recovery_code: payload.recoveryCode,
    };
    const { json, response } =
      await this.client.post<NativeCredentialsResponse>(
        '/oauth/token',
        body,
        headers
      );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    return CredentialsModel.fromResponse(json);
  }

  async multifactorChallenge(
    parameters: MfaChallengeParameters
  ): Promise<MfaChallengeResponse> {
    validateParameters(parameters, ['mfaToken']);
    const { headers, ...payload } = parameters;
    const body = {
      client_id: this.clientId,
      mfa_token: payload.mfaToken,
      challenge_type: payload.challengeType,
      authenticator_id: payload.authenticatorId,
    };
    const { json, response } = await this.client.post<any>(
      '/mfa/challenge',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    // The response is already camelCased by the API, so we can cast it directly.
    return json as MfaChallengeResponse;
  }

  async revoke(parameters: RevokeOptions): Promise<void> {
    validateParameters(parameters, ['refreshToken']);
    const { headers, ...payload } = parameters;
    const body = {
      client_id: this.clientId,
      token: payload.refreshToken,
    };
    const { json, response } = await this.client.post<void>(
      '/oauth/revoke',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
  }

  async userInfo(parameters: UserInfoParameters): Promise<User> {
    const { token, tokenType: paramTokenType, headers } = parameters;

    // Use parameter tokenType if provided, otherwise use client's default
    const effectiveTokenType = paramTokenType ?? this.tokenType;

    let authHeader: Record<string, string>;

    // For DPoP tokens, we need to generate a DPoP proof using the native layer
    if (effectiveTokenType === TokenType.dpop && this.getDPoPHeaders) {
      const userInfoUrl = `${this.baseUrl}/userinfo`;
      authHeader = await this.getDPoPHeaders({
        url: userInfoUrl,
        method: 'GET',
        accessToken: token,
        tokenType: TokenType.dpop,
      });
    } else {
      authHeader = getBearerHeader(token);
    }

    const requestHeaders = { ...authHeader, ...headers };
    const { json, response } = await this.client.get<RawUser>(
      '/userinfo',
      undefined,
      requestHeaders
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    // The /userinfo endpoint returns snake_case claims. We must convert them.
    const camelCasedProfile = deepCamelCase<User>(json);
    return new Auth0User(camelCasedProfile);
  }

  async resetPassword(parameters: ResetPasswordParameters): Promise<void> {
    const { headers, ...payload } = parameters;
    const body: {
      client_id: string;
      email: string;
      connection: string;
      organization?: string;
    } = {
      client_id: this.clientId,
      email: payload.email,
      connection: payload.connection,
    };
    if (payload.organization) {
      body.organization = payload.organization;
    }
    const { json, response } = await this.client.post<void>(
      '/dbconnections/change_password',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
  }

  async createUser(parameters: CreateUserParameters): Promise<Partial<User>> {
    validateParameters(parameters, ['email', 'password', 'connection']);
    const { headers, metadata, ...payload } = parameters;
    const body = {
      client_id: this.clientId,
      ...payload,
      user_metadata: metadata,
    };
    const { json, response } = await this.client.post<RawUser>(
      '/dbconnections/signup',
      body,
      headers
    );
    if (!response.ok) throw AuthError.fromResponse(response, json);
    // The signup endpoint returns a snake_cased user profile.
    return deepCamelCase<Partial<User>>(json);
  }
}
