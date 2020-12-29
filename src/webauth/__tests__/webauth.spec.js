jest.mock('react-native');
import Auth from '../../auth';
import WebAuth from '../index';
import {NativeModules} from 'react-native';
import {URL} from 'url';

const A0Auth0 = NativeModules.A0Auth0;

describe('WebAuth', () => {
  const auth = new Auth({baseUrl: 'https://auth0.com', clientId: 'abc123'});
  const webauth = new WebAuth(auth);

  beforeEach(() => {
    NativeModules.A0Auth0 = A0Auth0;
    A0Auth0.reset();
  });

  describe('clearSession', () => {
    it('should open log out URL', async () => {
      await webauth.clearSession();

      const parsedUrl = new URL(A0Auth0.url);
      expect(parsedUrl.protocol).toEqual('https:');
      expect(parsedUrl.hostname).toEqual('auth0.com');
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('returnTo')).toEqual(
        'com.my.app://auth0.com/test-os/com.My.App/callback',
      );
      expect(urlQuery.get('client_id')).toEqual('abc123');
      expect(urlQuery.has('federated')).toEqual(false);
      expect(urlQuery.has('auth0Client')).toEqual(true);
    });

    it('should open log out URL with federated=true', async () => {
      const options = {federated: true};
      await webauth.clearSession(options);

      const parsedUrl = new URL(A0Auth0.url);
      expect(parsedUrl.protocol).toEqual('https:');
      expect(parsedUrl.hostname).toEqual('auth0.com');
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('returnTo')).toEqual(
        'com.my.app://auth0.com/test-os/com.My.App/callback',
      );
      expect(urlQuery.get('client_id')).toEqual('abc123');
      expect(urlQuery.get('federated')).toEqual('true');
      expect(urlQuery.has('auth0Client')).toEqual(true);
    });
  });

  describe('custom scheme', () => {
    it('should build the callback URL with a custom scheme when logging in', async () => {
      const newTransactionMock = jest
        .spyOn(webauth.agent, 'newTransaction')
        .mockImplementation(() =>
          Promise.resolve({state: 'state', verifier: 'verifier'}),
        );
      const showMock = jest
        .spyOn(webauth.agent, 'show')
        .mockImplementation(authorizeUrl => ({
          then: () => Promise.resolve(authorizeUrl),
        }));
      const options = {customScheme: 'custom-scheme'};
      let url = await webauth.authorize({}, options);

      const parsedUrl = new URL(url);
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('redirect_uri')).toEqual(
        'custom-scheme://auth0.com/test-os/com.My.App/callback',
      );
      newTransactionMock.mockRestore();
      showMock.mockRestore();
    });

    it('should build the callback URL with a custom scheme when logging out', async () => {
      const options = {customScheme: 'custom-scheme'};
      await webauth.clearSession(options);

      const parsedUrl = new URL(A0Auth0.url);
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('returnTo')).toEqual(
        'custom-scheme://auth0.com/test-os/com.My.App/callback',
      );
    });
  });
});
