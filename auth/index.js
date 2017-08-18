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

/**
 * Auth0 Auth API
 *
 * @export Auth
 * @see https://auth0.com/docs/api/authentication
 * @class Auth
 */
export default class Auth {
  constructor(options = {}) {
    this.client = new Client(options);
    const { clientId } = options;
    if (!clientId) {
      throw new Error('Missing clientId in parameters');
    }
    this.domain = this.client.domain;
    this.clientId = clientId;
  }

  /**
   * Builds the full authorize endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/authorize`
   * @param {String} parameters.responseType type of the response to get from `/authorize`.
   * @param {String} parameters.redirectUri where the AS will redirect back after success or failure.
   * @param {String} parameters.state random string to prevent CSRF attacks.
   * @returns {String} authorize url with specified parameters to redirect to for AuthZ/AuthN.
   * @see https://auth0.com/docs/api/authentication#authorize-client
   *
   * @memberof Auth
   */
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

    /**
   * Builds the full logout endpoint url in the Authorization Server (AS) with given parameters.
   *
   * @param {Object} parameters parameters to send to `/v2/logout`
   * @param {Boolean} [parameters.federated] if the logout should include removing session for federated IdP.
   * @param {String} [parameters.clientId] client identifier of the one requesting the logout
   * @param {String} [parameters.returnTo] url where the user is redirected to after logout. It must be declared in you Auth0 Dashboard
   * @returns {String} logout url with specified parameters
   * @see https://auth0.com/docs/api/authentication#logout
   *
   * @memberof Auth
   */
  logoutUrl(parameters = {}) {
    const query = apply({
      parameters: {
        federated: { required: false },
        clientId: { required: false, toName: 'client_id' },
        returnTo: { required: false }
      }
    }, parameters);
    return this.client.url('/v2/logout', {...query});
  }

  /**
   * Exchanges a code obtained via `/authorize` (w/PKCE) for the user's tokens
   *
   * @param {Object} parameters parameters used to obtain tokens from a code
   * @param {String} parameters.code code returned by `/authorize`.
   * @param {String} parameters.redirectUri original redirectUri used when calling `/authorize`.
   * @param {String} parameters.verifier value used to generate the code challenge sent to `/authorize`.
   * @returns {Promise}
   * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
   *
   * @memberof Auth
   */
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

  /**
   * Performs Auth with user credentials using the Password Realm Grant
   *
   * @param {Object} parameters password realm parameters
   * @param {String} parameters.username user's username or email
   * @param {String} parameters.password user's password
   * @param {String} parameters.realm name of the Realm where to Auth (or connection name)
   * @param {String} [parameters.audience] identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/api-auth/grant/password#realm-support
   *
   * @memberof Auth
   */
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

  /**
   * Obtain new tokens using the Refresh Token obtained during Auth (requesting `offline_access` scope)
   *
   * @param {Object} parameters refresh token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
   *
   * @memberof Auth
   */
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

  /**
   * Revoke an issued refresh token
   *
   * @param {Object} parameters revoke token parameters
   * @param {String} parameters.refreshToken user's issued refresh token
   * @returns {Promise}
   *
   * @memberof Auth
   */
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

  /**
   * Return user information using an access token
   *
   * @param {Object} parameters user info parameters
   * @param {String} parameters.token user's access token
   * @returns {Promise}
   *
   * @memberof Auth
   */
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

  /**
   * Request an email with instructions to change password of a user
   *
   * @param {Object} parameters reset password parameters
   * @param {String} parameters.email user's email
   * @param {String} parameters.connection name of the connection of the user
   * @returns {Promise}
   *
   * @memberof Auth
   */
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

  /**
   *
   *
   * @param {Object} parameters create user parameters
   * @param {String} parameters.email user's email
   * @param {String} [parameters.username] user's username
   * @param {String} parameters.password user's password
   * @param {String} parameters.connection name of the database connection where to create the user
   * @param {String} [parameters.metadata] additional user information that will be stored in `user_metadata`
   * @returns {Promise}
   *
   * @memberof Auth
   */
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