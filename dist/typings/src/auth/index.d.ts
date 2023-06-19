import { Telemetry } from '../networking/telemetry';
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
export interface IAuthClient {
  readonly domain: string;
  readonly clientId: string;
  authorizeUrl(parameters: AuthorizeUrlOptions): string;
  logoutUrl(parameters: LogoutUrlOptions): string;
  exchange(parameters: ExchangeOptions): Promise<Credentials>;
  exchangeNativeSocial(
    parameters: ExchangeNativeSocialOptions
  ): Promise<Credentials>;
  passwordRealm(parameters: PasswordRealmOptions): Promise<Credentials>;
  refreshToken(parameters: RefreshTokenOptions): Promise<Credentials>;
  passwordlessWithEmail(
    parameters: PasswordlessWithEmailOptions
  ): Promise<void>;
  passwordlessWithSMS(parameters: PasswordlessWithSMSOptions): Promise<void>;
  loginWithEmail(parameters: LoginWithEmailOptions): Promise<Credentials>;
  loginWithSMS(parameters: LoginWithSMSOptions): Promise<Credentials>;
  loginWithOTP(parameters: LoginWithOTPOptions): Promise<Credentials>;
  loginWithOOB(parameters: LoginWithOOBOptions): Promise<Credentials>;
  loginWithRecoveryCode(
    parameters: LoginWithRecoveryCodeOptions
  ): Promise<Credentials>;
  multifactorChallenge(
    parameters: MultifactorChallengeOptions
  ): Promise<MultifactorChallengeResponse>;
  revoke(parameters: RevokeOptions): Promise<void>;
  userInfo(parameters: UserInfoOptions): Promise<User>;
  resetPassword(parameters: ResetPasswordOptions): Promise<void>;
  createUser(parameters: CreateUserOptions): Promise<Partial<User>>;
}
/**
 * Auth0 Auth API
 *
 * @see https://auth0.com/docs/api/authentication
 */
export declare class Auth implements IAuthClient {
  private client;
  clientId: string;
  domain: string;
  constructor(options: {
    baseUrl: string;
    clientId: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  });
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
  authorizeUrl(parameters: AuthorizeUrlOptions): string;
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
  logoutUrl(parameters: LogoutUrlOptions): string;
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
  exchange(parameters: ExchangeOptions): Promise<Credentials>;
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
    parameters: ExchangeNativeSocialOptions
  ): Promise<Credentials>;
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
  passwordRealm(parameters: PasswordRealmOptions): Promise<Credentials>;
  /**
   * Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param {Object} parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
   */
  refreshToken(parameters: RefreshTokenOptions): Promise<Credentials>;
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
    parameters: PasswordlessWithEmailOptions
  ): Promise<void>;
  /**
   * Starts the Passwordless flow with an SMS connection
   *
   * @param {Object} parameters passwordless parameters
   * @param {String} parameters.phoneNumber the phone number to send the link/code to
   * @returns {Promise}
   */
  passwordlessWithSMS(parameters: PasswordlessWithSMSOptions): Promise<void>;
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
  loginWithEmail(parameters: LoginWithEmailOptions): Promise<Credentials>;
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
  loginWithSMS(parameters: LoginWithSMSOptions): Promise<Credentials>;
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
  loginWithOTP(parameters: LoginWithOTPOptions): Promise<Credentials>;
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
  loginWithOOB(parameters: LoginWithOOBOptions): Promise<Credentials>;
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
    parameters: LoginWithRecoveryCodeOptions
  ): Promise<Credentials>;
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
    parameters: MultifactorChallengeOptions
  ): Promise<MultifactorChallengeResponse>;
  /**
   * Revoke an issued refresh token
   *
   * @param {Object} parameters revoke token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @returns {Promise}
   */
  revoke(parameters: RevokeOptions): Promise<void>;
  /**
   * Return user information using an access token
   *
   * @param {Object} parameters user info parameters
   * @param {String} parameters.token user's access token
   * @returns {Promise}
   */
  userInfo(parameters: UserInfoOptions): Promise<User>;
  /**
   * Request an email with instructions to change password of a user
   *
   * @param {Object} parameters reset password parameters
   * @param {String} parameters.email user's email
   * @param {String} parameters.connection name of the connection of the user
   * @returns {Promise}
   */
  resetPassword(parameters: ResetPasswordOptions): Promise<void>;
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
  createUser(parameters: CreateUserOptions): Promise<Partial<User>>;
}
