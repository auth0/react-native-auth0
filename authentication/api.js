import {
  json,
} from '../utils/networking';

import {
  nonNull,
  anObject,
  anyOf
} from '../utils/validation';

import { isEmpty } from '../utils/helper';

export default class AuthenticationAPI {

  /**
   * @param  {String} clientId
   * @param  {String} baseUrl of Auth API
   * @return {AuthenticationAPI}
   */
  constructor(clientId, baseUrl) {
    this.clientId = clientId;
    this.baseUrl = baseUrl;
  }

  /**
   * Login a user with a specific connection with email & password
   * @param  {String} usernameOrEmail of the user
   * @param  {String} password of the user
   * @param  {String} connection name used to authenticate
   * @param  {Object} parameters that are also sent in the authentication request. By default only sends scope with the value 'openid'.
   * @return {Promise}
   */
  login(usernameOrEmail, password, connection, parameters = { scope: 'openid' }) {
    return Promise.all([
      nonNull(usernameOrEmail, 'must supply an email or username'),
      nonNull(password, 'must supply a password'),
      nonNull(connection, 'must supply a connection name'),
      anObject(parameters, 'must supply parameters as an object')
    ]).then(([usernameOrEmail, password, connection, parameters]) => {
      const payload = Object.assign({
        'username': usernameOrEmail,
        'password': password,
        'connection': connection,
        'grant_type': 'password',
        'client_id': this.clientId
      }, parameters);
      return json('POST', `${this.baseUrl}/oauth/ro`, payload);
    });
  }

  /**
   * Creates a user in a Database connection
   * @param  {String} email of the user to create
   * @param  {String} username of the user or null if not needed.
   * @param  {String} password of the user
   * @param  {String} connection name where the user will be created
   * @param  {Object} metadata added to 'user_metadata' of the user
   * @return {Promise}
   */
  createUser(email, username, password, connection, metadata = {}) {
    return Promise.all([
      nonNull(email, 'must supply an email'),
      nonNull(password, 'must supply a password'),
      nonNull(connection, 'must supply a connection name'),
      anObject(metadata, 'must supply metadata as an object')
    ]).then(([email, password, connection, metadata]) => {
      let payload = {
        'email': email,
        'password': password,
        'connection': connection,
        'client_id': this.clientId
      };
      if (!isEmpty(metadata)) {
        payload['user_metadata'] = metadata;
      }
      if (username != null) {
        payload['username'] = username;
      }
      return json('POST', `${this.baseUrl}/dbconnections/signup`, payload);
    });
  }

  /**
   * Sends a reset password request for a given user (by email)
   * @param  {String} email of the user where the reset password email will be sent
   * @param  {String} connection name where the user was created.
   * @return {Promise}
   */
  resetPassword(email, connection) {
    return Promise.all([
      nonNull(email, 'must supply an email'),
      nonNull(connection, 'must supply a connection name')
    ]).then(([email, connection]) => {
      const payload = {
        'email': email,
        'connection': connection,
        'client_id': this.clientId
      };
      return json('POST', `${this.baseUrl}/dbconnections/change_password`, payload);
    });
  }

 /**
  * Calls delegation endpoint to change a user token for another one.
  * @param  {String} token of the user. Either a refresh or id token
  * @param  {String} type of the token used. It must be either 'id_token' or 'refresh_token'
  * @param  {String} api type that will be used for delegation. e.g. 'app' if you want to obtain a new id_token
  * @param  {Object} parameters that are also sent in the delegation request. By default is an empty object
  * @return {Promise}
  */
  delegation(token, type, api, parameters = {}) {
    return Promise.all([
      nonNull(token, 'must supply either a refreshToken or idToken'),
      anyOf(type, ['refresh_token', 'id_token'], 'must be either refresh_token or id_token'),
      nonNull(api, 'must supply an api type'),
      anObject(parameters, 'must supply parameters as an object')
    ]).then(([token, type, api, parameters]) => {
      let payload = Object.assign({
        'api_type': api,
        'client_id': this.clientId,
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
      }, parameters);
      payload[type] = token;
      return json('POST', `${this.baseUrl}/delegation`, payload);
    });
  }

  /**
   * Calls delegation with a refresh_token to obtain a new id_token
   * @param  {String} refreshToken of the user
   * @param  {Object} parameters that can also be sent in delegation request
   * @return {Promise}
   */
  refreshToken(refreshToken, parameters = {}) {
    return Promise.all([
      nonNull(refreshToken, 'must supply a refreshToken'),
      anObject(parameters, 'must supply parameters as an object')
    ]).then(([refreshToken, parameters]) => this.delegation(refreshToken, 'refresh_token', 'app', parameters));
  }

  /**
   * Returns info of an id_token
   * @param  {String}
   * @return {Promise}
   */
  tokenInfo(token) {
    return nonNull(token, 'must supply an idToken')
      .then(token => json('POST', `${this.baseUrl}/tokeninfo`, {'id_token': token}));
  }

  /**
   * Returns user info using access_token
   * @param  {String} token
   * @return {Promise}
   */
  userInfo(token) {
    return nonNull(token, 'must supply an accessToken').then(token => {
      return json('GET', `${this.baseUrl}/userinfo`, null, {
        'Authorization': `Bearer ${token}`
      });
    });
  }

  token(code, verifier, redirectUri) {
    return Promise.all([
      nonNull(code, 'must supply a code'),
      nonNull(verifier, 'must supply a verifier'),
      nonNull(redirectUri, 'must supply a redirectUri')
    ]).then(([code, verifier, redirectUri]) => json('POST', `${this.baseUrl}/oauth/token`, {
        code,
        code_verifier: verifier,
        client_id: this.clientId,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    }));
  }
};
