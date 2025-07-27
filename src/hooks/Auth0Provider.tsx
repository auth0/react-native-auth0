import { useEffect, useReducer, useMemo, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import { Auth0Context, type Auth0ContextInterface } from './Auth0Context';
import { reducer } from './reducer';
import type {
  Auth0Options,
  Credentials,
  User,
  PasswordRealmParameters,
  WebAuthorizeParameters,
  ClearSessionParameters,
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
import type {
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
} from '../types/platform-specific';
import { Auth0User, AuthError } from '../core/models';
import Auth0 from '../index';

export const Auth0Provider = ({
  children,
  ...options
}: PropsWithChildren<Auth0Options>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const client = useMemo(() => new Auth0(options), []);
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const initialize = async () => {
      const hasRedirectParams =
        typeof window !== 'undefined' &&
        (window?.location?.search?.includes('code=') ||
          window?.location?.search?.includes('error=')) &&
        window?.location?.search?.includes('state=');
      if (hasRedirectParams) {
        try {
          // If it does, handle the redirect. This will exchange the code for tokens.
          await client.webAuth.handleRedirectCallback();
          // Clean the URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (e) {
          // If the redirect fails, dispatch an error.
          dispatch({ type: 'ERROR', error: e as AuthError });
        }
      }
      try {
        const credentials = await client.credentialsManager.getCredentials();
        const user = credentials
          ? Auth0User.fromIdToken(credentials.idToken)
          : null;
        dispatch({ type: 'INITIALIZED', user });
      } catch (e) {
        if ((e as AuthError).code === 'no_credentials') {
          dispatch({ type: 'INITIALIZED', user: null });
        } else {
          dispatch({ type: 'ERROR', error: e as AuthError });
        }
      }
    };
    initialize();
  }, [client]);

  // Generic wrapper for flows that result in login
  const loginFlow = useCallback(
    async (promise: Promise<Credentials>): Promise<Credentials> => {
      try {
        const credentials = await promise;
        const user = Auth0User.fromIdToken(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (e) {
        const error = e as AuthError;
        dispatch({ type: 'ERROR', error });
        throw error;
      }
    },
    [client]
  );

  // Generic wrapper for flows that don't result in login
  const voidFlow = useCallback(
    async (promise: Promise<void>): Promise<void> => {
      try {
        await promise;
      } catch (e) {
        const error = e as AuthError;
        dispatch({ type: 'ERROR', error });
        throw error;
      }
    },
    []
  );

  // --- Implementations ---

  const authorize = useCallback(
    (parameters?: WebAuthorizeParameters, opts?: NativeAuthorizeOptions) =>
      loginFlow(client.webAuth.authorize(parameters ?? {}, opts)),
    [client, loginFlow]
  );

  const clearSession = useCallback(
    async (
      parameters?: ClearSessionParameters,
      opts?: NativeClearSessionOptions
    ): Promise<void> => {
      try {
        // Step 1: Clear the locally stored credentials first.
        await client.credentialsManager.clearCredentials();

        // Step 2: Update the React state immediately for a snappy UX.
        dispatch({ type: 'LOGOUT_COMPLETE' });

        // Step 3: Clear the server-side session cookie.
        await client.webAuth.clearSession(parameters, opts);
      } catch (e) {
        const error = e as AuthError;
        dispatch({ type: 'ERROR', error });
        throw error;
      }
    },
    [client]
  );

  const getCredentials = useCallback(
    (
      scope?: string,
      minTtl?: number,
      parameters?: Record<string, unknown>,
      forceRefresh?: boolean
    ) =>
      loginFlow(
        client.credentialsManager.getCredentials(
          scope,
          minTtl,
          parameters,
          forceRefresh
        )
      ),
    [client, loginFlow]
  );

  const hasValidCredentials = useCallback(
    async (minTtl?: number): Promise<boolean> => {
      return await client.credentialsManager.hasValidCredentials(minTtl);
    },
    [client]
  );

  const cancelWebAuth = useCallback(
    () => voidFlow(client.webAuth.cancelWebAuth()),
    [client, voidFlow]
  );

  const loginWithPasswordRealm = useCallback(
    (parameters: PasswordRealmParameters) =>
      loginFlow(client.auth.passwordRealm(parameters)),
    [client, loginFlow]
  );

  const createUser = useCallback(
    async (parameters: CreateUserParameters): Promise<Partial<User>> => {
      try {
        return await client.auth.createUser(parameters);
      } catch (e) {
        const error = e as AuthError;
        dispatch({ type: 'ERROR', error });
        throw error;
      }
    },
    [client]
  );

  const resetPassword = useCallback(
    (parameters: ResetPasswordParameters) =>
      voidFlow(client.auth.resetPassword(parameters)),
    [client, voidFlow]
  );

  const authorizeWithExchangeNativeSocial = useCallback(
    (parameters: ExchangeNativeSocialParameters) =>
      loginFlow(client.auth.exchangeNativeSocial(parameters)),
    [client, loginFlow]
  );

  const sendEmailCode = useCallback(
    (parameters: PasswordlessEmailParameters) =>
      voidFlow(client.auth.passwordlessWithEmail(parameters)),
    [client, voidFlow]
  );

  const authorizeWithEmail = useCallback(
    (parameters: LoginEmailParameters) =>
      loginFlow(client.auth.loginWithEmail(parameters)),
    [client, loginFlow]
  );

  const sendSMSCode = useCallback(
    (parameters: PasswordlessSmsParameters) =>
      voidFlow(client.auth.passwordlessWithSMS(parameters)),
    [client, voidFlow]
  );

  const authorizeWithSMS = useCallback(
    (parameters: LoginSmsParameters) =>
      loginFlow(client.auth.loginWithSMS(parameters)),
    [client, loginFlow]
  );

  const sendMultifactorChallenge = useCallback(
    async (
      parameters: MfaChallengeParameters
    ): Promise<MfaChallengeResponse> => {
      try {
        return await client.auth.multifactorChallenge(parameters);
      } catch (e) {
        const error = e as AuthError;
        dispatch({ type: 'ERROR', error });
        throw error;
      }
    },
    [client]
  );

  const authorizeWithOOB = useCallback(
    (parameters: LoginOobParameters) =>
      loginFlow(client.auth.loginWithOOB(parameters)),
    [client, loginFlow]
  );

  const authorizeWithOTP = useCallback(
    (parameters: LoginOtpParameters) =>
      loginFlow(client.auth.loginWithOTP(parameters)),
    [client, loginFlow]
  );

  const authorizeWithRecoveryCode = useCallback(
    (parameters: LoginRecoveryCodeParameters) =>
      loginFlow(client.auth.loginWithRecoveryCode(parameters)),
    [client, loginFlow]
  );

  const revokeRefreshToken = useCallback(
    (parameters: RevokeOptions) => voidFlow(client.auth.revoke(parameters)),
    [client, voidFlow]
  );

  const contextValue = useMemo<Auth0ContextInterface>(
    () => ({
      ...state,
      authorize,
      clearSession,
      getCredentials,
      hasValidCredentials,
      cancelWebAuth,
      loginWithPasswordRealm,
      createUser,
      resetPassword,
      authorizeWithExchangeNativeSocial,
      sendEmailCode,
      authorizeWithEmail,
      sendSMSCode,
      authorizeWithSMS,
      sendMultifactorChallenge,
      authorizeWithOOB,
      authorizeWithOTP,
      authorizeWithRecoveryCode,
      revokeRefreshToken,
    }),
    [
      state,
      authorize,
      clearSession,
      getCredentials,
      hasValidCredentials,
      cancelWebAuth,
      loginWithPasswordRealm,
      createUser,
      resetPassword,
      authorizeWithExchangeNativeSocial,
      sendEmailCode,
      authorizeWithEmail,
      sendSMSCode,
      authorizeWithSMS,
      sendMultifactorChallenge,
      authorizeWithOOB,
      authorizeWithOTP,
      authorizeWithRecoveryCode,
      revokeRefreshToken,
    ]
  );

  return (
    <Auth0Context.Provider value={contextValue}>
      {children}
    </Auth0Context.Provider>
  );
};
