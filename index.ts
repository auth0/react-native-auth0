export { TimeoutError } from './src/utils/fetchWithTimeout';
export { default as useAuth0 } from './src/hooks/use-auth0';
export { default as Auth0Provider } from './src/hooks/auth0-provider';
export { default as LocalAuthenticationStrategy } from './src/credentials-manager/localAuthenticationStrategy';

import Auth0 from './src/auth0';
export default Auth0;
