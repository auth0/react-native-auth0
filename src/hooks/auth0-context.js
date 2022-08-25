import {createContext} from 'react';

const stub = () => {
  throw new Error('No provider was set');
};

const initialContext = {
  error: null,
  user: null,
  authorize: stub,
  clearSession: stub,
  getCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext(initialContext);

export default Auth0Context;
