import {
  checkStatus,
  headers,
  jsonRequest
} from '../utils/networking';

import {
  nonNull,
  anObject
} from '../utils/validation';

class AuthenticationAPI {
  constructor(clientId, baseUrl) {
    this.clientId = clientId;
    this.baseUrl = baseUrl;
  }

  login(usernameOrEmail, password, connection, parameters = { 'scope': 'openid' }) {
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

  delegation(options) {
    let payload = {
      "client_id": this.clientId,
      "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    };

    let token = options.refreshToken || options.idToken;
    if (token == null) {
        return Promise.reject("must supply either a refreshToken or idToken");
    }

    let attrName = "refresh_token";
    if (options.refreshToken == null) {
      attrName = "id_token";
    }

    payload[attrName] = token;

    if (options.apiType != null) {
      payload["api_type"] = options.apiType;
    }

    if (options.target != null) {
      payload["target"] = options.target;
    }

    if (options.scope != null) {
      payload["scope"] = options.scope;
    }

    if (options.nonce != null) {
      payload["nonce"] = options.nonce;
    }

    return jsonRequest('POST', `${this.baseUrl}/delegation`, payload);
  }

  refreshToken(refreshToken, options) {
    const delegationOptions = Object.assign({}, options);
    delegationOptions.refreshToken = refreshToken;
    delegationOptions.apiType = "app";
    return this.delegation(delegationOptions)
    .then(json => {
      return {
        idToken: json.id_token,
        expiresIn: json.expires_in,
        tokenType: json.token_type
      };
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
      })
    });
  }
}

module.exports = AuthenticationAPI;
