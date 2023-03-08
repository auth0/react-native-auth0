import {createContext} from 'react';

const stub = () => {
  throw new Error('No provider was set');
};

const initialContext = {
  error: null,
  user: null,
  isLoading: true,
  authorize: stub,
  sendSMSCode: stub,
  authorizeWithSMS: stub,
  sendEmailCode: stub,
  authorizeWithEmail: stub,
  sendMultifactorChallenge: stub,
  authorizeWithOOB: stub,
  authorizeWithOTP: stub,
  authorizeWithRecoveryCode: stub,
  clearSession: stub,
  getCredentials: stub,
  clearCredentials: stub,
  requireLocalAuthentication: stub,
};

const Auth0Context = createContext(initialContext);

export default Auth0Context;
