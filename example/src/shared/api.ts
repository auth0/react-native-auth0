import Auth0 from 'react-native-auth0';
import config from '../auth0-configuration';

if (!config.domain || !config.clientId) {
  throw new Error(
    'Missing Auth0 credentials. Set domain and clientId in src/auth0-configuration.js.'
  );
}

// Shared Auth0 class instance used by the *Class.tsx reference files.
const auth0 = new Auth0({
  domain: config.domain,
  clientId: config.clientId,
});

export default auth0;
