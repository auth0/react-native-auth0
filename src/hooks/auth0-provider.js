import * as React from 'react';
import PropTypes from 'prop-types';
import Auth0Context from './auth0-context';

const api = {
  error: null,
  user: null,
  isLoading: true,
  authorize: () => {
    console.log('authorizing..');
  },
  getCredentials: () => {
    console.log('Getting credentials...');
  },
  logout: () => {
    console.log('Logging out...');
  },
};

const Auth0Provider = options => {
  return (
    <Auth0Context.Provider value={api}>
      {options.children}
    </Auth0Context.Provider>
  );
};

Auth0Provider.propTypes = {
  domain: PropTypes.string.isRequired,
  clientId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default Auth0Provider;
