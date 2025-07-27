import type {
  Credentials,
  User,
  MfaChallengeResponse,
  PasswordRealmParameters,
  RefreshTokenParameters,
  UserInfoParameters,
  RevokeOptions,
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
  passwordlessWithEmail(parameters: PasswordlessEmailParameters): Promise<void>;
  passwordlessWithSMS(parameters: PasswordlessSmsParameters): Promise<void>;
  loginWithEmail(parameters: LoginEmailParameters): Promise<Credentials>;
  loginWithSMS(parameters: LoginSmsParameters): Promise<Credentials>;
  loginWithOTP(parameters: LoginOtpParameters): Promise<Credentials>;
  loginWithOOB(parameters: LoginOobParameters): Promise<Credentials>;
  loginWithRecoveryCode(
    parameters: LoginRecoveryCodeParameters
  ): Promise<Credentials>;
  multifactorChallenge(
    parameters: MfaChallengeParameters
  ): Promise<MfaChallengeResponse>;
  resetPassword(parameters: ResetPasswordParameters): Promise<void>;
  createUser(parameters: CreateUserParameters): Promise<Partial<User>>;

  exchangeNativeSocial(
    parameters: ExchangeNativeSocialParameters
  ): Promise<Credentials>;
}
