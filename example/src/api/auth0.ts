import Auth0 from 'react-native-auth0';
import config from '../auth0-configuration';

const AUTH0_DOMAIN = config.domain;
const AUTH0_CLIENT_ID = config.clientId;

if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
  throw new Error(
    'Missing Auth0 credentials. Please add AUTH0_DOMAIN and AUTH0_CLIENT_ID to your environment variables.'
  );
}

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
});

export default auth0;
