import Client from '../networking';
import { apply } from '../utils/whitelist';
import { toCamelCase } from '../utils/camel';
import AuthError from './error';

function responseHandler (response) {
  if (response.ok && response.json) {
    return toCamelCase(response.json);
  }
  throw new AuthError(response);
}

export default class Auth {
  constructor(options = {}) {
    this.client = new Client(options);
    const { clientId } = options;
    if (!clientId) {
      throw new Error('Missing clientId in parameters');
    }
    this.clientId = clientId;
  }

  authorizeUrl(parameters = {}) {
    const query = apply({
      parameters: {
        redirectUri: { required: true, toName: 'redirect_uri' },
        responseType: { required: true, toName: 'response_type' },
        state: { required: true }
      },
      whitelist: false
    }, parameters);
    return this.client.url('/authorize', {...query, client_id: this.clientId}, true);
  }

  exchange(parameters = {}) {
    const payload = apply({
      parameters: {
        code: { required: true },
        verifier: { required: true, toName: 'code_verifier'},
        redirectUri: { required: true, toName: 'redirect_uri' }
      }
    }, parameters);
    return this.client
      .post('/oauth/token', {...payload, client_id: this.clientId, grant_type: 'authorization_code'})
      .then(responseHandler);
  }

  realm(parameters = {}) {
    const payload = apply({
      parameters: {
        username: { required: true },
        password: { required: true },
        realm: { required: true },
        audience: { required: false },
        scope: { required: false }
      }
    }, parameters);
    return this.client
      .post('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm'})
      .then(responseHandler);
  }
}