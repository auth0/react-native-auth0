import fetchMock from 'fetch-mock';

const mockedProfile = (email) => {
  return {
    "email": email,
    "id": Math.random().toString(36).substring(7)
  };
};

class AuthAPI {
  constructor(baseUrl) {
      this.baseUrl = baseUrl;
  }

  lastRequestBody(url) { return JSON.parse(fetchMock.lastOptions(url).body); }
  lastRequestHeaders(url) { return fetchMock.lastOptions(url).headers; }

  mockResponse(url, body, status, method, headers = {}) {
    const response = {'body': body, 'status': status};
    const defaults = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, headers);
    fetchMock.mock(url, response, {method: method, headers: defaults});
  }

  failResponse(url, code, message) {
    this.mockResponse(url, {'code': code, 'description': message}, 400);
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
}

module.exports = AuthAPI;
