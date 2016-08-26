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

  describe('delegation', () => {

    const delegation = `${baseUrl}/delegation`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.delegation().catch(error => expect(error.message).toBe('must supply either a refreshToken or idToken')));

    it('should fail with null token', () => auth.delegation(null, 'refresh_token', 'app').catch(error => expect(error.message).toBe('must supply either a refreshToken or idToken')));

    it('should fail with null type', () => auth.delegation('token', null, 'app').catch(error => expect(error.message).toBe('must be either refresh_token or id_token')));

    it('should fail with invalid type', () => auth.delegation('token', 'non valid type', 'app').catch(error => expect(error.message).toBe('must be either refresh_token or id_token')));

    it('should fail with null api', () => auth.delegation('token', 'refresh_token', null).catch(error => expect(error.message).toBe('must supply an api type')));

    it('should fail with non object parameters', () => auth.delegation('token', 'refresh_token', 'app', 'invalid').catch(error => expect(error.message).toBe('must supply parameters as an object')));

    it('should call delegation with refresh_token', async () => {
      let expected = api.returnDelegation();
      const response = await auth.delegation('token', 'refresh_token', 'app');
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(delegation)).toEqual({
        'refresh_token': 'token',
        'api_type': 'app',
        'client_id': clientId,
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
      });
    });

    it('should call delegation with id_token', async () => {
      let expected = api.returnDelegation();
      const response = await auth.delegation('token', 'id_token', 'my-app');
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(delegation)).toEqual({
        'id_token': 'token',
        'api_type': 'my-app',
        'client_id': clientId,
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
      });
    });

    it('should call delegation with extra parameters', async () => {
      api.returnDelegation();
      await auth.delegation('token', 'refresh_token', 'app', {'nonce': 'a_nonce'});
      const body = api.lastRequestBody(delegation);
      expect(body.nonce).toBe('a_nonce');
    });

    it('should report api error', () => {
      api.failResponse(delegation, 'Bad Request', 'Bad Token');
      return auth.delegation('token', 'refresh_token', 'app')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

  describe('refreshToken', () => {

    const refreshToken = `${baseUrl}/delegation`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.refreshToken().catch(error => expect(error.message).toBe('must supply a refreshToken')));

    it('should fail with null token', () => auth.refreshToken(null).catch(error => expect(error.message).toBe('must supply a refreshToken')));

    it('should fail with non object parameters', () => auth.refreshToken('token', 'invalid').catch(error => expect(error.message).toBe('must supply parameters as an object')));

    it('should refresh token', async () => {
      let expected = api.returnDelegation();
      const response = await auth.refreshToken('token');
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(refreshToken)).toEqual({
        'refresh_token': 'token',
        'api_type': 'app',
        'client_id': clientId,
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
      });
    });

    it('should call delegation with extra parameters', async () => {
      api.returnDelegation();
      await auth.refreshToken('token', {'nonce': 'a_nonce'});
      const body = api.lastRequestBody(refreshToken);
      expect(body.nonce).toBe('a_nonce');
    });

    it('should report api error', () => {
      api.failResponse(refreshToken, 'Bad Request', 'Bad Token');
      return auth.refreshToken('token')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

  describe('createUser', () => {

    const createUser = `${baseUrl}/dbconnections/signup`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.createUser().catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null email', () => auth.createUser(null).catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null password', () => auth.createUser('samples@auth0.com', null, null, 'Username-Password-Autentication').catch(error => expect(error.message).toBe('must supply a password')));

    it('should fail with null connection', () => auth.createUser('samples@auth0.com', null, 'password', null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should fail with non object metadata', () => auth.createUser('samples@auth0.com', null, 'password', 'Username-Password-Autentication', 'invalid').catch(error => expect(error.message).toBe('must supply metadata as an object')));

    it('should create user with just email', async () => {
      let expected = api.returnCreatedUser('samples@auth0.com');
      const response = await auth.createUser('samples@auth0.com', null, 'password', 'Username-Password-Autentication');
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(createUser)).toEqual({
        'email': 'samples@auth0.com',
        'password': 'password',
        'client_id': clientId,
        'connection': 'Username-Password-Autentication'
      });
    });

    it('should create user with email & username', async () => {
      let expected = api.returnCreatedUser('samples@auth0.com');
      const response = await auth.createUser('samples@auth0.com', 'samples', 'password', 'Username-Password-Autentication');
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(createUser)).toEqual({
        'email': 'samples@auth0.com',
        'username': 'samples',
        'password': 'password',
        'client_id': clientId,
        'connection': 'Username-Password-Autentication'
      });
    });

    it('should send user metadata', async () => {
      api.returnCreatedUser('samples@auth0.com');
      await auth.createUser('samples@auth0.com', 'samples', 'password', 'Username-Password-Autentication', {'first_name': 'John', 'last_name': 'Doe'});
      const body = api.lastRequestBody(createUser);
      expect(body.user_metadata.first_name).toBe('John');
      expect(body.user_metadata.last_name).toBe('Doe');
    });

    it('should report api error', () => {
      api.failResponse(createUser, 'Bad Request', 'Bad Token');
      return auth.createUser('samples@auth0.com', null, 'password', 'Username-Password-Autentication')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });

  });

  describe('resetPassword', () => {

    const resetPassword = `${baseUrl}/dbconnections/change_password`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.resetPassword().catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null email', () => auth.resetPassword(null).catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null connection', () => auth.resetPassword('samples@auth0.com', null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should reset password', async () => {
      api.returnResetPassword();
      await auth.resetPassword('samples@auth0.com', 'Username-Password-Autentication');
      expect(api.lastRequestBody(resetPassword)).toEqual({
        'email': 'samples@auth0.com',
        'client_id': clientId,
        'connection': 'Username-Password-Autentication'
      });
    });

    it('should report api error', () => {
      api.failResponse(resetPassword, 'Bad Request', 'Bad Token');
      return auth.resetPassword('samples@auth0.com', 'Username-Password-Autentication')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });

  });

});
