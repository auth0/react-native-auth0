/// <reference types="react" />
import {
  ClearSessionOptions,
  ClearSessionParameters,
  LoginWithEmailOptions,
  LoginWithOOBOptions,
  LoginWithOTPOptions,
  LoginWithRecoveryCodeOptions,
  LoginWithSMSOptions,
  MultifactorChallengeOptions,
  PasswordlessWithEmailOptions,
  Credentials,
  User,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
  PasswordlessWithSMSOptions,
} from '../types';
import LocalAuthenticationStrategy from '../credentials-manager/localAuthenticationStrategy';
export interface Auth0ContextInterface<TUser extends User = User>
  extends AuthState<TUser> {
  authorize: (
    parameters: WebAuthorizeParameters,
    options: WebAuthorizeOptions
  ) => Promise<void>;
  sendSMSCode: (parameters: PasswordlessWithSMSOptions) => Promise<void>;
  authorizeWithSMS: (parameters: LoginWithSMSOptions) => Promise<void>;
  sendEmailCode: (parameters: PasswordlessWithEmailOptions) => Promise<void>;
  authorizeWithEmail: (parameters: LoginWithEmailOptions) => Promise<void>;
  sendMultifactorChallenge: (
    parameters: MultifactorChallengeOptions
  ) => Promise<void>;
  authorizeWithOOB: (parameters: LoginWithOOBOptions) => Promise<void>;
  authorizeWithOTP: (parameters: LoginWithOTPOptions) => Promise<void>;
  authorizeWithRecoveryCode: (
    parameters: LoginWithRecoveryCodeOptions
  ) => Promise<void>;
  hasValidCredentials: (minTtl: number) => Promise<boolean>;
  clearSession: (
    parameters: ClearSessionParameters,
    options: ClearSessionOptions
  ) => Promise<void>;
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, unknown>
  ) => Promise<Credentials | undefined>;
  clearCredentials: () => Promise<void>;
  requireLocalAuthentication: (
    title?: string,
    description?: string,
    cancelTitle?: string,
    fallbackTitle?: string,
    strategy?: LocalAuthenticationStrategy
  ) => Promise<void>;
}
export interface AuthState<TUser extends User = User> {
  error: Error | null;
  user: TUser | null;
  isLoading: boolean;
}
declare const Auth0Context: import('react').Context<
  Auth0ContextInterface<
    import('../types').Camelize<import('../internal-types').RawUser>
  >
>;
export default Auth0Context;
