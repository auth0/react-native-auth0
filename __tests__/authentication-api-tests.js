import AuthenticationAPI from '../auth/authentication-api';
import MockedAuthAPI from '../test-utils/mocks';

describe('AuthenticationAPI', () => {

  const baseUrl = 'https://samples.auth0.com';
  const clientId = 'CLIENT_ID';
  const api = new MockedAuthAPI(baseUrl);

  beforeEach(() => {
    api.reset();
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

    it('should fail with no token', () => {
      return auth.tokenInfo().catch(error => expect(error.message).toBe('must supply an idToken'));
    });

    it('should return token info', async () => {
      const profile = api.returnTokenInfo()
      const info = await auth.tokenInfo('JWT');
      expect(info).toEqual(profile);
    });

    it('should request tokenInfo with jwt', async () => {
      const profile = api.returnTokenInfo()
      const info = await auth.tokenInfo('JWT');
      expect(info).toEqual(profile);
      expect(api.lastRequestBody(tokenInfo).id_token).toBe('JWT');
    });

    it('should report api error', () => {
      api.failResponse(tokenInfo, 'Bad Request', 'Bad Token');
      return auth.tokenInfo('JWT')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

  describe('userInfo', () => {

    const userInfo = `${baseUrl}/userinfo`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with no token', () => {
      return auth.userInfo().catch(error => expect(error.message).toBe('must supply an accessToken'));
    });

    it('should return userInfo info', async () => {
      const profile = api.returnUserInfo()
      const info = await auth.userInfo('JWT');
      expect(info).toEqual(profile);
    });

    it('should request user info with jwt', async () => {
      const profile = api.returnUserInfo()
      const info = await auth.userInfo('JWT');
      expect(info).toEqual(profile);
      const headers = api.lastRequestHeaders(userInfo)
      expect(headers['Authorization']).toBe(`Bearer JWT`);
    });

    it('should report api error', () => {
      api.failResponse(userInfo, 'Bad Request', 'Bad Token');
      return auth.userInfo('JWT')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });
  
});
