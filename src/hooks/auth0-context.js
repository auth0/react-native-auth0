import {createContext} from 'react';

const stub = () => {
  throw new Error('No provider was set');
};

const initialContext = {
  error: null,
  user: null,
  isInitializing: true,
  authorize: stub,
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext(initialContext);

export default Auth0Context;
