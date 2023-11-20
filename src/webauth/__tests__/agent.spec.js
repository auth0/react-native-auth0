import * as nativeUtils from '../../utils/nativeHelper';
import Agent from '../agent';
import { NativeModules, Platform, Linking } from 'react-native';

jest.mock('react-native', () => {
  // Require the original module to not be mocked...
  return {
    __esModule: true, // Use it when dealing with esModules
    Linking: {
      addEventListener: jest.fn(),
    },
    NativeModules: {
      A0Auth0: {
        webAuth: () => {},
        webAuthLogout: () => {},
        resumeWebAuth: () => {},
        hasValidAuth0Instance: () => {},
        initializeAuth0: () => {},
        bundleIdentifier: 'com.my.app',
      },
    },
    Platform: {
      OS: 'ios',
    },
  };
});

describe('Agent', () => {
  const agent = new Agent();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should fail if native module is not linked', async () => {
      const replacedProperty = jest.replaceProperty(
        NativeModules,
        'A0Auth0',
        undefined
      );
      expect.assertions(1);
      await expect(agent.login()).rejects.toMatchSnapshot();
      replacedProperty.restore();
    });

    it('should ensure module is initialized', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitialized')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(NativeModules.A0Auth0, 'webAuth')
        .mockImplementation(() => Promise.resolve(true));
      agent.login(
        {
          clientId: clientId,
          domain: domain,
        },
        { customScheme: 'test' }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
    });

    it('should ensure login is called with proper parameters', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitialized')
        .mockImplementation(() => Promise.resolve(true));
      const mockLogin = jest
        .spyOn(NativeModules.A0Auth0, 'webAuth')
        .mockImplementation(() => Promise.resolve(true));
      await agent.login(
        {
          clientId: clientId,
          domain: domain,
        },
        {
          customScheme: 'test',
          state: 'state',
          nonce: 'nonce',
          audience: 'audience',
          scope: 'scope',
          connection: 'connection',
          maxAge: 120,
          organization: 'organization',
          invitationUrl: 'invitationUrl',
          leeway: 220,
          ephemeralSession: true,
          useSFSafariViewController: true,
          additionalParameters: { test: 'test' },
        }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
      expect(mockLogin).toBeCalledWith(
        'test',
        'test://test.com/ios/com.my.app/callback',
        'state',
        'nonce',
        'audience',
        'scope',
        'connection',
        120,
        'organization',
        'invitationUrl',
        220,
        true,
        true,
        { test: 'test' }
      );
    });
  });

  describe('logout', () => {
    it('should fail if native module is not linked', async () => {
      const replacedProperty = jest.replaceProperty(
        NativeModules,
        'A0Auth0',
        undefined
      );
      expect.assertions(1);
      await expect(agent.logout()).rejects.toMatchSnapshot();
      replacedProperty.restore();
    });

    it('should ensure module is initialized', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitialized')
        .mockImplementation(() => Promise.resolve(true));
      agent.logout(
        {
          clientId: clientId,
          domain: domain,
        },
        { customScheme: 'test' }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
    });

    it('should ensure logout is called with proper parameters', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitialized')
        .mockImplementation(() => Promise.resolve(true));
      const mockLogin = jest
        .spyOn(NativeModules.A0Auth0, 'webAuthLogout')
        .mockImplementation(() => Promise.resolve(true));
      await agent.logout(
        {
          clientId: clientId,
          domain: domain,
        },
        {
          customScheme: 'test',
          federated: true,
          useSFSafariViewController: true,
        }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
      expect(mockLogin).toBeCalledWith(
        'test',
        true,
        'test://test.com/ios/com.my.app/callback',
        true
      );
    });
  });

  describe('getScheme', () => {
    it('should return custom scheme', async () => {
      await expect(agent.getScheme(false, 'custom')).toEqual('custom');
    });

    it('should return custom scheme even if legacy behaviour set to true', async () => {
      await expect(agent.getScheme(true, 'custom')).toEqual('custom');
    });

    it('should return bundle identifier', async () => {
      NativeModules.A0Auth0.bundleIdentifier = 'com.test';
      await expect(agent.getScheme()).toEqual('com.test.auth0');
    });

    it('should return bundle identifier lower cased', async () => {
      NativeModules.A0Auth0.bundleIdentifier = 'com.Test';
      await expect(agent.getScheme()).toEqual('com.test.auth0');
    });

    it('should return legacy scheme', async () => {
      NativeModules.A0Auth0.bundleIdentifier = 'com.Test';
      await expect(agent.getScheme(true)).toEqual('com.test');
    });
  });

  describe('callbackUri', () => {
    it('should return callback uri with given domain and scheme', async () => {
      await expect(agent.callbackUri('domain', 'scheme')).toEqual(
        'scheme://domain/ios/com.test/callback'
      );
    });
  });

  describe('handle app linking for SFSafariViewController', () => {
    it('for login, with only SFSafariViewController AppLinking should be enabled', async () => {
      await agent.login({}, { useSFSafariViewController: true });
      expect(Linking.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('for logout, with only SFSafariViewController AppLinking should be enabled', async () => {
      await agent.login({}, {});
      expect(Linking.addEventListener).toHaveBeenCalledTimes(0);
    });

    it('for logout, for only iOS platform AppLinking should be enabled', async () => {
      Platform.OS = 'android';
      await agent.login({}, { useSFSafariViewController: true });
      expect(Linking.addEventListener).toHaveBeenCalledTimes(0);
      Platform.OS = 'ios'; //reset value to ios
    });
  });
});
