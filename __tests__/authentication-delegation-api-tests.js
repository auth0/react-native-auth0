import AuthenticationAPI from '../authentication/api';
import MockedAuthAPI from '../test-utils/mocks';

describe('AuthenticationAPI', () => {

  const baseUrl = 'https://samples.auth0.com';
  const clientId = 'CLIENT_ID';
  const api = new MockedAuthAPI(baseUrl);

  beforeEach(() => {
    api.reset();
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
      api.failResponse('POST', delegation, 'Bad Request', 'Bad Token');
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
      api.failResponse('POST', refreshToken, 'Bad Request', 'Bad Token');
      return auth.refreshToken('token')
        .then(json => fail('not supposed to succeed'))
        .catch(error => expect(error.name).toEqual('Bad Request'));
    });
  });

});
