import {createContext} from 'react';
import BaseError from '../utils/baseError';
import {
  ClearSessionOptions,
  ClearSessionParameters,
  LoginWithEmailOptions,
  LoginWithOobOptions,
  LoginWithOtpOptions,
  LoginWithRecoveryCodeOptions,
  LoginWithSmsOptions,
  MultiFactorChallengeOptions,
  PasswordlessWithEmailOptions,
  User,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
} from '../types';
import LocalAuthenticationStrategy from '../credentials-manager/localAuthenticationStrategy';

export interface Auth0ContextInterface<TUser extends User = User>
  extends AuthState<TUser> {
  authorize: (
    parameters: WebAuthorizeParameters,
    options: WebAuthorizeOptions,
  ) => Promise<void>;
  sendSMSCode: (parameters: PasswordlessWithEmailOptions) => Promise<void>;
  authorizeWithSMS: (parameters: LoginWithSmsOptions) => Promise<void>;
  sendEmailCode: (parameters: PasswordlessWithEmailOptions) => Promise<void>;
  authorizeWithEmail: (parameters: LoginWithEmailOptions) => Promise<void>;
  sendMultifactorChallenge: (
    parameters: MultiFactorChallengeOptions,
  ) => Promise<void>;
  authorizeWithOOB: (parameters: LoginWithOobOptions) => Promise<void>;
  authorizeWithOTP: (parameters: LoginWithOtpOptions) => Promise<void>;
  authorizeWithRecoveryCode: (
    parameters: LoginWithRecoveryCodeOptions,
  ) => Promise<void>;
  clearSession: (
    parameters: ClearSessionParameters,
    options: ClearSessionOptions,
  ) => Promise<void>;
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: object,
  ) => Promise<void>;
  clearCredentials: () => Promise<void>;
  requireLocalAuthentication: (
    title?: string,
    description?: string,
    cancelTitle?: string,
    fallbackTitle?: string,
    strategy?: LocalAuthenticationStrategy,
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
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
