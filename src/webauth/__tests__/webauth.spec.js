jest.mock('react-native');
import Auth from '../../auth';
import WebAuth from '../index';
import { NativeModules } from 'react-native';
import { URL } from 'url';

const A0Auth0 = NativeModules.A0Auth0;

describe('WebAuth', () => {
  const clientId = 'abc123';
  const domain = 'auth0.com';
  const baseUrl = 'https://' + domain;
  const auth = new Auth({ baseUrl: baseUrl, clientId: clientId });
  const webauth = new WebAuth(auth);

  describe('authorize', () => {
    it('should authorize with provided parameters', async () => {
      let parameters = {
        state: 'state',
        nonce: 'nonce',
        audience: 'audience',
        scope: 'scope',
        connection: 'connection',
        maxAge: 120,
        organization: 'org',
        invitationUrl: 'invitation url',
      };
      let options = {
        leeway: 220,
        ephemeralSession: true,
        customScheme: 'scheme',
      };
      const showMock = jest
        .spyOn(webauth.agent, 'login')
        .mockImplementation(() =>
          Promise.resolve({
            idToken: 'id token',
            accessToken: 'access token',
            tokenType: 'token type',
            refreshToken: 'refresh token',
            scope: 'scope',
          })
        );
      await expect(
        webauth.authorize(parameters, options)
      ).resolves.toMatchSnapshot();
      expect(showMock).toHaveBeenCalledWith(
        { clientId, domain },
        { ...parameters, ...options }
      );
      showMock.mockRestore();
    });
  });

  describe('clearSession', () => {
    it('should clearSession with provided parameters', async () => {
      let parameters = {
        federated: true,
        customScheme: 'scheme',
      };
      const showMock = jest
        .spyOn(webauth.agent, 'logout')
        .mockImplementation(() => Promise.resolve());
      await webauth.clearSession(parameters);
      expect(showMock).toHaveBeenCalledWith(
        { clientId, domain },
        { ...parameters }
      );
      showMock.mockRestore();
    });
  });
});
