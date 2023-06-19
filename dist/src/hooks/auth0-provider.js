import React, { useEffect, useReducer, useState } from 'react';
import { useCallback, useMemo } from 'react';
import jwtDecode from 'jwt-decode';
import Auth0Context from './auth0-context';
import { Auth0 } from '../auth0';
import reducer from './reducer';
import LocalAuthenticationStrategy from '../credentials-manager/localAuthenticationStrategy';
import { convertUser } from '../utils/userConversion';
const initialState = {
  user: null,
  error: null,
  isLoading: true,
};
/**
 * @ignore
 */
const getIdTokenProfileClaims = (idToken) => {
  const payload = jwtDecode(idToken);
  return convertUser(payload);
};
/**
 * @ignore
 */
const finalizeScopeParam = (inputScopes) => {
  const specifiedScopes = inputScopes?.split(' ').map((s) => s.trim()) || [];
  const scopeSet = new Set([
    ...specifiedScopes,
    ...['openid', 'profile', 'email'],
  ]);
  return Array.from(scopeSet).join(' ');
};
/**
 * Provides the Auth0Context to its child components.
 *
 * ```html
 * <Auth0Provider domain="YOUR AUTH0 DOMAIN" clientId="YOUR CLIENT ID">
 *   <App />
 * </Auth0Provider>
 * ```
 */
const Auth0Provider = ({ domain, clientId, children }) => {
  const [client] = useState(() => new Auth0({ domain, clientId }));
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    (async () => {
      let user = null;
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
    async (parameters = {}, options = {}) => {
      try {
        parameters.scope = finalizeScopeParam(parameters.scope);
        const credentials = await client.webAuth.authorize(parameters, options);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const clearSession = useCallback(
    async (parameters = {}, options = {}) => {
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
    async (scope, minTtl = 0, parameters = {}) => {
      try {
        const credentials = await client.credentialsManager.getCredentials(
          scope,
          minTtl,
          parameters
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
    async (parameters) => {
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
    async (parameters) => {
      try {
        let scope = finalizeScopeParam(parameters?.scope);
        if (scope) {
          parameters = { ...parameters, scope };
        }
        const credentials = await client.auth.loginWithSMS(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const sendEmailCode = useCallback(
    async (parameters) => {
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
    async (parameters) => {
      try {
        let scope = finalizeScopeParam(parameters?.scope);
        if (scope) {
          parameters = { ...parameters, scope };
        }
        const credentials = await client.auth.loginWithEmail(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const sendMultifactorChallenge = useCallback(
    async (parameters) => {
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
    async (parameters) => {
      try {
        const credentials = await client.auth.loginWithOOB(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const authorizeWithOTP = useCallback(
    async (parameters) => {
      try {
        const credentials = await client.auth.loginWithOTP(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const authorizeWithRecoveryCode = useCallback(
    async (parameters) => {
      try {
        const credentials = await client.auth.loginWithRecoveryCode(parameters);
        const user = getIdTokenProfileClaims(credentials.idToken);
        await client.credentialsManager.saveCredentials(credentials);
        dispatch({ type: 'LOGIN_COMPLETE', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    [client]
  );
  const hasValidCredentials = useCallback(
    async (minTtl = 0) => {
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
  const requireLocalAuthentication = useCallback(
    async (
      title,
      description,
      cancelTitle,
      fallbackTitle,
      strategy = LocalAuthenticationStrategy.deviceOwnerWithBiometrics
    ) => {
      try {
        await client.credentialsManager.requireLocalAuthentication(
          title,
          description,
          cancelTitle,
          fallbackTitle,
          strategy
        );
      } catch (error) {
        dispatch({ type: 'ERROR', error });
        return;
      }
    },
    []
  );
  const contextValue = useMemo(
    () => ({
      ...state,
      authorize,
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
      requireLocalAuthentication,
    }),
    [
      state,
      authorize,
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
      requireLocalAuthentication,
    ]
  );
  return (
    <Auth0Context.Provider value={contextValue}>
      {children}
    </Auth0Context.Provider>
  );
};
export default Auth0Provider;
