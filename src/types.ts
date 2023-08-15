export type Credentials = {
  /**
   * A token in JWT format that has user claims
   */
  idToken: string;
  /**
   * The token used to make API calls
   */
  accessToken: string;
  /**
   * The type of the token, e.g.: Bearer
   */
  tokenType: string;
  /**
   * Used to denote when the token will expire, as a UNIX timestamp
   */
  expiresAt: number;
  /**
   * The token used to refresh the access token
   */
  refreshToken?: string;
  /**
   * Represents the scope of the current token
   */
  scope?: string;
  [key: string]: any;
};

export type User = {
  name?: string;
  givenName?: string;
  familyName?: string;
  middleName?: string;
  nickname?: string;
  preferredUsername?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  emailVerified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  address?: string;
  updatedAt?: string;
  sub?: string;
  [key: string]: any;
};

/**
 * Parameters that are sent to a call to the `/authorize` endpoint.
 */
export interface WebAuthorizeParameters {
  /**
   * Random string to prevent CSRF attacks.
   */
  state?: string;
  /**
   * One-time random value that is used to prevent replay attacks.
   */
  nonce?: string;
  /**
   * The intended API identifier that will be the consumer for the issued access token.
   */
  audience?: string;
  /**
   * The scopes requested for the issued tokens. e.g. `openid profile`
   */
  scope?: string;
  /**
   * The database connection in which to look for users.
   */
  connection?: string;
  /**
   * The maximum age in seconds that the resulting ID token should be issued for.
   */
  maxAge?: number;
  /**
   * The organization in which user's should be authenticated into.
   */
  organization?: string;
  /**
   * The invitation URL for those users who have been invited to join a specific organization.
   */
  invitationUrl?: string;
  /**
   * Any additional arbitrary parameters to send along in the URL.
   */
  additionalParameters?: { [key: string]: string };
}

/**
 * Options for controlling the SDK's behaviour when calling the `/authorize` endpoint.
 */
export interface WebAuthorizeOptions {
  /**
   * The amount of leeway, in seconds, to accommodate potential clock skew when validating an ID token's claims.
   * @default 60 seconds.
   */
  leeway?: number;
  /**
   * **iOS only**: Disable Single-Sign-On (SSO). It only affects iOS with versions 13 and above.
   * @default `false`
   */
  ephemeralSession?: boolean;
  /**
   * **Android only:** Custom scheme to build the callback URL with.
   */
  customScheme?: string;
  useLegacyCallbackUrl?: boolean;
}

/**
 * Parameters for sending to the Auth0 logout endpoint.
 */
export interface ClearSessionParameters {
  /**
   * If `true`, the user will be signed out of any connected identity providers in addition to their Auth0 session.
   * @default `false`
   * @see https://auth0.com/docs/authenticate/login/logout/log-users-out-of-idps
   */
  federated?: boolean;
}

/**
 * Options for configuring the SDK's clear session behaviour.
 */
export interface ClearSessionOptions {
  /**
   * **Android only:** Custom scheme to build the callback URL with.
   */
  customScheme?: string;
  useLegacyCallbackUrl?: boolean;
}

export interface GetUserOptions {
  id: string;
  [key: string]: any;
}

export interface PatchUserOptions {
  id: string;
  metadata: object;
  [key: string]: any;
}

/**
 * Options for building a URL for `/authorize`
 */
export interface AuthorizeUrlOptions {
  /**
   * The response_type value
   */
  responseType: string;
  /**
   * Where the authorization server will redirect back after success or failure.
   */
  redirectUri: object;
  /**
   * Random string to prevent CSRF attacks.
   */
  state: object;
  /**
   * Custom parameters to send to `/authorize`
   */
  [key: string]: any;
}

/**
 * Options for the logout endpoint
 */
export interface LogoutUrlOptions {
  /**
   * Whether the logout should include removing session for federated IdP.
   */
  federated?: boolean;
  /**
   * The client identifier of the one requesting the logout
   */
  clientId?: string;
  /**
   * URL where the user is redirected to after logout. It must be declared in you Auth0 Dashboard
   */
  returnTo?: string;
  /**
   * Custom parameters to send to the logout endpoint
   */
  [key: string]: any;
}

/**
 * Options for the `/oauth/token` endpoint to exchange a code for an access token
 */
export interface ExchangeOptions {
  /**
   * The code returned by `/authorize`.
   */
  code: string;
  /**
   * The value used to generate the code challenge sent to `/authorize`.
   */
  verifier: string;
  /**
   * The original redirectUri used when calling `/authorize`.
   */
  redirectUri: string;
  /**
   * Custom parameters to send to the /oauth/token endpoint
   */
  [key: string]: any;
}

/**
 * Options for obtaining user tokens from an external provider's token
 */
export interface ExchangeNativeSocialOptions {
  /**
   * The token returned by the native social authentication solution
   */
  subjectToken: string;
  /**
   * The identifier that indicates the native social authentication solution
   */
  subjectTokenType: string;
  /**
   * Additional profile attributes to set or override, only on select native social authentication solutions
   */
  userProfile?: object;
  /**
   * The API audience to request
   */
  audience?: string;
  /**
   * The scopes requested for the issued tokens. e.g. `openid profile`
   */
  scope?: string;
  [key: string]: any;
}

/**
 * Options for authenticating using the username & password grant.
 */
export interface PasswordRealmOptions {
  /**
   * The user's username or email
   */
  username: string;
  /**
   * The user's password
   */
  password: string;
  /**
   * The name of the Realm where to Auth (or connection name)
   */
  realm: string;
  /**
   * The identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   */
  audience?: string;
  /**
   * The scopes requested for the issued tokens. e.g. `openid profile`
   */
  scope?: string;
  [key: string]: any;
}

