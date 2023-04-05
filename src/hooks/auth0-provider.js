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
  isLoading: true,
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
 * @ignore
 */
const finalizeScopeParam = inputScopes => {
  const specifiedScopes = inputScopes?.split(' ').map(s => s.trim()) || [];
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
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        const opts = options.length > 1 ? options[1] : {};
        params.scope = finalizeScopeParam(params?.scope);

        const credentials = await client.webAuth.authorize(params, opts);
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
        const credentials = await client.credentialsManager.getCredentials(...options);
        if(credentials.idToken) {
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

  const sendSMSCode = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        await client.auth.passwordlessWithSMS(params);
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const authorizeWithSMS = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        params.scope = finalizeScopeParam(params?.scope);

        const credentials = await client.auth.loginWithSMS(params);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        console.log(error);
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const sendEmailCode = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        await client.auth.passwordlessWithEmail(params);
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const authorizeWithEmail = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        params.scope = finalizeScopeParam(params?.scope);

        const credentials = await client.auth.loginWithEmail(params);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        console.log(error);
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const sendMultifactorChallenge = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};
        await client.auth.multifactorChallenge(params);
      } catch (error) {
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const authorizeWithOOB = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};

        const credentials = await client.auth.loginWithOOB(params);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        console.log(error);
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const authorizeWithOTP = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};

        const credentials = await client.auth.loginWithOTP(params);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        console.log(error);
        dispatch({type: 'ERROR', error});
        return;
      }
    },
    [client],
  );

  const authorizeWithRecoveryCode = useCallback(
    async (...options) => {
      try {
        const params = options.length ? options[0] : {};

        const credentials = await client.auth.loginWithRecoveryCode(params);
        const user = getIdTokenProfileClaims(credentials.idToken);

        await client.credentialsManager.saveCredentials(credentials);
        dispatch({type: 'LOGIN_COMPLETE', user});
      } catch (error) {
        console.log(error);
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
      sendSMSCode,
      authorizeWithSMS,
      sendEmailCode,
      authorizeWithEmail,
      sendMultifactorChallenge,
      authorizeWithOOB,
      authorizeWithOTP,
      authorizeWithRecoveryCode,
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
