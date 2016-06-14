class AuthenticationAPI {
  constructor(clientId, baseUrl) {
    this.clientId = clientId;
    this.baseUrl = baseUrl;
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

    return fetch(`${this.baseUrl}/delegation`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json());
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
    if (token == null) {
      return Promise.reject("must supply a idToken");
    }

    return fetch(`${this.baseUrl}/tokeninfo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"id_token": token})
    })
    .then(response => response.json());    
  }

  userInfo(token) {
    if (token == null) {
      return Promise.reject("must supply an accessToken");
    }

    return fetch(`${this.baseUrl}/userinfo`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json());    
  }
}

module.exports = AuthenticationAPI;