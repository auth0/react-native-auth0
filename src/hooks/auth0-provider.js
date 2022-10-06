import React, {useEffect, useReducer, useState, useRef} from 'react';
import {useCallback, useMemo} from 'react';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import Auth0 from '../auth0';
import reducer from './reducer';
import {idTokenNonProfileClaims} from '../jwt/utils';

const initialState = {
  user: null,
  error: null,
};

/**
 * @ignore
 */
const getIdTokenProfileClaims = idToken => {
  const payload = jwt_decode(idToken);

  const profileClaims = Object.keys(payload).reduce((profile, claim) => {
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
const Auth0Provider = ({domain, clientId, children}) => {
  const [client] = useState(() => new Auth0({domain, clientId}));
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      let user = null;

      if (await client.credentialsManager.hasValidCredentials()) {
        const credentials = await client.credentialsManager.getCredentials();

        if (credentials) {
          user = getIdTokenProfileClaims(credentials.idToken);
        }
      }

      dispatch({type: 'INITIALIZED', user});
    })();
  }, [client]);

  const authorize = useCallback(
    async (...options) => {
      try {
        const opts = options.length ? options[0] : {};
        const specifiedScopes =
          opts?.scope?.split(' ').map(s => s.trim()) || [];
        const scopeSet = new Set([
          ...specifiedScopes,
          ...['openid', 'profile', 'email'],
        ]);

        opts.scope = Array.from(scopeSet).join(' ');

        const credentials = await client.webAuth.authorize(opts);
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
    async (...options) => {
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
    async (...options) => {
      try {
        return await client.credentialsManager.getCredentials(...options);
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const requireLocalAuthentication = useCallback(async (...options) => {
    try {
      await client.credentialsManager.requireLocalAuthentication(...options);
    } catch (error) {
      dispatch({type: 'ERROR', error});
      return;
    }
  });

  const contextValue = useMemo(
    () => ({
      ...state,
      authorize,
      clearSession,
      getCredentials,
      requireLocalAuthentication,
    }),
    [
      state,
      authorize,
      clearSession,
      getCredentials,
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
