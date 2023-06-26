export type Credentials = {
  idToken: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
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

export interface WebAuthorizeParameters {
  state?: string;
  nonce?: string;
  audience?: string;
  scope?: string;
  connection?: string;
  maxAge?: number;
  organization?: string;
  invitationUrl?: string;
  additionalParameters?: { [key: string]: string };
}

export interface WebAuthorizeOptions {
  leeway?: number;
  ephemeralSession?: boolean;
  customScheme?: string;
}

export interface ClearSessionParameters {
  federated?: boolean;
}

export interface ClearSessionOptions {
  customScheme?: string;
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
