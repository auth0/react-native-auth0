import * as nativeUtils from '../../utils/nativeHelper';
import Agent from '../agent';
import { Platform, Linking } from 'react-native';
import A0Auth0 from '../../specs/NativeA0Auth0';

const localAuthenticationOptions = {
  title: 'Authenticate With Your Biometrics',
  evaluationPolicy: 1,
  authenticationLevel: 0,
};

// Mock the native module
jest.mock('../../specs/NativeA0Auth0');

jest.mock('react-native', () => {
  return {
    __esModule: true, // Use it when dealing with esModules
    Linking: {
      addEventListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
    },
  };
});

describe('Agent', () => {
  const agent = new Agent();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set default implementation for native module functions
    A0Auth0.hasValidAuth0InstanceWithConfiguration = jest.fn(() =>
      Promise.resolve(true)
    );
    A0Auth0.initializeAuth0WithConfiguration = jest.fn(() => Promise.resolve());
    A0Auth0.getBundleIdentifier = jest.fn(() => Promise.resolve('com.my.app'));
    A0Auth0.webAuth = jest.fn(() => Promise.resolve(true));
    A0Auth0.webAuthLogout = jest.fn(() => Promise.resolve(true));
    A0Auth0.cancelWebAuth = jest.fn(() => Promise.resolve(true));
    A0Auth0.resumeWebAuth = jest.fn(() => Promise.resolve(true));
  });

  describe('login', () => {
    it('should ensure module is initialized', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      agent.login(
        {
          clientId: clientId,
          domain: domain,
        },
        { customScheme: 'test' },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
    });

    it('should ensure login is called with proper parameters', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
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
          safariViewControllerPresentationStyle: 0,
          additionalParameters: { test: 'test' },
        },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
      expect(A0Auth0.webAuth).toBeCalledWith(
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
        0,
        { test: 'test' }
      );
    });

    it('should ensure login is called with proper parameters when redirect URL is set', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.login(
        {
          clientId: clientId,
          domain: domain,
        },
        {
          redirectUrl: 'redirect://redirect.com',
        },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
      expect(A0Auth0.webAuth).toBeCalledWith(
        'com.my.app.auth0',
        'redirect://redirect.com',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
        undefined,
        undefined,
        0,
        false,
        99,
        {}
      );
    });
  });

  describe('logout', () => {
    it('should ensure module is initialized', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.logout(
        {
          clientId: clientId,
          domain: domain,
        },
        { customScheme: 'test' },
        localAuthenticationOptions
      );
      expect(mock).toHaveBeenCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
    });

    it('should ensure logout is called with proper parameters', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.logout(
        {
          clientId: clientId,
          domain: domain,
        },
        {
          customScheme: 'test',
          federated: true,
        },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
      expect(A0Auth0.webAuthLogout).toBeCalledWith(
        'test',
        true,
        'test://test.com/ios/com.my.app/callback'
      );
    });

    it('should ensure logout is called with proper parameters when redirect url is set', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.logout(
        {
          clientId: clientId,
          domain: domain,
        },
        {
          returnToUrl: 'redirect://redirect.com',
        },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
      expect(A0Auth0.webAuthLogout).toBeCalledWith(
        'com.my.app.auth0',
        false,
        'redirect://redirect.com'
      );
    });
  });

  describe('agent', () => {
    it('should ensure module is initialized', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.cancelWebAuth(
        {
          clientId: clientId,
          domain: domain,
        },
        localAuthenticationOptions
      );

      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
    });

    it('should ensure cancelWebAuth is called correctly', async () => {
      let domain = 'test.com';
      let clientId = 'client id value';
      const mock = jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementation(() => Promise.resolve(true));

      await agent.cancelWebAuth(
        {
          clientId: clientId,
          domain: domain,
        },
        localAuthenticationOptions
      );
      expect(mock).toBeCalledWith(
        A0Auth0,
        clientId,
        domain,
        localAuthenticationOptions
      );
      expect(A0Auth0.cancelWebAuth).toHaveBeenCalled();
    });
  });

  describe('getScheme', () => {
    it('should return custom scheme', async () => {
      expect(await agent.getScheme(false, 'custom')).toEqual('custom');
    });

    it('should return custom scheme even if legacy behaviour set to true', async () => {
      expect(await agent.getScheme(true, 'custom')).toEqual('custom');
    });

    it('should return bundle identifier', async () => {
      A0Auth0.getBundleIdentifier = jest.fn(() => Promise.resolve('com.test'));
      await expect(agent.getScheme()).resolves.toEqual('com.test.auth0');
      expect(A0Auth0.getBundleIdentifier).toHaveBeenCalled();
    });

    it('should return bundle identifier lower cased', async () => {
      A0Auth0.getBundleIdentifier = jest.fn(() => Promise.resolve('com.Test'));
      await expect(agent.getScheme()).resolves.toEqual('com.test.auth0');
      expect(A0Auth0.getBundleIdentifier).toHaveBeenCalled();
    });

    it('should return legacy scheme', async () => {
      A0Auth0.getBundleIdentifier = jest.fn(() => Promise.resolve('com.Test'));
      await expect(agent.getScheme(true)).resolves.toEqual('com.test');
      expect(A0Auth0.getBundleIdentifier).toHaveBeenCalled();
    });
  });

  describe('callbackUri', () => {
    it('should return callback uri with given domain and scheme', async () => {
      A0Auth0.getBundleIdentifier = jest.fn(() => Promise.resolve('com.test'));
      await expect(agent.callbackUri('domain', 'scheme')).resolves.toEqual(
        'scheme://domain/ios/com.test/callback'
      );
    });
  });

  describe('handle app linking for ios platform', () => {
    it('for only iOS platform AppLinking should be enabled', async () => {
      Platform.OS = 'android';
      await agent.login({}, {});
      expect(Linking.addEventListener).toHaveBeenCalledTimes(0);
      Platform.OS = 'ios'; //reset value to ios
    });

    it('when login crashes and AppLinking is enabled, listener for AppLinking should be removed', async () => {
      let mockSubscription = {
        remove: () => {},
      };
      jest.spyOn(mockSubscription, 'remove').mockReturnValueOnce({});
      jest
        .spyOn(Linking, 'addEventListener')
        .mockReturnValueOnce(mockSubscription);
      jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementationOnce(() => {
          throw Error('123123');
        });
      try {
        await agent.login({}, {});
      } catch (e) {}
      !expect(Linking.addEventListener).toHaveBeenCalled;
      expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
    });

    it('when login succeeds and AppLinking is enabled, listener for AppLinking subscription should be removed and resumeWebAuth should be called', async () => {
      let mockSubscription = {
        remove: () => {},
      };
      jest.spyOn(mockSubscription, 'remove').mockReturnValueOnce({});
      const mockEventListener = jest
        .spyOn(Linking, 'addEventListener')
        .mockReturnValueOnce(mockSubscription);

      jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementationOnce(() => {});

      A0Auth0.webAuth = jest.fn(() => {
        mockEventListener.mock.calls[0][1]({ url: 'https://callback.url.com' });
        return Promise.resolve(true);
      });

      A0Auth0.resumeWebAuth = jest.fn(() => Promise.resolve(true));

      await agent.login({}, { safariViewControllerPresentationStyle: 0 });
      expect(Linking.addEventListener).toHaveBeenCalledTimes(1);
      expect(A0Auth0.resumeWebAuth).toHaveBeenCalledTimes(1);
      expect(mockEventListener.mock.calls[0][0]).toEqual('url');
      expect(A0Auth0.resumeWebAuth).toHaveBeenCalledWith(
        'https://callback.url.com'
      );
      expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
    });

    it('when login crashes and AppLinking is not enabled, listener for AppLinking remove should not be called', async () => {
      let mockSubscription = {
        remove: () => {},
      };
      jest.spyOn(mockSubscription, 'remove').mockReturnValueOnce({});
      jest
        .spyOn(Linking, 'addEventListener')
        .mockReturnValueOnce(mockSubscription);
      jest
        .spyOn(nativeUtils, '_ensureNativeModuleIsInitializedWithConfiguration')
        .mockImplementationOnce(() => {
          throw Error('123123');
        });
      try {
        await agent.login({}, {});
      } catch (e) {}
      !expect(Linking.addEventListener).toHaveBeenCalled();
      !expect(mockSubscription.remove).toHaveBeenCalled();
    });
  });
});
