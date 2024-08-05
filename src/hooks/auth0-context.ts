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
  ClearSessionOptions,
} from '../types';

export interface Auth0ContextInterface<TUser extends User = User>
  extends AuthState<TUser> {
  /**
   * Authorize the user using Auth0 Universal Login. See {@link WebAuth#authorize}
   * @param parameters The parameters that are sent to the `/authorize` endpoint.
   * @param options Options for customizing the SDK's handling of the authorize call
   */
  authorize: (
    parameters?: WebAuthorizeParameters,
    options?: WebAuthorizeOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Start the passwordless SMS login flow. See {@link Auth#passwordlessWithSMS}
   */
  sendSMSCode: (parameters: PasswordlessWithSMSOptions) => Promise<void>;
  /**
   * Authorize the user using a SMS code. See {@link Auth#loginWithSMS}
   */
  authorizeWithSMS: (
    parameters: LoginWithSMSOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Start the passwordless email login flow. See {@link Auth#passwordlessWithEmail}
   */
  sendEmailCode: (parameters: PasswordlessWithEmailOptions) => Promise<void>;
  /**
   * Authorize the user using an email code. See {@link Auth#loginWithEmail}
   */
  authorizeWithEmail: (
    parameters: LoginWithEmailOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Send a challenge for multi-factor authentication. See {@link Auth#multifactorChallenge}
   */
  sendMultifactorChallenge: (
    parameters: MultifactorChallengeOptions
  ) => Promise<void>;
  /**
   * Authorize the user using an Out Of Band authentication code. See {@link Auth#loginWithOOB}
   */
  authorizeWithOOB: (
    parameters: LoginWithOOBOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Autohrize the user using a One Time Password code. See {@link Auth#loginWithOTP}.
   */
  authorizeWithOTP: (
    parameters: LoginWithOTPOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Authorize the user using a multi-factor authentication Recovery Code. See {@link Auth#loginWithRecoveryCode}
   */
  authorizeWithRecoveryCode: (
    parameters: LoginWithRecoveryCodeOptions
  ) => Promise<Credentials | undefined>;
  /**
   * Whether the SDK currently holds valid, unexpired credentials.
   * @param minTtl The minimum time in seconds that the access token should last before expiration
   * @returns `true` if there are valid credentials. Otherwise, `false`.
   */
  hasValidCredentials: (minTtl?: number) => Promise<boolean>;
  /**
   * Clears the user's web session, credentials and logs them out. See {@link WebAuth#clearSession}
   * @param parameters Additional parameters to send to the Auth0 logout endpoint.
   * @param options Options for configuring the SDK's clear session behaviour.
   */
  clearSession: (
    parameters?: ClearSessionParameters,
    options?: ClearSessionOptions
  ) => Promise<void>;
  /**
   * Gets the user's credentials from the native credential store. If credentials have expired, they are automatically refreshed
   * by default. See {@link CredentialsManager#getCredentials}
   * @param scope The scopes used to get the credentials
   * @param minTtl The minimum time in seconds that the access token should last before expiration
   * @param parameters Any additional parameters to send in the request to refresh expired credentials.
   * @param forceRefresh If `true`, credentials are always refreshed regardless of their expiry, provided a valid refresh token is available.
   * @returns
   */
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, unknown>,
    forceRefresh?: boolean
  ) => Promise<Credentials | undefined>;
  /**
   * Clears the user's credentials without clearing their web session and logs them out.
   */
  clearCredentials: () => Promise<void>;
}

export interface AuthState<TUser extends User = User> {
  /**
   * An object representing the last exception
   */
  error: Error | null;
  /**
   * The user profile as decoded from the ID token after authentication
   */
  user: TUser | null;
  /**
   * A flag that is true until the state knows that a user is either logged in or not
   */
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
};

const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
