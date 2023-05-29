import React, {useEffect, useReducer, useState, useRef} from 'react';
import {useCallback, useMemo} from 'react';
import jwtDecode, {JwtPayload} from 'jwt-decode';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import Auth0 from '../auth0';
import reducer from './reducer';
import {idTokenNonProfileClaims} from '../jwt/utils';
import {Credentials} from '../credentials-manager';

const initialState = {
  user: null,
  error: null,
  isLoading: true,
};

/**
 * @ignore
 */
const getIdTokenProfileClaims = (idToken: string) => {
  const payload: {[key: string]: any} = jwtDecode<JwtPayload>(idToken);

  const profileClaims = Object.keys(payload).reduce((profile: any, claim) => {
    if (!idTokenNonProfileClaims.has(claim)) {
      profile[claim] = payload[claim];
    }

    return profile;
  }, {});

  return profileClaims;
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
}: {
  domain: string;
  clientId: string;
  children: any;
}) => {
  const [client] = useState(() => new Auth0({domain, clientId}));
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      let user: any = null;

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
    async (...options: any[]) => {
      try {
        const params = options.length ? options[0] : {};
        const opts = options.length > 1 ? options[1] : {};
        const specifiedScopes =
          params?.scope?.split(' ').map((s: string) => s.trim()) || [];
        const scopeSet = new Set([
          ...specifiedScopes,
          ...['openid', 'profile', 'email'],
        ]);

        params.scope = Array.from(scopeSet).join(' ');

        const credentials: Credentials = await client.webAuth.authorize(
          params,
          opts,
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
    async (...options: any[]) => {
      try {
        await client.webAuth.clearSession(...options);
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
    async (...options: any) => {
      try {
        const credentials = await client.credentialsManager.getCredentials(
          ...options,
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

  const requireLocalAuthentication = useCallback(async (...options: any) => {
    try {
      await client.credentialsManager.requireLocalAuthentication(...options);
    } catch (error) {
      dispatch({type: 'ERROR', error});
      return;
    }
  }, []);

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
