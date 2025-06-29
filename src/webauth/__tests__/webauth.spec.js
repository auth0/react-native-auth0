jest.mock('react-native');
import Auth from '../../auth';
import WebAuth from '../index';

// Mock the native module
jest.mock('../../specs/NativeA0Auth0');

describe('WebAuth', () => {
  const clientId = 'abc123';
  const domain = 'auth0.com';
  const baseUrl = 'https://' + domain;
  const auth = new Auth({ baseUrl: baseUrl, clientId: clientId });
  const localAuthenticationOptions = {
    title: 'Authenticate With Your Biometrics',
    evaluationPolicy: 1,
    authenticationLevel: 0,
  };
  const webauth = new WebAuth(auth, localAuthenticationOptions);

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
        redirectUri: 'redirect://redirect.com',
        additionalParameters: { test: 'test' },
      };
      let options = {
        leeway: 220,
        ephemeralSession: true,
        customScheme: 'scheme',
        useSFSafariViewController: { presentationStyle: -2 },
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
        {
          ...parameters,
          ...options,
          safariViewControllerPresentationStyle: -2,
        },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });

    it('should set presentation style to 0 if set as empty', async () => {
      let parameters = {
        state: 'state',
        nonce: 'nonce',
        audience: 'audience',
        scope: 'scope',
        connection: 'connection',
        maxAge: 120,
        organization: 'org',
        invitationUrl: 'invitation url',
        additionalParameters: { test: 'test' },
      };
      let options = {
        leeway: 220,
        ephemeralSession: true,
        customScheme: 'scheme',
        useSFSafariViewController: {},
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
        { ...parameters, ...options, safariViewControllerPresentationStyle: 0 },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });

    it('should set presentation style to undefined if object is undefined', async () => {
      let parameters = {
        state: 'state',
        nonce: 'nonce',
        audience: 'audience',
        scope: 'scope',
        connection: 'connection',
        maxAge: 120,
        organization: 'org',
        invitationUrl: 'invitation url',
        additionalParameters: { test: 'test' },
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
        {
          ...parameters,
          ...options,
          safariViewControllerPresentationStyle: undefined,
        },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });

    it('should set presentation style to undefined if value is false', async () => {
      let parameters = {
        state: 'state',
        nonce: 'nonce',
        audience: 'audience',
        scope: 'scope',
        connection: 'connection',
        maxAge: 120,
        organization: 'org',
        invitationUrl: 'invitation url',
        additionalParameters: { test: 'test' },
      };
      let options = {
        leeway: 220,
        ephemeralSession: true,
        customScheme: 'scheme',
        useSFSafariViewController: false,
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
        {
          ...parameters,
          ...options,
          safariViewControllerPresentationStyle: undefined,
        },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });

    it('should set presentation style to 0 if value is true', async () => {
      let parameters = {
        state: 'state',
        nonce: 'nonce',
        audience: 'audience',
        scope: 'scope',
        connection: 'connection',
        maxAge: 120,
        organization: 'org',
        invitationUrl: 'invitation url',
        additionalParameters: { test: 'test' },
      };
      let options = {
        leeway: 220,
        ephemeralSession: true,
        customScheme: 'scheme',
        useSFSafariViewController: true,
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
        {
          ...parameters,
          ...options,
          safariViewControllerPresentationStyle: 0,
        },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });
  });

  describe('clearSession', () => {
    it('should clearSession with provided parameters', async () => {
      let parameters = {
        federated: true,
        returnToUrl: 'https://redirect.redirect.com',
      };
      let options = {
        customScheme: 'scheme',
      };
      const showMock = jest
        .spyOn(webauth.agent, 'logout')
        .mockImplementation(() => Promise.resolve());
      await webauth.clearSession(
        parameters,
        options,
        localAuthenticationOptions
      );
      expect(showMock).toHaveBeenCalledWith(
        { clientId, domain },
        { ...parameters, ...options },
        localAuthenticationOptions
      );
      showMock.mockRestore();
    });
  });
});
