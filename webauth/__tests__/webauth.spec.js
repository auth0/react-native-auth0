jest.mock('react-native');
import Auth from '../../auth';
import WebAuth from '../index';
import { NativeModules } from 'react-native';
import { URL } from 'url';

const A0Auth0 = NativeModules.A0Auth0;

describe('WebAuth', () => {
  const auth = new Auth({ baseUrl: 'https://auth0.com', clientId: 'abc123' });
  const webauth = new WebAuth(auth);

  describe('clearSession', () => {
    beforeEach(() => {
      NativeModules.A0Auth0 = A0Auth0;
      A0Auth0.reset();
    });

    it('should open log out URL', async () => {
      await webauth.clearSession();

      const parsedUrl = new URL(A0Auth0.url);
      expect(parsedUrl.protocol).toEqual('https:');
      expect(parsedUrl.hostname).toEqual('auth0.com');
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('returnTo')).toEqual(
        'com.my.app://auth0.com/test-os/com.My.App/callback'
      );
      expect(urlQuery.get('client_id')).toEqual('abc123');
      expect(urlQuery.has('federated')).toEqual(false);
      expect(urlQuery.has('auth0Client')).toEqual(true);
    });

    it('should open log out URL with federated=true', async () => {
      const options = { federated: true };
      await webauth.clearSession(options);

      const parsedUrl = new URL(A0Auth0.url);
      expect(parsedUrl.protocol).toEqual('https:');
      expect(parsedUrl.hostname).toEqual('auth0.com');
      const urlQuery = parsedUrl.searchParams;
      expect(urlQuery.get('returnTo')).toEqual(
        'com.my.app://auth0.com/test-os/com.My.App/callback'
      );
      expect(urlQuery.get('client_id')).toEqual('abc123');
      expect(urlQuery.get('federated')).toEqual('true');
      expect(urlQuery.has('auth0Client')).toEqual(true);
    });
  });
});
