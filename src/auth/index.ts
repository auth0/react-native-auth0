import Client, {Auth0Response} from '../networking';
import {apply} from '../utils/whitelist';
import {toCamelCase} from '../utils/camel';
import AuthError from './authError';
import Auth0Error from './auth0Error';
import {Telemetry} from '../networking/telemetry';
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
  RawCredentials,
  RawMultifactorChallengeResponse,
  RawUser,
} from '../internal-types';

function responseHandler<TRawResult = unknown, TResult = unknown>(
  response: Auth0Response<TRawResult>,
  exceptions = {},
) {
  if (response.ok && response.json) {
    return toCamelCase(response.json, exceptions) as TResult;
  }
  throw new AuthError(response);
}

/**
 * Auth0 Auth API
 *
 * @see https://auth0.com/docs/api/authentication
 */
class Auth {
  private client;
  public clientId;
  public domain;

  constructor(options: {
    baseUrl: string;
    clientId: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  }) {
    this.client = new Client(options);
    this.domain = this.client.domain;
    const {clientId} = options;
    if (!clientId) {
      throw new Error('Missing clientId in parameters');
    }
    this.clientId = clientId;
  }

  /**
   * Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/authorize`
   * @param {String} parameters.responseType type of the response to get from `/authorize`.
   * @param {String} parameters.redirectUri where the AS will redirect back after success or failure.
   * @param {String} parameters.state random string to prevent CSRF attacks.
   * @returns {String} authorize url with specified parameters to redirect to for AuthZ/AuthN.
   * @see https://auth0.com/docs/api/authentication#authorize-client
   */
  authorizeUrl(parameters: AuthorizeUrlOptions): string {
    const query = apply(
      {
        parameters: {
          redirectUri: {required: true, toName: 'redirect_uri'},
          responseType: {required: true, toName: 'response_type'},
          state: {required: true},
        },
        whitelist: false,
      },
      parameters,
    );
    return this.client.url('/authorize', query, true);
  }

