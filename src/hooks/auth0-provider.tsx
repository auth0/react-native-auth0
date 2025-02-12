import React, {
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  PropsWithChildren,
} from 'react';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import Auth0 from '../auth0';
import reducer from './reducer';
import {
  ClearSessionOptions,
  ClearSessionParameters,
  Credentials,
  LoginWithEmailOptions,
  LoginWithOOBOptions,
  LoginWithOTPOptions,
  LoginWithRecoveryCodeOptions,
  LoginWithSMSOptions,
  MultifactorChallengeOptions,
  PasswordlessWithEmailOptions,
  PasswordlessWithSMSOptions,
  User,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
  PasswordRealmOptions,
  ExchangeNativeSocialOptions,
  RevokeOptions,
  ResetPasswordOptions,
} from '../types';
import { CustomJwtPayload } from '../internal-types';
import { convertUser } from '../utils/userConversion';
import LocalAuthenticationOptions from 'src/credentials-manager/localAuthenticationOptions';

const initialState = {
  user: null,
  error: null,
  isLoading: true,
};

/**
 * @ignore
 */
const getIdTokenProfileClaims = (idToken: string): User => {
  const payload = jwtDecode<CustomJwtPayload>(idToken);
  return convertUser(payload);
};

/**
 * @ignore
 */
const finalizeScopeParam = (inputScopes?: string) => {
  const specifiedScopes = inputScopes?.split(' ').map((s) => s.trim()) || [];
  const scopeSet = new Set([
    ...specifiedScopes,
    ...['openid', 'profile', 'email'],
  ]);
  return Array.from(scopeSet).join(' ');
};

/**
 * Provides the Auth0Context to its child components.
 * @param {String} domain Your Auth0 domain
 * @param {String} clientId Your Auth0 client ID
 * @param {LocalAuthenticationOptions} localAuthenticationOptions The local auth options
 *
 * @example
 * ```ts
 * <Auth0Provider domain="YOUR AUTH0 DOMAIN" clientId="YOUR CLIENT ID">
 *   <App />
 * </Auth0Provider>
 * ```
 */
