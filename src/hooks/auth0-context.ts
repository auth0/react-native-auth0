import { createContext } from 'react';
import {
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
  clearSession: (parameters: ClearSessionParameters) => Promise<void>;
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: object,
    forceRefresh?: boolean
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

const stub = () => {
  throw new Error('No provider was set');
};

const initialContext = {
  error: null,
  user: null,
  isLoading: true,
  authorize: stub,
  sendSMSCode: stub,
  authorizeWithSMS: stub,
  sendEmailCode: stub,
  authorizeWithEmail: stub,
  sendMultifactorChallenge: stub,
  authorizeWithOOB: stub,
  authorizeWithOTP: stub,
  authorizeWithRecoveryCode: stub,
  hasValidCredentials: stub,
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
