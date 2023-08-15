import Client, { Auth0Response } from '../networking';
import { apply } from '../utils/whitelist';
import { toCamelCase } from '../utils/camel';
import AuthError from './authError';
import Auth0Error from './auth0Error';
import { Telemetry } from '../networking/telemetry';
import { convertExpiresInToExpiresAt } from '../utils/timestampConversion'
import {
  AuthorizeUrlOptions,
  CreateUserOptions,
  Credentials,
  ExchangeNativeSocialOptions,
  ExchangeOptions,
  LoginWithEmailOptions,
  LoginWithOOBOptions,
  LoginWithOTPOptions,
  LoginWithRecoveryCodeOptions,
  LoginWithSMSOptions,
  LogoutUrlOptions,
  MultifactorChallengeOptions,
  MultifactorChallengeResponse,
  PasswordRealmOptions,
  PasswordlessWithEmailOptions,
  PasswordlessWithSMSOptions,
  RefreshTokenOptions,
  ResetPasswordOptions,
  RevokeOptions,
  User,
  UserInfoOptions,
} from '../types';
import {
  CredentialsResponse,
  RawCredentials,
  RawMultifactorChallengeResponse,
  RawUser,
} from '../internal-types';

function responseHandler<TRawResult = unknown, TResult = unknown>(
  response: Auth0Response<TRawResult>,
  exceptions = {}
) {
  if (response.ok && response.json) {
    return toCamelCase(response.json, exceptions) as TResult;
  }
  throw new AuthError(response);
}

function convertTimestampInCredentials(rawCredentials: RawCredentials): Credentials {
  let expiresAt = convertExpiresInToExpiresAt(rawCredentials.expiresIn)
  if(!expiresAt) {
    throw Error('invalid expiry value found')
  }
  const { expiresIn, ...credentials } = rawCredentials
  return {...credentials, expiresAt}
}

/**
 * Class for interfacing with the Auth0 Authentication API endpoints.
 *
 * @see https://auth0.com/docs/api/authentication
 */
class Auth {
  private client: Client;
  /**
   * The Auth0 client ID
   */
  public readonly clientId: string;
  /**
   * The Auth0 tenant domain
   */
  public readonly domain: string;

  /**
   * @ignore
   */
  constructor(options: {
    baseUrl: string;
    clientId: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  }) {
    this.client = new Client(options);
    this.domain = this.client.domain;

    const { clientId } = options;

    if (!clientId) {
      throw new Error('Missing clientId in parameters');
    }

    this.clientId = clientId;
  }