const Auth0Provider = ({
  domain,
  clientId,
  localAuthenticationOptions,
  children,
}: PropsWithChildren<{
  domain: string;
  clientId: string;
  localAuthenticationOptions?: LocalAuthenticationOptions;
}>) => {
  const client = useMemo(
    () => new Auth0({ domain, clientId, localAuthenticationOptions }),
    [domain, clientId, localAuthenticationOptions]
  );
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      let user: User | null = null;

      if (await client.credentialsManager.hasValidCredentials()) {
        try {
          const credentials = await client.credentialsManager.getCredentials();
          if (credentials) {
            user = getIdTokenProfileClaims(credentials.idToken);
          }
        } catch (error) {
          dispatch({ type: 'ERROR', error });
        }
      }

      dispatch({ type: 'INITIALIZED', user });
    })();
  }, [client]);

  const authorize = useCallback(
    async (
      parameters: WebAuthorizeParameters = {},
      options: WebAuthorizeOptions = {}
    ) => {
      try {
        parameters.scope = finalizeScopeParam(parameters.scope);
        const credentials: Credentials = await client.webAuth.authorize(
          parameters,
          options
        );
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const cancelWebAuth = useCallback(async () => {
    try {
      await client.webAuth.cancelWebAuth();
    } catch (error) {
      dispatch({ type: 'ERROR', error });
      return;
    }
  }, [client]);

  const clearSession = useCallback(
    async (
      parameters: ClearSessionParameters = {},
      options: ClearSessionOptions = {}
    ) => {
      try {
        await client.webAuth.clearSession(parameters, options);
        await client.credentialsManager.clearCredentials();
        dispatch({ type: 'LOGOUT_COMPLETE' });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const getCredentials = useCallback(
    async (
      scope?: string,
      minTtl: number = 0,
      parameters: Record<string, unknown> = {},
      forceRefresh: boolean = false
    ): Promise<Credentials | undefined> => {
      try {
        const credentials = await client.credentialsManager.getCredentials(
          scope,
          minTtl,
          parameters,
          forceRefresh
        );
        if (credentials.idToken) {
          const user = getIdTokenProfileClaims(credentials.idToken);
          dispatch({ type: 'SET_USER', user });
        }
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const sendSMSCode = useCallback(
    async (parameters: PasswordlessWithSMSOptions) => {
      try {
        await client.auth.passwordlessWithSMS(parameters);
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithSMS = useCallback(
    async (parameters: LoginWithSMSOptions) => {
      try {
        let scope = finalizeScopeParam(parameters?.scope);
        if (scope) {
          parameters = { ...parameters, scope };
        }
        const credentials = await client.auth.loginWithSMS(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const sendEmailCode = useCallback(
    async (parameters: PasswordlessWithEmailOptions) => {
      try {
        await client.auth.passwordlessWithEmail(parameters);
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithEmail = useCallback(
    async (parameters: LoginWithEmailOptions) => {
      try {
        let scope = finalizeScopeParam(parameters?.scope);
        if (scope) {
          parameters = { ...parameters, scope };
        }

        const credentials = await client.auth.loginWithEmail(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const sendMultifactorChallenge = useCallback(
    async (parameters: MultifactorChallengeOptions) => {
      try {
        await client.auth.multifactorChallenge(parameters);
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithOOB = useCallback(
    async (parameters: LoginWithOOBOptions) => {
      try {
        const credentials = await client.auth.loginWithOOB(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithOTP = useCallback(
    async (parameters: LoginWithOTPOptions) => {
      try {
        const credentials = await client.auth.loginWithOTP(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithRecoveryCode = useCallback(
    async (parameters: LoginWithRecoveryCodeOptions) => {
      try {
        const credentials = await client.auth.loginWithRecoveryCode(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithPasswordRealm = useCallback(
    async (parameters: PasswordRealmOptions) => {
      try {
        const credentials = await client.auth.passwordRealm(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const authorizeWithExchangeNativeSocial = useCallback(
    async (parameters: ExchangeNativeSocialOptions) => {
      try {
        const credentials = await client.auth.exchangeNativeSocial(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
        return credentials;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const revokeRefreshToken = useCallback(
    async (parameters: RevokeOptions) => {
      try {
        await client.auth.revoke(parameters);
        return;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const resetPassword = useCallback(
    async (parameters: ResetPasswordOptions) => {
      try {
        await client.auth.resetPassword(parameters);
        return;
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );

  const hasValidCredentials = useCallback(
    async (minTtl: number = 0) => {
      return await client.credentialsManager.hasValidCredentials(minTtl);
    },
    [client]
  );

  const clearCredentials = useCallback(async () => {
    try {
      await client.credentialsManager.clearCredentials();
      dispatch({ type: 'LOGOUT_COMPLETE' });
    } catch (error) {
      dispatch({ type: 'ERROR', error });
      return;
    }
  }, [client]);

  const contextValue = useMemo(
    () => ({
      ...state,
      authorize,
      cancelWebAuth,
      sendSMSCode,
      authorizeWithSMS,
      sendEmailCode,
      authorizeWithEmail,
      sendMultifactorChallenge,
      authorizeWithOOB,
      authorizeWithOTP,
      authorizeWithRecoveryCode,
      hasValidCredentials,
      clearSession,
      getCredentials,
      clearCredentials,
      authorizeWithPasswordRealm,
      authorizeWithExchangeNativeSocial,
      revokeRefreshToken,
      resetPassword,
    }),
    [
      state,
      authorize,
      cancelWebAuth,
      sendSMSCode,
      authorizeWithSMS,
      sendEmailCode,
      authorizeWithEmail,
      sendMultifactorChallenge,
      authorizeWithOOB,
      authorizeWithOTP,
      authorizeWithRecoveryCode,
      hasValidCredentials,
      clearSession,
      getCredentials,
      clearCredentials,
      authorizeWithPasswordRealm,
      authorizeWithExchangeNativeSocial,
      revokeRefreshToken,
      resetPassword,
    ]
  );

  return (
    <Auth0Context.Provider value={contextValue}>
      {children}
    </Auth0Context.Provider>
  );
};

Auth0Provider.propTypes = {
  domain: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default Auth0Provider;
