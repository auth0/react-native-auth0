jest.mock('react-native');
import * as nativeUtils from '../../utils/nativeHelper';
import Agent from '../agent';
import { NativeModules } from 'react-native';

describe('Agent', () => {
  const agent = new Agent();

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
          additionalParameters: { test: 'test' },
        }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
      expect(mockLogin).toBeCalledWith(
        'test',
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
        }
      );
      expect(mock).toBeCalledWith(NativeModules.A0Auth0, clientId, domain);
      expect(mockLogin).toBeCalledWith('test', true);
    });
  });

  describe('getScheme', () => {
    it('should return custom scheme', async () => {
      await expect(agent.getScheme('custom')).toEqual('custom');
    });

    it('should return bundle identifier', async () => {
      NativeModules.A0Auth0.bundleIdentifier = 'com.test';
      await expect(agent.getScheme()).toEqual('com.test');
    });

    it('should return bundle identifier lower cased', async () => {
      NativeModules.A0Auth0.bundleIdentifier = 'com.Test';
      await expect(agent.getScheme()).toEqual('com.test');
    });
  });
});
