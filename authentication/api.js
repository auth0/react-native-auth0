import {
  json,
  request
} from '../utils/networking';

import {
  nonNull,
  anObject,
  anyOf
} from '../utils/validation';

import { isEmpty } from '../utils/helper';

export default class AuthenticationAPI {
  constructor(clientId, baseUrl) {
    this.clientId = clientId;
    this.baseUrl = baseUrl;
  }

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
      return request('POST', `${this.baseUrl}/dbconnections/change_password`, payload);
    });
  }

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

  refreshToken(refreshToken, parameters = {}) {
    return Promise.all([
      nonNull(refreshToken, 'must supply a refreshToken'),
      anObject(parameters, 'must supply parameters as an object')
    ]).then(([refreshToken, parameters]) => this.delegation(refreshToken, 'refresh_token', 'app', parameters));
  }

  tokenInfo(token) {
    return nonNull(token, 'must supply an idToken')
      .then(token => json('POST', `${this.baseUrl}/tokeninfo`, {'id_token': token}));
  }

  userInfo(token) {
    return nonNull(token, 'must supply an accessToken').then(token => {
      return json('GET', `${this.baseUrl}/userinfo`, null, {
        'Authorization': `Bearer ${token}`
      });
    });
  }
};
