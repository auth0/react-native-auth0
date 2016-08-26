import fetchMock from 'fetch-mock';

const mockedProfile = (email) => {
  return {
    "email": email,
    "id": Math.random().toString(36).substring(7)
  };
};

class Auth0API {
  constructor(baseUrl) {
      this.baseUrl = baseUrl;
  }

  lastRequestBody(url) { return JSON.parse(fetchMock.lastOptions(url).body); }
  lastRequestHeaders(url) { return fetchMock.lastOptions(url).headers; }

  mockResponse(url, body, status, method, headers = {}) {
    let response = {'status': status};
    if (body != null) {
      response.body = body;
    }
    const defaults = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, headers);
    fetchMock.mock(url, response, {method: method, headers: defaults});
  }

  failResponse(method, url, code, message) {
    this.mockResponse(url, {'code': code, 'description': message}, 400, method);
  }

  reset() {
    fetchMock.restore();
  }

  returnTokenInfo(email = 'samples@auth0.com') {
    const profile = mockedProfile(email);
    this.mockResponse(`${this.baseUrl}/tokeninfo`, profile, 200);
    return profile;
  }

  returnUserInfo(email = 'samples@auth0.com') {
    const profile = mockedProfile(email);
    this.mockResponse(`${this.baseUrl}/userinfo`, profile, 200);
    return profile;
  }

  returnCredentials() {
    const credentials = {
      'accessToken': Math.random().toString(36).substring(7),
      'token_type': 'bearer',
      'expires_in': Math.random()
    };
    this.mockResponse(`${this.baseUrl}/oauth/ro`, credentials, 200);
    return credentials;
  }

  returnDelegation() {
    const delegation = {
      'id_token': Math.random().toString(36).substring(7),
      'expires_in': Math.random(),
      'token_type': 'bearer'
    };
    this.mockResponse(`${this.baseUrl}/delegation`, delegation, 200);
    return delegation;
  }

  returnCreatedUser(email = 'samples@auth0.com') {
    const user = {
      'email': email
    };
    this.mockResponse(`${this.baseUrl}/dbconnections/signup`, user, 200);
    return user;
  }

  returnResetPassword() {
    this.mockResponse(`${this.baseUrl}/dbconnections/change_password`, null, 200);
  }
}

module.exports = Auth0API;
