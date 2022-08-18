import CredentialsManager from '../index';
import {Platform} from 'react-native';

describe('credentials manager tests', () => {
  const credentialsManager = new CredentialsManager(
    'https://auth0.com',
    'abc123',
  );

  credentialsManager.Auth0Module.hasValidCredentialManagerInstance = () =>
    Promise.resolve(true);
  credentialsManager.Auth0Module.saveCredentials = () => {};
  credentialsManager.Auth0Module.getCredentials = () => {};
  credentialsManager.Auth0Module.hasValidCredentials = () => {};
  credentialsManager.Auth0Module.clearCredentials = () => {};
  credentialsManager.Auth0Module.enableLocalAuthentication = () => {};

  const validToken = {
    idToken: '1234',
    accessToken: '1234',
    tokenType: 'Bearer',
    expiresIn: 86000,
  };

  describe('test saving credentials', () => {
    it('throws when access token is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.idToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when token type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.tokenType = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when access type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.accessToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresIn = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is zero', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresIn = 0;
      await expect(
        credentialsManager.saveCredentials(testToken),
      ).rejects.toThrow();
    });

    it('proper error is thrown for exception', async () => {
      const newNativeModule = jest
        .spyOn(
          credentialsManager.Auth0Module,
          'hasValidCredentialManagerInstance',
        )
        .mockImplementation(() => {
          throw Error('123123');
        });
      await expect(
        credentialsManager.saveCredentials(validToken),
      ).rejects.toThrow();
      newNativeModule.mockRestore();
    });

    it('succeeds for proper token', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'saveCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(
        credentialsManager.saveCredentials(validToken),
      ).resolves.toEqual(true);
      newNativeModule.mockRestore();
    });
  });

  describe('test getting credentials', () => {
    it('proper error is thrown for exception', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'getCredentials')
        .mockImplementation(() => {
          throw Error('123123');
        });
      await expect(credentialsManager.getCredentials()).rejects.toThrow();
      newNativeModule.mockRestore();
    });

    it('succeedsfully returns credentials', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'getCredentials')
        .mockImplementation(() => Promise.resolve(validToken));
      await expect(credentialsManager.getCredentials()).resolves.toEqual(
        validToken,
      );
      newNativeModule.mockRestore();
    });
  });

  describe('test hasValidCredentials', () => {
    it('returns false', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'hasValidCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.hasValidCredentials()).resolves.toEqual(
        true,
      );
      newNativeModule.mockRestore();
    });

    it('returns true', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'hasValidCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.hasValidCredentials()).resolves.toEqual(
        true,
      );
      newNativeModule.mockRestore();
    });
  });

  describe('test clearing credentials', () => {
    it('returns false', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'clearCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.clearCredentials()).resolves.toEqual(
        true,
      );
      newNativeModule.mockRestore();
    });

    it('returns true', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'clearCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.clearCredentials()).resolves.toEqual(
        true,
      );
      newNativeModule.mockRestore();
    });
  });

  describe('test enabling local authentication', () => {
    it('enable local authentication for iOS', async () => {
      Platform.OS = 'ios';
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'enableLocalAuthentication')
        .mockImplementation(() => {});
      await expect(credentialsManager.requireLocalAuthentication()).resolves;
      newNativeModule.mockRestore();
    });

    it('enable local authentication for Android', async () => {
      Platform.OS = 'android';
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'enableLocalAuthentication')
        .mockImplementation(() => {});
      await expect(credentialsManager.requireLocalAuthentication()).resolves;
      newNativeModule.mockRestore();
    });
  });
});
