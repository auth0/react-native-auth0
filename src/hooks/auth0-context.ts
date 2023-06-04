import {createContext} from 'react';
import {
  ClearSessionOptions,
  ClearSessionParameters,
  Credentials,
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
  clearSession: (
    parameters: ClearSessionParameters,
    options: ClearSessionOptions,
  ) => Promise<void>;
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: object,
  ) => Promise<Credentials | undefined>;
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
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
