import type {
  Credentials,
  SessionTransferCredentials,
  User,
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
  ResetPasswordParameters,
  CreateUserParameters,
} from '../../types';

/**
 * Defines the contract for direct authentication methods that interact with Auth0's
 * Authentication API endpoints without a web-based redirect.
 */
export interface AuthenticationProvider {
  passwordRealm(parameters: PasswordRealmParameters): Promise<Credentials>;
  refreshToken(parameters: RefreshTokenParameters): Promise<Credentials>;
  userInfo(parameters: UserInfoParameters): Promise<User>;
  revoke(parameters: RevokeOptions): Promise<void>;
  exchange(parameters: ExchangeParameters): Promise<Credentials>;
  passwordlessWithEmail(parameters: PasswordlessEmailParameters): Promise<void>;
  passwordlessWithSMS(parameters: PasswordlessSmsParameters): Promise<void>;
  loginWithEmail(parameters: LoginEmailParameters): Promise<Credentials>;
  loginWithSMS(parameters: LoginSmsParameters): Promise<Credentials>;
  resetPassword(parameters: ResetPasswordParameters): Promise<void>;
  createUser(parameters: CreateUserParameters): Promise<Partial<User>>;

  exchangeNativeSocial(
    parameters: ExchangeNativeSocialParameters
  ): Promise<Credentials>;

  ssoExchange(
    parameters: SSOExchangeParameters
  ): Promise<SessionTransferCredentials>;
}
