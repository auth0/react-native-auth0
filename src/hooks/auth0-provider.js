import React, {useReducer, useState} from 'react';
import {useCallback, useMemo} from 'react';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import Auth0 from '../../index';
import reducer from './reducer';
import {idTokenNonProfileClaims} from '../jwt/utils';

const initialState = {
  isLoading: true,
  user: null,
  error: null,
};

/**
 * @ignore
 */
const getIdTokenProfileClaims = idToken => {
  const payload = jwt_decode(idToken);

  const profileClaims = Object.keys(payload).reduce((profile, claim) => {
    if (!idTokenNonProfileClaims.includes(claim)) {
      profile[claim] = payload[claim];
    }

    return profile;
  }, {});

  return profileClaims;
};

const Auth0Provider = ({domain, clientId, children}) => {
  const [client] = useState(new Auth0({domain, clientId}));
  const [state, dispatch] = useReducer(reducer, initialState);

  const authorize = useCallback(
    async (...options) => {
      const credentials = await client.webAuth.authorize(...options);
      const claims = getIdTokenProfileClaims(credentials.idToken);

      dispatch({type: 'LOGIN_COMPLETE', user: claims});
    },
    [client],
  );

  const clearSession = useCallback(
    async (...options) => {
      await client.webAuth.clearSession(...options);
      dispatch({type: 'LOGOUT_COMPLETE'});
    },
    [client],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      authorize,
      clearSession,
    }),
    [state, authorize, clearSession],
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
