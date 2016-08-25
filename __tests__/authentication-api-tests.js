jest.unmock('../authentication-api');
jest.unmock('../authentication-error');

import AuthenticationAPI from '../authentication-api';
import fetchMock from 'fetch-mock';

const mockedProfile = (email) => {
  return {
    "email": email,
    "id": Math.random().toString(36).substring(7)
  };
};

const lastRequestBody = url => JSON.parse(fetchMock.lastOptions(url).body);
const lastRequestHeaders = url => fetchMock.lastOptions(url).headers;

const mockResponse = (url, body, status, method, headers = {}) => {
  const response = {'body': body, 'status': status};
  const defaults = Object.assign({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }, headers);
  fetchMock.mock(url, response, {method: method, headers: defaults});
};

const failResponse = (url, code, message) => {
  mockResponse(url, {'code': code, 'description': message}, 400);
};

describe('AuthenticationAPI', () => {

  const baseUrl = 'https://samples.auth0.com';
  const clientId = 'CLIENT_ID';

  beforeEach(() => {
    fetchMock.restore();
  });

  describe('constructor', () => {

    it('should create new with baseUrl and clientId', () => {
      expect(new AuthenticationAPI(clientId, baseUrl)).not.toBeNull();
    });

    it('should have baseUrl', () => {
      const auth = new AuthenticationAPI(clientId, baseUrl);
      expect(auth.baseUrl).toBe(baseUrl);
    });

    it('should have clientId', () => {
      const auth = new AuthenticationAPI(clientId, baseUrl);
      expect(auth.clientId).toBe(clientId);
    });

  });

  describe('tokenInfo', () => {

    const tokenInfo = `${baseUrl}/tokeninfo`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    const returnTokenInfo = (email = 'samples@auth0.com') => {
      const profile = mockedProfile(email);
      mockResponse(tokenInfo, profile, 200);
      return profile;
    };

    it('should fail with no token', () => {
      return auth.tokenInfo().catch(error => expect(error.message).toBe('must supply an idToken'));
    });

    it('should return token info', async () => {
      const profile = returnTokenInfo()
      const info = await auth.tokenInfo('JWT');
      expect(info).toEqual(profile);
    });

    it('should request tokenInfo with jwt', async () => {
      const profile = returnTokenInfo()
      const info = await auth.tokenInfo('JWT');
      expect(info).toEqual(profile);
      expect(lastRequestBody(tokenInfo).id_token).toBe('JWT');
    });

    it('should report api error', () => {
      failResponse(tokenInfo, 'Bad Request', 'Bad Token');
      return auth.tokenInfo('JWT')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

  describe('userInfo', () => {

    const userInfo = `${baseUrl}/userinfo`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    const returnUserInfo = (email = 'samples@auth0.com') => {
      const profile = mockedProfile(email);
      mockResponse(userInfo, profile, 200);
      return profile;
    };

    it('should fail with no token', () => {
      return auth.userInfo().catch(error => expect(error.message).toBe('must supply an accessToken'));
    });

    it('should return userInfo info', async () => {
      const profile = returnUserInfo()
      const info = await auth.userInfo('JWT');
      expect(info).toEqual(profile);
    });

    it('should request user info with jwt', async () => {
      const profile = returnUserInfo()
      const info = await auth.userInfo('JWT');
      expect(info).toEqual(profile);
      const headers = lastRequestHeaders(userInfo)
      expect(headers['Authorization']).toBe(`Bearer JWT`);
    });

    it('should report api error', () => {
      failResponse(userInfo, 'Bad Request', 'Bad Token');
      return auth.userInfo('JWT')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

});