  /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/v2/logout`
   * @param {Boolean} [parameters.federated] if the logout should include removing session for federated IdP.
   * @param {String} [parameters.clientId] client identifier of the one requesting the logout
   * @param {String} [parameters.returnTo] url where the user is redirected to after logout. It must be declared in you Auth0 Dashboard
   * @returns {String} logout url with specified parameters
   * @see https://auth0.com/docs/api/authentication#logout
   */
  logoutUrl(parameters: LogoutUrlOptions): string {
    const query = apply(
      {
        parameters: {
          federated: {required: false},
          clientId: {required: false, toName: 'client_id'},
          returnTo: {required: false},
        },
      },
      parameters,
    );
    return this.client.url('/v2/logout', {...query}, true);
  }

  /**
   * Exchanges a code obtained via `/authorize` (w/PKCE) for the user's tokens
   *
   * @param {Object} parameters parameters used to obtain tokens from a code
   * @param {String} parameters.code code returned by `/authorize`.
   * @param {String} parameters.redirectUri original redirectUri used when calling `/authorize`.
   * @param {String} parameters.verifier value used to generate the code challenge sent to `/authorize`.
   * @returns {Promise}
   * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
   */
  exchange(parameters: ExchangeOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          code: {required: true},
          verifier: {required: true, toName: 'code_verifier'},
          redirectUri: {required: true, toName: 'redirect_uri'},
        },
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'authorization_code',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Exchanges an external token obtained via a native social authentication solution for the user's tokens
   *
   * @param {Object} parameters parameters used to obtain user tokens from an external provider's token
   * @param {String} parameters.subjectToken token returned by the native social authentication solution
   * @param {String} parameters.subjectTokenType identifier that indicates the native social authentication solution
   * @param {Object} [parameters.userProfile] additional profile attributes to set or override, only on select native social authentication solutions
   * @param {String} [parameters.audience] API audience to request
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   *
   * @see https://auth0.com/docs/api/authentication#token-exchange-for-native-social
   */
  exchangeNativeSocial(
    parameters: ExchangeNativeSocialOptions,
  ): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          subjectToken: {required: true, toName: 'subject_token'},
          subjectTokenType: {required: true, toName: 'subject_token_type'},
          userProfile: {required: false, toName: 'user_profile'},
          audience: {required: false},
          scope: {required: false},
        },
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Performs Auth with user credentials using the Password Realm Grant
   *
   * @param {Object} parameters password realm parameters
   * @param {String} parameters.username user's username or email
   * @param {String} parameters.password user's password
   * @param {String} parameters.realm name of the Realm where to Auth (or connection name)
   * @param {String} [parameters.audience] identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/api-auth/grant/password#realm-support
   */
  passwordRealm(parameters: PasswordRealmOptions): Promise<Credentials> {
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...parameters,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param {Object} parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
   */
  refreshToken(parameters: RefreshTokenOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          refreshToken: {required: true, toName: 'refresh_token'},
          scope: {required: false},
        },
        whitelist: false,
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'refresh_token',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Starts the Passworldess flow with an email connection
   *
   * @param {Object} parameters passwordless parameters
   * @param {String} parameters.email the email to send the link/code to
   * @param {String} parameters.send the passwordless strategy, either 'link' or 'code'
   * @param {String} parameters.authParams optional parameters, used when strategy is 'linḱ'
   * @returns {Promise}
   */
  passwordlessWithEmail(
    parameters: PasswordlessWithEmailOptions,
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
   * Starts the Passwordless flow with an SMS connection
   *
   * @param {Object} parameters passwordless parameters
   * @param {String} parameters.phoneNumber the phone number to send the link/code to
   * @returns {Promise}
   */
  passwordlessWithSMS(parameters: PasswordlessWithSMSOptions): Promise<void> {
    const payload = apply(
      {
        parameters: {
          phoneNumber: {required: true, toName: 'phone_number'},
          send: {required: false},
          authParams: {required: false},
        },
        whitelist: false,
      },
      parameters,
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
   * Finishes the Passworldess authentication with an email connection
   *
   * @param {Object} parameters passwordless parameters
   * @param {String} parameters.email the email where the link/code was received
   * @param {String} parameters.code the code numeric value (OTP)
   * @param {String} parameters.audience optional API audience to request
   * @param {String} parameters.scope optional scopes to request
   * @returns {Promise}
   */
  loginWithEmail(parameters: LoginWithEmailOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          email: {required: true, toName: 'username'},
          code: {required: true, toName: 'otp'},
          audience: {required: false},
          scope: {required: false},
        },
        whitelist: false,
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        realm: 'email',
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Finishes the Passworldess authentication with an SMS connection
   *
   * @param {Object} parameters passwordless parameters
   * @param {String} parameters.phoneNumber the phone number where the code was received
   * @param {String} parameters.code the code numeric value (OTP)
   * @param {String} parameters.audience optional API audience to request
   * @param {String} parameters.scope optional scopes to request
   * @returns {Promise}
   */
  loginWithSMS(parameters: LoginWithSMSOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          phoneNumber: {required: true, toName: 'username'},
          code: {required: true, toName: 'otp'},
          audience: {required: false},
          scope: {required: false},
        },
        whitelist: false,
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        realm: 'sms',
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Log in a user using the One Time Password code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA OTP** Grant Type enabled.
   * See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @param {Object} parameters login with OTP parameters
   * @param {String} parameters.mfaToken the token received in the previous login response
   * @param {String} parameters.otp the one time password code provided by the resource owner, typically obtained from an MFA application such as Google Authenticator or Guardian.
   * @returns {Promise}
   */
  loginWithOTP(parameters: LoginWithOTPOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: {required: true, toName: 'mfa_token'},
          otp: {required: true, toName: 'otp'},
        },
        whitelist: false,
      },
      parameters,
    );
    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-otp',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Log in a user using an Out Of Band authentication code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA OOB** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @param {Object} parameters login with Recovery Code parameters
   * @param {String} parameters.mfaToken the token received in the previous login response
   * @param {String} parameters.oobCode the out of band code received in the challenge response.
   * @param {String} parameters.bindingCode [Optional] the code used to bind the side channel (used to deliver the challenge) with the main channel you are using to authenticate. This is usually an OTP-like code delivered as part of the challenge message.
   *
   * @returns {Promise}
   */

  loginWithOOB(parameters: LoginWithOOBOptions): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: {required: true, toName: 'mfa_token'},
          oobCode: {required: true, toName: 'oob_code'},
          bindingCode: {required: false, toName: 'binding_code'},
        },
        whitelist: false,
      },
      parameters,
    );

    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Log in a user using a multi-factor authentication Recovery Code after they have received the 'mfa_required' error.
   * The MFA token tells the server the username or email, password, and realm values sent on the first request.
   *
   * Requires your client to have the **MFA** Grant Type enabled. See [Client Grant Types](https://auth0.com/docs/clients/client-grant-types) to learn how to enable it.
   *
   * @param {Object} parameters login with Recovery Code parameters
   * @param {String} parameters.mfaToken the token received in the previous login response
   * @param {String} parameters.recoveryCode the recovery code provided by the end-user.
   * @returns {Promise}
   */
  loginWithRecoveryCode(
    parameters: LoginWithRecoveryCodeOptions,
  ): Promise<Credentials> {
    const payload = apply(
      {
        parameters: {
          mfaToken: {required: true, toName: 'mfa_token'},
          recoveryCode: {required: true, toName: 'recovery_code'},
        },
        whitelist: false,
      },
      parameters,
    );

    return this.client
      .post<RawCredentials>('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-recovery-code',
      })
      .then((response) =>
        responseHandler<RawCredentials, Credentials>(response),
      );
  }

  /**
   * Request a challenge for multi-factor authentication (MFA) based on the challenge types supported by the application and user.
   * The challenge type is how the user will get the challenge and prove possession. Supported challenge types include: "otp" and "oob".
   *
   * @param {Object} parameters challenge request parameters
   * @param {String} parameters.mfaToken the token received in the previous login response
   * @param {String} parameters.challengeType A whitespace-separated list of the challenges types accepted by your application.
   * Accepted challenge types are oob or otp. Excluding this parameter means that your client application
   * accepts all supported challenge types.
   * @param {String} parameters.authenticatorId The ID of the authenticator to challenge.
   * @returns {Promise}
   */
  multifactorChallenge(
    parameters: MultifactorChallengeOptions,
  ): Promise<MultifactorChallengeResponse> {
    const payload = apply(
      {
        parameters: {
          mfaToken: {required: true, toName: 'mfa_token'},
          challengeType: {required: false, toName: 'challenge_type'},
          authenticatorId: {required: false, toName: 'authenticator_id'},
        },
      },
      parameters,
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
        >(response),
      );
  }

  /**
   * Revoke an issued refresh token
   *
   * @param {Object} parameters revoke token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @returns {Promise}
   */
  revoke(parameters: RevokeOptions): Promise<void> {
    const payload = apply(
      {
        parameters: {
          refreshToken: {required: true, toName: 'token'},
        },
      },
      parameters,
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
   * @param {Object} parameters user info parameters
   * @param {String} parameters.token user's access token
   * @returns {Promise}
   */
  userInfo(parameters: UserInfoOptions): Promise<User> {
    const {baseUrl, telemetry} = this.client;
    const client = new Client({baseUrl, telemetry, token: parameters.token});
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
      }),
    );
  }

  /**
   * Request an email with instructions to change password of a user
   *
   * @param {Object} parameters reset password parameters
   * @param {String} parameters.email user's email
   * @param {String} parameters.connection name of the connection of the user
   * @returns {Promise}
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
   *
   *
   * @param {Object} parameters create user parameters
   * @param {String} parameters.email user's email
   * @param {String} parameters.password user's password
   * @param {String} parameters.connection name of the database connection where to create the user
   * @param {String} [parameters.username] user's username
   * @param {String} [parameters.give_name] The user's given name(s)
   * @param {String} [parameters.family_name] The user's family name(s)
   * @param {String} [parameters.name] The user's full name
   * @param {String} [parameters.nickname] The user's nickname
   * @param {String} [parameters.picture] A URI pointing to the user's picture
   * @param {String} [parameters.metadata] additional user information that will be stored in `user_metadata`
   * @returns {Promise}
   */
  createUser(parameters: CreateUserOptions): Promise<Partial<User>> {
    const payload = apply(
      {
        parameters: {
          email: {required: true},
          password: {required: true},
          connection: {required: true},
          username: {required: false},
          given_name: {required: false},
          family_name: {required: false},
          name: {required: false},
          nickname: {required: false},
          picture: {required: false},
          metadata: {required: false, toName: 'user_metadata'},
        },
      },
      parameters,
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
