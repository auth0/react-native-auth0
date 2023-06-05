import React, {useEffect, useReducer, useState, PropsWithChildren} from 'react';
import {useCallback, useMemo} from 'react';
import jwtDecode, {JwtPayload} from 'jwt-decode';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import Auth0 from '../auth0';
import reducer from './reducer';
import {
  ClearSessionOptions,
  ClearSessionParameters,
  Credentials,
  User,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
} from '../types';
import LocalAuthenticationStrategy from '../credentials-manager/localAuthenticationStrategy';
import {CustomJwtPayload} from '../internal-types';
import {convertUser} from '../utils/userConversion';

const initialState = {
  user: null,
  error: null,
  isLoading: true,
};

/**
 * @ignore
 */
const getIdTokenProfileClaims = (idToken: string): User => {
  const payload: CustomJwtPayload = jwtDecode<JwtPayload>(idToken);
  return convertUser(payload);
};

/**
 * Provides the Auth0Context to its child components.
 * @param {String} domain Your Auth0 domain
 * @param {String} clientId Your Auth0 client ID
 *
 * @example
 * <Auth0Provider domain="YOUR AUTH0 DOMAIN" clientId="YOUR CLIENT ID">
 *   <App />
 * </Auth0Provider>
 */
const Auth0Provider = ({
  domain,
  clientId,
  children,
}: PropsWithChildren<{domain: string; clientId: string}>) => {
  const [client] = useState(() => new Auth0({domain, clientId}));
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
          dispatch({type: 'ERROR', error});
        }
      }

      dispatch({type: 'INITIALIZED', user});
    })();
  }, [client]);

  const authorize = useCallback(
    async (
      parameters: WebAuthorizeParameters = {},
      options: WebAuthorizeOptions = {},
    ) => {
      try {
        const specifiedScopes =
          parameters.scope?.split(' ').map((s: string) => s.trim()) || [];
        const scopeSet = new Set([
          ...specifiedScopes,
          ...['openid', 'profile', 'email'],
        ]);

        parameters.scope = Array.from(scopeSet).join(' ');

        const credentials: Credentials = await client.webAuth.authorize(
          parameters,
          options,
        );
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const clearSession = useCallback(
    async (
      parameters: ClearSessionParameters = {},
      options: ClearSessionOptions = {},
    ) => {
      try {
        await client.webAuth.clearSession(parameters, options);
        await client.credentialsManager.clearCredentials();
        dispatch({type: 'LOGOUT_COMPLETE'});
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const getCredentials = useCallback(
    async (
      scope?: string,
      minTtl: number = 0,
      parameters: object = {},
    ): Promise<Credentials | undefined> => {
      try {
        const credentials = await client.credentialsManager.getCredentials(
          scope,
          minTtl,
          parameters,
        );
        if (credentials.idToken) {
          const user = getIdTokenProfileClaims(credentials.idToken);
          dispatch({type: 'SET_USER', user});
        }
        return credentials;
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const clearCredentials = useCallback(async () => {
    try {
      await client.credentialsManager.clearCredentials();
      dispatch({type: 'LOGOUT_COMPLETE'});
    } catch (error) {
      dispatch({type: 'ERROR', error});
      return;
    }
  }, [client]);

  const requireLocalAuthentication = useCallback(
    async (
      title?: string,
      description?: string,
      cancelTitle?: string,
      fallbackTitle?: string,
      strategy = LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
    ) => {
      try {
        await client.credentialsManager.requireLocalAuthentication(
          title,
          description,
          cancelTitle,
          fallbackTitle,
          strategy,
        );
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      authorize,
      clearSession,
      getCredentials,
      clearCredentials,
      requireLocalAuthentication,
    }),
    [
      state,
      authorize,
      clearSession,
      getCredentials,
      clearCredentials,
      requireLocalAuthentication,
    ],
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
