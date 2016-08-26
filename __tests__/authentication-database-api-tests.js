import AuthenticationAPI from '../auth/authentication-api';
import MockedAuthAPI from '../test-utils/mocks';

describe('AuthenticationAPI', () => {

  const baseUrl = 'https://samples.auth0.com';
  const clientId = 'CLIENT_ID';
  const api = new MockedAuthAPI(baseUrl);

  beforeEach(() => {
    api.reset();
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
