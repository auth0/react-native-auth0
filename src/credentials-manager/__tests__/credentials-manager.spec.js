import CredentialsManager from '../index';
import CredentialsManagerError from '../credentialsManagerError';
import { Platform } from 'react-native';

describe('credentials manager tests', () => {
  const credentialsManager = new CredentialsManager(
    'https://auth0.com',
    'abc123'
  );

  credentialsManager.Auth0Module.hasValidAuth0InstanceWithConfiguration = () =>
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
    expiresAt: 1691603391,
  };

  describe('test saving credentials', () => {
    it('throws when access token is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.idToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken)
      ).rejects.toThrow();
    });

    it('throws when token type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.tokenType = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken)
      ).rejects.toThrow();
    });

    it('throws when access type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.accessToken = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken)
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is empty', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresAt = undefined;
      await expect(
        credentialsManager.saveCredentials(testToken)
      ).rejects.toThrow();
    });

    it('throws when expiresIn type is zero', async () => {
      const testToken = Object.assign({}, validToken);
      testToken.expiresAt = 0;
      await expect(
        credentialsManager.saveCredentials(testToken)
      ).rejects.toThrow();
    });

    it('proper error is thrown for exception', async () => {
      const newNativeModule = jest
        .spyOn(
          credentialsManager.Auth0Module,
          'hasValidAuth0InstanceWithConfiguration'
        )
        .mockImplementation(() => {
          throw Error('123123');
        });
      await expect(
        credentialsManager.saveCredentials(validToken)
      ).rejects.toThrow();
      newNativeModule.mockRestore();
    });

    it('succeeds for proper token', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'saveCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(
        credentialsManager.saveCredentials(validToken)
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
        validToken
      );
      newNativeModule.mockRestore();
    });

    it('passes along the forceRefresh parameter', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'getCredentials')
        .mockImplementation(() => Promise.resolve(validToken));

      await credentialsManager.getCredentials(null, 0, {}, true);

      expect(
        credentialsManager.Auth0Module.getCredentials
      ).toHaveBeenCalledWith(null, 0, {}, true);

      newNativeModule.mockRestore();
    });
  });

  describe('test hasValidCredentials', () => {
    it('returns false', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'hasValidCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.hasValidCredentials()).resolves.toEqual(
        true
      );
      newNativeModule.mockRestore();
    });

    it('returns true', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'hasValidCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.hasValidCredentials()).resolves.toEqual(
        true
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
        true
      );
      newNativeModule.mockRestore();
    });

    it('returns true', async () => {
      const newNativeModule = jest
        .spyOn(credentialsManager.Auth0Module, 'clearCredentials')
        .mockImplementation(() => Promise.resolve(true));
      await expect(credentialsManager.clearCredentials()).resolves.toEqual(
        true
      );
      newNativeModule.mockRestore();
    });
  });

  describe('CredentialsManagerError', () => {
    describe('convertToCommonErrorCode', () => {
      it('should return the correct common error code for known error codes', () => {
        const error = new CredentialsManagerError({
          status: 400,
          json: {},
          text: '',
        });

        expect(error.convertToCommonErrorCode('INVALID_CREDENTIALS')).toBe(
          'INVALID_CREDENTIALS'
        );
        expect(error.convertToCommonErrorCode('NO_CREDENTIALS')).toBe(
          'NO_CREDENTIALS'
        );
        expect(error.convertToCommonErrorCode('NO_REFRESH_TOKEN')).toBe(
          'NO_REFRESH_TOKEN'
        );
        expect(error.convertToCommonErrorCode('RENEW_FAILED')).toBe(
          'RENEW_FAILED'
        );
        expect(error.convertToCommonErrorCode('STORE_FAILED')).toBe(
          'STORE_FAILED'
        );
        expect(error.convertToCommonErrorCode('REVOKE_FAILED')).toBe(
          'REVOKE_FAILED'
        );
        expect(error.convertToCommonErrorCode('LARGE_MIN_TTL')).toBe(
          'LARGE_MIN_TTL'
        );
        expect(error.convertToCommonErrorCode('INCOMPATIBLE_DEVICE')).toBe(
          'INCOMPATIBLE_DEVICE'
        );
        expect(error.convertToCommonErrorCode('CRYPTO_EXCEPTION')).toBe(
          'CRYPTO_EXCEPTION'
        );
        expect(error.convertToCommonErrorCode('BIOMETRIC_NO_ACTIVITY')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_STATUS_UNKNOWN')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_UNSUPPORTED')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_HW_UNAVAILABLE')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_NONE_ENROLLED')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_NO_HARDWARE')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode(
            'BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED'
          )
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode(
            'BIOMETRIC_AUTHENTICATION_CHECK_FAILED'
          )
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode(
            'BIOMETRIC_ERROR_DEVICE_CREDENTIAL_NOT_AVAILABLE'
          )
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode(
            'BIOMETRIC_ERROR_STRONG_AND_DEVICE_CREDENTIAL_NOT_AVAILABLE'
          )
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_NO_DEVICE_CREDENTIAL')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_NEGATIVE_BUTTON')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_HW_NOT_PRESENT')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_NO_BIOMETRICS')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_USER_CANCELED')
        ).toBe('BIOMETRICS_FAILED');
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_LOCKOUT_PERMANENT')
        ).toBe('BIOMETRICS_FAILED');
        expect(error.convertToCommonErrorCode('BIOMETRIC_ERROR_VENDOR')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(error.convertToCommonErrorCode('BIOMETRIC_ERROR_LOCKOUT')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(error.convertToCommonErrorCode('BIOMETRIC_ERROR_CANCELED')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(error.convertToCommonErrorCode('BIOMETRIC_ERROR_NO_SPACE')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(error.convertToCommonErrorCode('BIOMETRIC_ERROR_TIMEOUT')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_ERROR_UNABLE_TO_PROCESS')
        ).toBe('BIOMETRICS_FAILED');
        expect(error.convertToCommonErrorCode('BIOMETRICS_INVALID_USER')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(
          error.convertToCommonErrorCode('BIOMETRIC_AUTHENTICATION_FAILED')
        ).toBe('BIOMETRICS_FAILED');
        expect(error.convertToCommonErrorCode('BIOMETRICS_FAILED')).toBe(
          'BIOMETRICS_FAILED'
        );
        expect(error.convertToCommonErrorCode('NO_NETWORK')).toBe('NO_NETWORK');
        expect(error.convertToCommonErrorCode('API_ERROR')).toBe('API_ERROR');
      });

      it('should return UNKNOWN_ERROR for unknown error codes', () => {
        const error = new CredentialsManagerError({
          status: 400,
          json: {},
          text: '',
        });

        expect(error.convertToCommonErrorCode('UNKNOWN_CODE')).toBe(
          'UNKNOWN_ERROR'
        );
      });
    });
  });
});
