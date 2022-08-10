import {createContext} from 'react';

const stub = () => {
  throw new Error('No provider was set');
};

const initialContext = {
  error: null,
  user: null,
  isLoading: true,
  authorize: stub,
  getCredentials: stub,
  logout: stub,
};

const Auth0Context = createContext(initialContext);

export default Auth0Context;
