import type {
  Credentials,
  SessionTransferCredentials,
  User,
  MfaChallengeResponse,
  PasswordRealmParameters,
  RefreshTokenParameters,
  UserInfoParameters,
  RevokeOptions,
  ExchangeParameters,
  ExchangeNativeSocialParameters,
  SSOExchangeParameters,
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
} from '../../types';

/**
 * Defines the contract for direct authentication methods that interact with Auth0's
 * Authentication API endpoints without a web-based redirect.
 */
export interface IAuthenticationProvider {
  passwordRealm(parameters: PasswordRealmParameters): Promise<Credentials>;
  refreshToken(parameters: RefreshTokenParameters): Promise<Credentials>;
  userInfo(parameters: UserInfoParameters): Promise<User>;
  revoke(parameters: RevokeOptions): Promise<void>;
  exchange(parameters: ExchangeParameters): Promise<Credentials>;
  passwordlessWithEmail(parameters: PasswordlessEmailParameters): Promise<void>;
  passwordlessWithSMS(parameters: PasswordlessSmsParameters): Promise<void>;
  loginWithEmail(parameters: LoginEmailParameters): Promise<Credentials>;
  loginWithSMS(parameters: LoginSmsParameters): Promise<Credentials>;
  /**
   * @deprecated Will be removed in v6. Use `auth0.mfa.verify({ mfaToken, otp })`
   * instead, which additionally accepts `scope` and `audience`.
   */
  loginWithOTP(parameters: LoginOtpParameters): Promise<Credentials>;
  /**
   * @deprecated Will be removed in v6. Use
   * `auth0.mfa.verify({ mfaToken, oobCode, bindingCode })` instead, which
   * additionally accepts `scope` and `audience`.
   */
  loginWithOOB(parameters: LoginOobParameters): Promise<Credentials>;
  /**
   * @deprecated Will be removed in v6. Use
   * `auth0.mfa.verify({ mfaToken, recoveryCode })` instead, which additionally
   * accepts `scope` and `audience`.
   */
  loginWithRecoveryCode(
    parameters: LoginRecoveryCodeParameters
  ): Promise<Credentials>;
  /**
   * @deprecated Will be removed in v6. Use
   * `auth0.mfa.challenge({ mfaToken, authenticatorId })` instead. Note that
   * `authenticatorId` is required there — if you relied on omitting it to let
   * Auth0 pick a default factor, call `auth0.mfa.getAuthenticators({ mfaToken })`
   * first and pass an explicit id.
   */
  multifactorChallenge(
    parameters: MfaChallengeParameters
  ): Promise<MfaChallengeResponse>;
  resetPassword(parameters: ResetPasswordParameters): Promise<void>;
  createUser(parameters: CreateUserParameters): Promise<Partial<User>>;

  exchangeNativeSocial(
    parameters: ExchangeNativeSocialParameters
  ): Promise<Credentials>;

  ssoExchange(
    parameters: SSOExchangeParameters
  ): Promise<SessionTransferCredentials>;
}
