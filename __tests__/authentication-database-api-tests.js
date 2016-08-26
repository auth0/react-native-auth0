import AuthenticationAPI from '../authentication/api';
import MockedAuthAPI from '../test-utils/mocks';
import faker from 'faker';
import { verifyError } from '../test-utils/matchers.js';

describe('AuthenticationAPI', () => {

  const baseUrl = faker.internet.url();
  const clientId = faker.random.uuid();
  const api = new MockedAuthAPI(baseUrl);

  let email, password, username, connection;

  beforeEach(() => {
    email = faker.internet.email();
    password = faker.internet.password();
    connection = faker.fake('connection-{{random.number}}');
    username = faker.internet.userName();
    api.reset();
  });

  describe('login', () => {

    const resourceOwner = `${baseUrl}/oauth/ro`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.login().catch(error => expect(error.message).toBe('must supply an email or username')));

    it('should fail with null email or username', () => auth.login(null, password, connection).catch(error => expect(error.message).toBe('must supply an email or username')));

    it('should fail with null password', () => auth.login(email, null, connection).catch(error => expect(error.message).toBe('must supply a password')));

    it('should fail with null connection', () => auth.login(email, password, null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should fail with non object parameters', () => auth.login(email, password, connection, 'invalid').catch(error => expect(error.message).toBe('must supply parameters as an object')));

    it('should login with email/password', async () => {
      let expected = api.returnCredentials();
      const credentials = await auth.login(email, password, connection);
      expect(credentials).toEqual(expected);
      expect(api.lastRequestBody(resourceOwner)).toEqual({
        'username': email,
        'password': password,
        'connection': connection,
        'grant_type': 'password',
        'scope': 'openid',
        'client_id': clientId
      });
    });

    it('should login with email/password and custom scope', async () => {
      api.returnCredentials();
      const credentials = await auth.login(email, password, connection, {'scope': 'openid email offline_access'});
      const body = api.lastRequestBody(resourceOwner);
      expect(body.scope).toBe('openid email offline_access');
    });

    it('should login with extra parameters', async () => {
      api.returnCredentials();
      const state = faker.random.uuid();
      await auth.login(email, password, connection, {'state': state});
      const body = api.lastRequestBody(resourceOwner);
      expect(body.state).toBe(state);
    });

    it('should report api error', () => verifyError(auth.login(email, password, connection), api, resourceOwner));
  });

  describe('createUser', () => {

    const createUser = `${baseUrl}/dbconnections/signup`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.createUser().catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null email', () => auth.createUser(null).catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null password', () => auth.createUser(email, null, null, connection).catch(error => expect(error.message).toBe('must supply a password')));

    it('should fail with null connection', () => auth.createUser(email, null, password, null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should fail with non object metadata', () => auth.createUser(email, null, password, connection, 'invalid').catch(error => expect(error.message).toBe('must supply metadata as an object')));

    it('should create user with just email', async () => {
      let expected = api.returnCreatedUser(email);
      const response = await auth.createUser(email, null, password, connection);
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(createUser)).toEqual({
        'email': email,
        'password': password,
        'client_id': clientId,
        'connection': connection
      });
    });

    it('should create user with email & username', async () => {
      let expected = api.returnCreatedUser(email);
      const response = await auth.createUser(email, username, password, connection);
      expect(response).toEqual(expected);
      expect(api.lastRequestBody(createUser)).toEqual({
        'email': email,
        'username': username,
        'password': password,
        'client_id': clientId,
        'connection': connection
      });
    });

    it('should send user metadata', async () => {
      api.returnCreatedUser(email);
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      await auth.createUser(email, 'samples', password, connection, {'first_name': firstName, 'last_name': lastName});
      const body = api.lastRequestBody(createUser);
      expect(body.user_metadata.first_name).toBe(firstName);
      expect(body.user_metadata.last_name).toBe(lastName);
    });

    it('should report api error', () => verifyError(auth.createUser(email, null, password, connection), api, createUser));

  });

  describe('resetPassword', () => {

    const resetPassword = `${baseUrl}/dbconnections/change_password`;
    const auth = new AuthenticationAPI(clientId, baseUrl);

    it('should fail with empty values', () => auth.resetPassword().catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null email', () => auth.resetPassword(null).catch(error => expect(error.message).toBe('must supply an email')));

    it('should fail with null connection', () => auth.resetPassword(email, null).catch(error => expect(error.message).toBe('must supply a connection name')));

    it('should reset password', async () => {
      api.returnResetPassword();
      await auth.resetPassword(email, connection);
      expect(api.lastRequestBody(resetPassword)).toEqual({
        'email': email,
        'client_id': clientId,
        'connection': connection
      });
    });

    it('should report api error', () => verifyError(auth.resetPassword(email, connection), api, resetPassword));

  });

});
