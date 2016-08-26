import {
  jsonRequest
} from '../utils/networking';

import {
  nonNull,
  anObject,
  anyOf
} from '../utils/validation';

class AuthenticationAPI {
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
      return jsonRequest('POST', `${this.baseUrl}/oauth/ro`, payload);
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
      return jsonRequest('POST', `${this.baseUrl}/delegation`, payload);
    });
  }

  refreshToken(refreshToken, parameters = {}) {
    return Promise.all([
      nonNull(refreshToken, 'must supply a refreshToken'),
      anObject(parameters, 'must supply parameters as an object')
    ]).then(([refreshToken, parameters]) => {
      return this.delegation(refreshToken, 'refresh_token', 'app', parameters)
      .then(json => {
        return {
          idToken: json.id_token,
          expiresIn: json.expires_in,
          tokenType: json.token_type
        };
      });
    });
  }

  tokenInfo(token) {
    return nonNull(token, 'must supply an idToken').then(token => {
      return jsonRequest('POST', `${this.baseUrl}/tokeninfo`, {'id_token': token})
    });
  }

  userInfo(token) {
    return nonNull(token, 'must supply an accessToken').then(token => {
      return jsonRequest('GET', `${this.baseUrl}/userinfo`, null, {
        'Authorization': `Bearer ${token}`
      });
    });
  }
}

module.exports = AuthenticationAPI;
