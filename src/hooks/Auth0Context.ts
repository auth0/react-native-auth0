import { createContext } from 'react';
import type {
  Credentials,
  User,
  WebAuthorizeParameters,
  ClearSessionParameters,
  PasswordRealmParameters,
  CreateUserParameters,
  PasswordlessEmailParameters,
  LoginEmailParameters,
  PasswordlessSmsParameters,
  LoginSmsParameters,
  MfaChallengeParameters,
  LoginOobParameters,
  LoginOtpParameters,
  LoginRecoveryCodeParameters,
  ExchangeNativeSocialParameters,
  RevokeOptions,
  ResetPasswordParameters,
  MfaChallengeResponse,
} from '../types';
import type { NativeAuthorizeOptions } from '../types/platform-specific';
import type { AuthState } from './reducer';

/**
 * The contract for the value provided by the Auth0Context.
 * This is the interface that developers will interact with when using the `useAuth0` hook.
 */
export interface Auth0ContextInterface extends AuthState {
  /**
   * Initiates the web-based authentication flow.
   * @param parameters The parameters to send to the `/authorize` endpoint.
   * @param options Platform-specific options to customize the authentication experience.
   * @returns A promise that resolves with the user's credentials upon successful authentication.
   * @throws {AuthError} If the authentication fails.
   */
  authorize(
    parameters?: WebAuthorizeParameters,
    options?: NativeAuthorizeOptions
  ): Promise<Credentials>;

  /**
   * Clears the user's session and logs them out.
   * @param parameters The parameters to send to the `/v2/logout` endpoint.
   * @returns A promise that resolves when the session has been cleared.
   * @throws {AuthError} If the logout fails.
   */
  clearSession(parameters?: ClearSessionParameters): Promise<void>;

  /**
   * Retrieves the stored credentials, refreshing them if necessary.
   * @param scope The scopes to request for the new access token (used during refresh).
   * @param minTtl The minimum time-to-live (in seconds) required for the access token.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If credentials cannot be retrieved or refreshed.
   */
  getCredentials(scope?: string, minTtl?: number): Promise<Credentials>;

  /**
   * Clears the user's credentials without clearing their web session and logs them out.
   *
   * @remarks
   * **Platform specific:** This method is only available in the context of a Android/iOS application.
   * @returns A promise that resolves when the credentials have been cleared.
   */
  clearCredentials: () => Promise<void>;

  /**
   * Checks if a valid, non-expired set of credentials exists in storage.
   * This is a quick, local check and does not perform a network request.
   *
   * @param minTtl The minimum time-to-live (in seconds) required for the access token to be considered valid. Defaults to 0.
   * @returns A promise that resolves with `true` if valid credentials exist, `false` otherwise.
   */
  hasValidCredentials(minTtl?: number): Promise<boolean>;

  /**
   * Cancels the ongoing web authentication process.
   * This works only on iOS. On other platforms, it will resolve without performing an action.
   */
  cancelWebAuth(): Promise<void>;

  /**
   * Authenticates a user with their username and password.
   * @remarks This method is not supported on the web platform.
   * @param parameters The parameters for the password-realm grant.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authentication fails.
   */
  loginWithPasswordRealm(
    parameters: PasswordRealmParameters
  ): Promise<Credentials>;

  /**
   * Creates a new user in a database connection.
   * @param parameters The parameters for creating the new user.
   * @returns A promise that resolves with the new user's profile information.
   * @throws {AuthError} If the user creation fails.
   */
  createUser(parameters: CreateUserParameters): Promise<Partial<User>>;

  /**
   * Resets the user's password.
   * @param parameters The parameters for resetting the password.
   * @returns A promise that resolves when the password has been reset.
   * @throws {AuthError} If the reset fails.
   */
  resetPassword(parameters: ResetPasswordParameters): Promise<void>;

  /**
   * Exchanges an authorization code for native social tokens.
   * @param parameters The parameters containing the authorization code and verifier.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the exchange fails.
   */
  authorizeWithExchangeNativeSocial(
    parameters: ExchangeNativeSocialParameters
  ): Promise<Credentials>;

  /**
   * Sends a verification code to the user's email.
   * @param parameters The parameters for sending the email code.
   * @throws {AuthError} If sending the email code fails.
   */
  sendEmailCode(parameters: PasswordlessEmailParameters): Promise<void>;

  /**
   * Authorizes a user with their email.
   * @param parameters The parameters for email authorization.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authorization fails.
   */
  authorizeWithEmail(parameters: LoginEmailParameters): Promise<Credentials>;

  /**
   /**
   * Sends a verification code to the user's SMS.
   * @param parameters The parameters for sending the SMS code.
   * @throws {AuthError} If sending the SMS code fails.
   */
  sendSMSCode(parameters: PasswordlessSmsParameters): Promise<void>;

  /**
   * Authorizes a user with their SMS.
   * @param parameters The parameters for SMS authorization.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authorization fails.
   */
  authorizeWithSMS(parameters: LoginSmsParameters): Promise<Credentials>;

  /**
   * Sends a multifactor challenge to the user.
   * @param parameters The parameters for the multifactor challenge.
   * @returns A promise that resolves when the challenge has been sent.
   * @throws {AuthError} If sending the challenge fails.
   */
  sendMultifactorChallenge(
    parameters: MfaChallengeParameters
  ): Promise<MfaChallengeResponse>;

  /**
   * Authorizes a user with out-of-band (OOB) authentication.
   * @param parameters The parameters for OOB authorization.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authorization fails.
   */
  authorizeWithOOB(parameters: LoginOobParameters): Promise<Credentials>;

  /**
   * Authorizes a user with a one-time password (OTP).
   * @param parameters The parameters for OTP authorization.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authorization fails.
   */
  authorizeWithOTP(parameters: LoginOtpParameters): Promise<Credentials>;

  /**
   * Authorizes a user with a recovery code.
   * @param parameters The parameters for recovery code authorization.
   * @returns A promise that resolves with the user's credentials.
   * @throws {AuthError} If the authorization fails.
   */
  authorizeWithRecoveryCode(
    parameters: LoginRecoveryCodeParameters
  ): Promise<Credentials>;

  // Token Management
  revokeRefreshToken(parameters: RevokeOptions): Promise<void>;
}

const stub = (): any => {
  throw new Error('You forgot to wrap your component in <Auth0Provider>.');
};

const initialContext: Auth0ContextInterface = {
  user: null,
  error: null,
  isLoading: true,
  authorize: stub,
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  hasValidCredentials: stub,
  loginWithPasswordRealm: stub,
  cancelWebAuth: stub,
  createUser: stub,
  authorizeWithRecoveryCode: stub,
  authorizeWithExchangeNativeSocial: stub,
  sendEmailCode: stub,
  sendSMSCode: stub,
  authorizeWithEmail: stub,
  authorizeWithSMS: stub,
  sendMultifactorChallenge: stub,
  authorizeWithOOB: stub,
  authorizeWithOTP: stub,
  resetPassword: stub,
  revokeRefreshToken: stub,
};

export const Auth0Context =
  createContext<Auth0ContextInterface>(initialContext);
