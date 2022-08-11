import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';
import WebAuth from '../webauth';
import {useCallback} from 'react';

const Auth0Provider = ({domain, clientId, children}) => {
  const [client] = useState(new WebAuth({domain, clientId}));

  const api = {
    error: null,
    user: null,
    isLoading: true,
    authorize: useCallback(() => console.log('Calling authorize')),
    logout: useCallback(() => {
      console.log('Logging out...');
    }),
  };

  return <Auth0Context.Provider value={api}>{children}</Auth0Context.Provider>;
};

Auth0Provider.propTypes = {
  domain: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default Auth0Provider;
