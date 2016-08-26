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

  describe('login', () => {

    const resourceOwner = `${baseUrl}/oauth/ro`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.login().catch(error => expect(error.message).toBe('must supply an email or username')));

    it('should fail with null email or username', () => auth.login(null, 'password', 'connection').catch(error => expect(error.message).toBe('must supply an email or username')));

    it('should fail with null password', () => auth.login('samples@auth0.com', null, 'connection').catch(error => expect(error.message).toBe('must supply a password')));

    it('should fail with null connection', () => auth.login('samples@auth0.com', 'password', null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should fail with non object parameters', () => auth.login('samples@auth0.com', 'password', 'connection', 'invalid').catch(error => expect(error.message).toBe('must supply parameters as an object')));

    it('should login with email/password', async () => {
      let expected = api.returnCredentials();
      const credentials = await auth.login('samples@auth0.com', 'password', 'Username-Password-Autentication');
      expect(credentials).toEqual(expected);
      expect(api.lastRequestBody(resourceOwner)).toEqual({
        'username': 'samples@auth0.com',
        'password': 'password',
        'connection': 'Username-Password-Autentication',
        'grant_type': 'password',
        'scope': 'openid',
        'client_id': clientId
      });
    });

    it('should login with email/password and custom scope', async () => {
      api.returnCredentials();
      const credentials = await auth.login('samples@auth0.com', 'password', 'Username-Password-Autentication', {'scope': 'openid email offline_access'});
      const body = api.lastRequestBody(resourceOwner);
      expect(body.scope).toBe('openid email offline_access');
    });

    it('should login with extra parameters', async () => {
      api.returnCredentials();
      await auth.login('samples@auth0.com', 'password', 'Username-Password-Autentication', {'state': 'state'});
      const body = api.lastRequestBody(resourceOwner);
      expect(body.state).toBe('state');
    });

    it('should report api error', () => {
      api.failResponse(resourceOwner, 'Bad Request', 'Bad Token');
      return auth.login('samples@auth0.com', 'password', 'Username-Password-Autentication')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });
});