  /**
   * Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @returns A URL to the authorize endpoint with specified parameters to redirect to for AuthZ/AuthN.
   * @see https://auth0.com/docs/api/authentication#authorize-client
   */
  authorizeUrl(parameters: AuthorizeUrlOptions): string {
    const query = apply(
      {
        parameters: {
          redirectUri: { required: true, toName: 'redirect_uri' },
          responseType: { required: true, toName: 'response_type' },
          state: { required: true },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client.url(
      '/authorize',
      { ...query, client_id: this.clientId },
      true
    );
  }

  /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @returns A URL to the logout endpoint with specified parameters
   * @see https://auth0.com/docs/api/authentication#logout
   */
  logoutUrl(parameters: LogoutUrlOptions): string {
    const query = apply(
      {
        parameters: {
          federated: { required: false },
          clientId: { required: false, toName: 'client_id' },
          returnTo: { required: false },
        },
      },
      parameters
    );
    return this.client.url('/v2/logout', { ...query }, true);
  }

  /**
   * Exchanges a code obtained via `/authorize` (w/PKCE) for the user's tokens
   *
   * @returns A prominse for a populated instance of {@link Credentials}.
   * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
   */
  exchange(parameters: ExchangeOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          code: { required: true },
          verifier: { required: true, toName: 'code_verifier' },
          redirectUri: { required: true, toName: 'redirect_uri' },
        },
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'authorization_code',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Exchanges an external token obtained via a native social authentication solution for the user's tokens
   *
   * @returns A populated instance of {@link Credentials}.
   * @see https://auth0.com/docs/api/authentication#token-exchange-for-native-social
   */
  exchangeNativeSocial(
    parameters: ExchangeNativeSocialOptions
  ): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          subjectToken: { required: true, toName: 'subject_token' },
          subjectTokenType: { required: true, toName: 'subject_token_type' },
          userProfile: { required: false, toName: 'user_profile' },
          audience: { required: false },
          scope: { required: false },
        },
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      })
      .then((response) => {
        return convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      });
  }

  /**
   * Performs Auth with user credentials using the Password Realm Grant
   *
   * @returns A populated instance of {@link Credentials}.
   * @see https://auth0.com/docs/api-auth/grant/password#realm-support
   */
  passwordRealm(parameters: PasswordRealmOptions): Promise<Credentials> {
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...parameters,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @returns A populated instance of {@link Credentials}.
   * @see https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
   */
  refreshToken(parameters: RefreshTokenOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          refreshToken: { required: true, toName: 'refresh_token' },
          scope: { required: false },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'refresh_token',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Starts the Passworldess flow with an email connection.
   *
   * This should be completed later using a call to {@link loginWithEmail}, passing the OTP that was sent to the user.
   */
  passwordlessWithEmail(
    parameters: PasswordlessWithEmailOptions
  ): Promise<void> {
    return this.client
      .post<void>('/passwordless/start', {
        ...parameters,
        connection: 'email',
        client_id: this.clientId,
      })
      .then((response) => responseHandler<void, void>(response));
  }

  /**
   * Starts the Passwordless flow with an SMS connection.
   *
   * This should be completed later using a call to {@link loginWithSMS}, passing the OTP that was sent to the user.
   */
  passwordlessWithSMS(parameters: PasswordlessWithSMSOptions): Promise<void> {
    const payload = apply(
      {
        parameters: {
          phoneNumber: { required: true, toName: 'phone_number' },
          send: { required: false },
          authParams: { required: false },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client
      .post<void>('/passwordless/start', {
        ...payload,
        connection: 'sms',
        client_id: this.clientId,
      })
      .then((response) => responseHandler<void, void>(response));
  }

  /**
   * Completes the Passworldess authentication with an email connection that was started using {@link passwordlessWithEmail}.
   *
   * @returns A populated instance of {@link Credentials}.
   */
  loginWithEmail(parameters: LoginWithEmailOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          email: { required: true, toName: 'username' },
          code: { required: true, toName: 'otp' },
          audience: { required: false },
          scope: { required: false },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        realm: 'email',
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Completes the Passworldess authentication with an SMS connection that was started using {@link passwordlessWithSMS}.
   *
   * @returns A populated instance of {@link Credentials}.
   */
  loginWithSMS(parameters: LoginWithSMSOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          phoneNumber: { required: true, toName: 'username' },
          code: { required: true, toName: 'otp' },
          audience: { required: false },
          scope: { required: false },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        realm: 'sms',
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Log in a user using the One Time Password code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA OTP** Grant Type enabled.
   * See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @returns A populated instance of {@link Credentials}.
   */
  loginWithOTP(parameters: LoginWithOTPOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: { required: true, toName: 'mfa_token' },
          otp: { required: true, toName: 'otp' },
        },
        whitelist: false,
      },
      parameters
    );
    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-otp',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Log in a user using an Out Of Band authentication code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA OOB** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @returns A populated instance of {@link Credentials}.
   */

  loginWithOOB(parameters: LoginWithOOBOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: { required: true, toName: 'mfa_token' },
          oobCode: { required: true, toName: 'oob_code' },
          bindingCode: { required: false, toName: 'binding_code' },
        },
        whitelist: false,
      },
      parameters
    );

    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Log in a user using a multi-factor authentication Recovery Code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @returns A populated instance of {@link Credentials}.
   */
  loginWithRecoveryCode(
    parameters: LoginWithRecoveryCodeOptions
  ): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: { required: true, toName: 'mfa_token' },
          recoveryCode: { required: true, toName: 'recovery_code' },
        },
        whitelist: false,
      },
      parameters
    );

    return this.client
      .post<CredentialsResponse>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-recovery-code',
      })
      .then((response) =>
        convertTimestampInCredentials(responseHandler<CredentialsResponse, RawCredentials>(response))
      );
  }

  /**
   * Request a challenge for multi-factor authentication (MFA) based on the challenge types supported by the application and user.
   * The challenge type is how the user will get the challenge and prove possession. Supported challenge types include: "otp" and "oob".
   *
   * @returns {@link MultifactorChallengeOTPResponse}, {@link MultifactorChallengeOOBResponse}, or {@link MultifactorChallengeOOBWithBindingResponse} depending
   * on the challenge type.
   */
  multifactorChallenge(
    parameters: MultifactorChallengeOptions
  ): Promise<MultifactorChallengeResponse> {
    const payload = apply(
      {
        parameters: {
          mfaToken: { required: true, toName: 'mfa_token' },
          challengeType: { required: false, toName: 'challenge_type' },
          authenticatorId: { required: false, toName: 'authenticator_id' },
        },
      },
      parameters
    );
    return this.client
      .post<RawMultifactorChallengeResponse>('/mfa/challenge', {
        ...payload,
        client_id: this.clientId,
      })
      .then((response) =>
        responseHandler<
          RawMultifactorChallengeResponse,
          MultifactorChallengeResponse
        >(response)
      );
  }

  /**
   * Revoke an issued refresh token
   */
  revoke(parameters: RevokeOptions): Promise<void> {
    const payload = apply(
      {
        parameters: {
          refreshToken: { required: true, toName: 'token' },
        },
      },
      parameters
    );
    return this.client
      .post<void>('/oauth/revoke', {
        ...payload,
        client_id: this.clientId,
      })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new AuthError(response);
      });
  }

  /**
   * Return user information using an access token
   *
   * @returns The user's profile information.
   */
  userInfo(parameters: UserInfoOptions): Promise<User> {
    const { baseUrl, telemetry } = this.client;
    const client = new Client({ baseUrl, telemetry, token: parameters.token });
    const claims = [
      'sub',
      'name',
      'given_name',
      'family_name',
      'middle_name',
      'nickname',
      'preferred_username',
      'profile',
      'picture',
      'website',
      'email',
      'email_verified',
      'gender',
      'birthdate',
      'zoneinfo',
      'locale',
      'phone_number',
      'phone_number_verified',
      'address',
      'updated_at',
    ];
    return client.get<RawUser>('/userinfo').then((response) =>
      responseHandler<RawUser, User>(response, {
        attributes: claims,
        whitelist: true,
      })
    );
  }

  /**
   * Request an email with instructions to change password of a user
   */
  resetPassword(parameters: ResetPasswordOptions): Promise<void> {
    return this.client
      .post<void>('/dbconnections/change_password', {
        ...parameters,
        client_id: this.clientId,
      })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new AuthError(response);
      });
  }

  /**
   * Creates a new user using the options provided.
   *
   * @returns An instance of {@link User}.
   */
  createUser(parameters: CreateUserOptions): Promise<Partial<User>> {
    const payload = apply(
      {
        parameters: {
          email: { required: true },
          password: { required: true },
          connection: { required: true },
          username: { required: false },
          given_name: { required: false },
          family_name: { required: false },
          name: { required: false },
          nickname: { required: false },
          picture: { required: false },
          metadata: { required: false, toName: 'user_metadata' },
        },
      },
      parameters
    );

    return this.client
      .post<Partial<RawUser>>('/dbconnections/signup', {
        ...payload,
        client_id: this.clientId,
      })
      .then((response) => {
        if (response.ok && response.json) {
          return toCamelCase<Partial<User>>(response.json);
        }
        throw new Auth0Error(response);
      });
  }
}

export default Auth;
