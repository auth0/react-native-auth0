import Client from '../networking';
import { apply } from '../utils/whitelist';
import { toCamelCase } from '../utils/camel';
import AuthError from './authError';
import Auth0Error from './auth0Error';

function responseHandler (response, exceptions = {}) {
  if (response.ok && response.json) {
    return toCamelCase(response.json, exceptions);
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

  passwordRealm(parameters = {}) {
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

  refreshToken(parameters = {}) {
    const payload = apply({
      parameters: {
        refreshToken: { required: true, toName: 'refresh_token' },
        scope: { required: false }
      }
    }, parameters);
    return this.client
      .post('/oauth/token', {
        ...payload,
        client_id: this.clientId,
        grant_type: 'refresh_token'
      })
      .then(responseHandler);
  }

  revoke(parameters = {}) {
    const payload = apply({
      parameters: {
        refreshToken: { required: true, toName: 'token' }
      }
    }, parameters);
    return this.client
      .post('/oauth/revoke', {
        ...payload,
        client_id: this.clientId,
      })
      .then((response) => {
        if (response.ok) {
          return {};
        }
        throw new AuthError(response);
      });
  }

  userInfo(parameters = {}) {
    const payload = apply({
      parameters: {
        token: { required: true }
      }
    }, parameters);
    const {baseUrl, telemetry} = this.client;
    const client = new Client({baseUrl, telemetry, token: payload.token});
    const claims = ["sub", "name", "given_name", "family_name", "middle_name", "nickname", "preferred_username", "profile", "picture", "website", "email", "email_verified", "gender", "birthdate", "zoneinfo", "locale", "phone_number", "phone_number_verified", "address", "updated_at"];
    return client
      .get('/userinfo')
      .then((response) => responseHandler(response, {attributes: claims, whitelist: true}));
  }

  resetPassword(parameters = {}) {
    const payload = apply({
      parameters: {
        email: { required: true },
        connection: { required: true }
      }
    }, parameters);
    return this.client
      .post('/dbconnections/change_password', {
        ...payload,
        client_id: this.clientId
      })
      .then((response) => {
        if (response.ok) {
          return {};
        }
        throw new AuthError(response);
      });
  }

  createUser(parameters = {}) {
    const payload = apply({
      parameters: {
        email: { required: true },
        password: { required: true },
        connection: { required: true },
        username: { required: false },
        metadata: { required: false, toName: 'user_metadata' }
      }
    }, parameters);

    return this.client
      .post('/dbconnections/signup', {
        ...payload,
        client_id: this.clientId
      })
      .then((response) => {
        if (response.ok && response.json) {
          return toCamelCase(response.json);
        }
        throw new Auth0Error(response);
      });
  }
}