/**
 * Refresh token parameters
 */
export interface RefreshTokenOptions {
  /**
   * The issued refresh token
   */
  refreshToken: string;
  /**
   * The scopes requested for the issued tokens. e.g. `openid profile`
   */
  scope?: string;
  [key: string]: any;
}

/**
 * Options for requesting passwordless login using email
 */
export interface PasswordlessWithEmailOptions {
  /**
   * The email to send the link/code to
   */
  email: string;
  /**
   * The passwordless strategy, either 'link' or 'code'
   */
  send?: string;
  /**
   * Optional parameters, used when strategy is 'linḱ'
   */
  authParams?: string;
  [key: string]: any;
}

/**
 * Options for requesting passwordless login using SMS
 */
export interface PasswordlessWithSMSOptions {
  /**
   * The phone number to send the link/code to
   */
  phoneNumber: string;
  /**
   * The passwordless strategy, either 'link' or 'code'
   */
  send?: string;
  /**
   * Optional passwordless parameters
   */
  authParams?: string;
  [key: string]: any;
}

/**
 * The options for completing the passwordless login with email request
 */
export interface LoginWithEmailOptions {
  /**
   * The email where the link/code was received
   */
  email: string;
  /**
   * The code numeric value (OTP)
   */
  code: string;
  /**
   * The API audience to request
   */
  audience?: string;
  /**
   * The scopes to request
   */
  scope?: string;
  [key: string]: any;
}

/**
 * The options for completing the passwordless login with SMS request
 */
export interface LoginWithSMSOptions {
  /**
   * The phone number where the code was received
   */
  phoneNumber: string;
  /**
   * The code numeric value (OTP)
   */
  code: string;
  /**
   * Optional API audience to request
   */
  audience?: string;
  /**
   * Optional scopes to request
   */
  scope?: string;
  [key: string]: any;
}

/**
 * Options for logging in using an OTP code
 */
export interface LoginWithOTPOptions {
  /**
   * The token received in the previous login response
   */
  mfaToken: string;
  /**
   * The one time password code provided by the resource owner, typically obtained
   * from an MFA application such as Google Authenticator or Guardian.
   */
  otp: string;
  /**
   * The API audience
   */
  audience?: string;
  [key: string]: any;
}

/**
 * Options for logging in using an OOB code
 */
export interface LoginWithOOBOptions {
  /**
   * The token received in the previous login response
   */
  mfaToken: string;
  /**
   * The out of band code received in the challenge response.
   */
  oobCode: string;
  /**
   * The code used to bind the side channel (used to deliver the challenge) with the
   * main channel you are using to authenticate. This is usually an OTP-like code
   * delivered as part of the challenge message.
   */
  bindingCode?: string;
  [key: string]: any;
}

/**
 * Options for logging in using a recovery code
 */
export interface LoginWithRecoveryCodeOptions {
  /**
   * The token received in the previous login response
   */
  mfaToken: string;
  /**
   * The recovery code provided by the end-user.
   */
  recoveryCode: string;
  [key: string]: any;
}

/**
 * Options for multifactor challenge.
 */
export interface MultifactorChallengeOptions {
  /**
   * The token received in the previous login response
   */
  mfaToken: string;
  /**
   * A whitespace-separated list of the challenges types accepted by your application.
   * Accepted challenge types are oob or otp. Excluding this parameter means that your client application
   * accepts all supported challenge types.
   */
  challengeType?: string;
  /**
   * The ID of the authenticator to challenge.
   */
  authenticatorId?: string;
  [key: string]: any;
}

/**
 * Options for the revoke refresh token endpoint.
 */
export interface RevokeOptions {
  /**
   * The user's issued refresh token
   */
  refreshToken: string;
  [key: string]: any;
}

/**
 * Options for accessing the `/userinfo` endpoint.
 */
export interface UserInfoOptions {
  /**
   * The user's access token
   */
  token: string;
}

/**
 * Options for resetting a user's password.
 */
export interface ResetPasswordOptions {
  /**
   * The user's email
   */
  email: string;
  /**
   * The name of the database connection of the user
   */
  connection: string;
  [key: string]: any;
}

/**
 * Options for creating a new user.
 */
export interface CreateUserOptions {
  /**
   * The user's email
   */
  email: string;
  /**
   * The user's password
   */
  password: string;
  /**
   * The name of the database connection where to create the user
   */
  connection: string;
  /**
   * The user's username
   */
  username?: string;
  /**
   * The user's given name(s)
   */
  given_name?: string;
  /**
   * The user's family name(s)
   */
  family_name?: string;
  /**
   * The user's full name
   */
  name?: string;
  /**
   * The user's nickname
   */
  nickname?: string;
  /**
   * A URL pointing to the user's picture
   */
  picture?: string;
  /**
   * Additional information that will be stored in `user_metadata`
   */
  metadata?: string;
  [key: string]: any;
}

export type MultifactorChallengeOTPResponse = { challengeType: string };

export type MultifactorChallengeOOBResponse =
  MultifactorChallengeOTPResponse & {
    oobCode: string;
  };
export type MultifactorChallengeOOBWithBindingResponse =
  MultifactorChallengeOOBResponse & {
    bindingMethod: string;
  };

export type MultifactorChallengeResponse =
  | MultifactorChallengeOTPResponse
  | MultifactorChallengeOOBResponse
  | MultifactorChallengeOOBWithBindingResponse;
