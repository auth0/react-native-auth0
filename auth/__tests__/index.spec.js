import Auth from '../';
import fetchMock from 'fetch-mock';

describe('auth', () => {

  const baseUrl = 'samples.auth0.com';
  const clientId = 'A_CLIENT_ID_OF_YOUR_ACCOUNT';
  const telemetry = {name: 'react-native-auth0', version: '1.0.0'};
  const redirectUri = 'https://mysite.com/callback';
  const state = 'a random state for auth';
  const tokens = {
    status: 200,
    body: {
      access_token: 'an access token',
      id_token: 'an id token',
      expires_in: 1234567890,
      state,
      scope: 'openid'
    },
    headers: { 'Content-Type': 'application/json' }
  };
  const oauthError = {
    status: 400,
    body: {
      error: 'invalid_request',
      error_description: 'Invalid grant'
    },
    headers: { 'Content-Type': 'application/json' }
  };
  const unexpectedError = {
    status: 500,
    body: 'Internal Server Error....',
    headers: { 'Content-Type': 'text/plain' }
  };
  const auth  = new Auth({baseUrl, clientId, telemetry});

  beforeEach(fetchMock.restore);

  describe('constructor', () => {
    it('should build with domain', () => {
      const auth = new Auth({baseUrl, clientId});
      expect(auth.clientId).toEqual(clientId);
    });

    it('should fail without clientId', () => {
      expect(() => new Auth({baseUrl})).toThrowErrorMatchingSnapshot();
    });

    it('should fail without domain', () => {
      expect(() => new Auth({clientId})).toThrowErrorMatchingSnapshot();
    });
  });


  describe('authorizeUrl', () => {
    it('should return default authorize url', () => {
      expect(auth.authorizeUrl({
        responseType: 'code',
        redirectUri,
        state: 'a_random_state'
      })).toMatchSnapshot();
    });

    it('should return default authorize url with extra parameters', () => {
      expect(auth.authorizeUrl({
        responseType: 'code',
        redirectUri,
        state: 'a_random_state',
        connection: 'facebook'
      })).toMatchSnapshot();
    });
  });

  describe('code exchange', () => {
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.exchange({code: 'a code', verifier: 'a verifier', redirectUri, state, scope: 'openid'});
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      const parameters = {code: 'a code', verifier: 'a verifier', redirectUri, state, scope: 'openid'};
      await expect(auth.exchange(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      const parameters = {code: 'a code', verifier: 'a verifier', redirectUri, state, scope: 'openid'};
      await expect(auth.exchange(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', unexpectedError);
      expect.assertions(1);
      const parameters = {code: 'a code', verifier: 'a verifier', redirectUri, state, scope: 'openid'};
      await expect(auth.exchange(parameters)).rejects.toMatchSnapshot();
    });
  });

  describe('password realm', () => {
    const parameters = {username: 'info@auth0.com', password: 'secret pass', realm: 'Username-Password-Authentication', audience: 'http://myapi.com', scope: 'openid'};
    it('should send correct payload', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await auth.realm(parameters);
      expect(fetchMock.lastCall()).toMatchSnapshot();
    });

    it('should return successful response', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', tokens);
      expect.assertions(1);
      await expect(auth.realm(parameters)).resolves.toMatchSnapshot();
    });

    it('should handle oauth error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', oauthError);
      expect.assertions(1);
      await expect(auth.realm(parameters)).rejects.toMatchSnapshot();
    });

    it('should handle unexpected error', async () => {
      fetchMock.postOnce('https://samples.auth0.com/oauth/token', unexpectedError);
      expect.assertions(1);
      await expect(auth.realm(parameters)).rejects.toMatchSnapshot();
    });
  });

});