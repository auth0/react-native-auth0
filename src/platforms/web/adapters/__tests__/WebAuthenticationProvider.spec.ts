import { UnimplementedWebAuthenticationProvider } from '../WebAuthenticationProvider';
import { AuthError } from '../../../../core/models';

describe('UnimplementedWebAuthenticationProvider', () => {
  const webAuthNotSupported =
    'This authentication method is not available on the web platform for security reasons. Please use the browser-based authorize() flow.';
  const webRefreshHandled =
    'Token refresh is handled automatically by `credentialsManager.getCredentials()` on the web.';
  const webUserInfoHandled =
    'User Info should be retrieved by decoding the ID token from `credentialsManager.getCredentials()` on the web.';

  describe('passwordRealm', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        username: 'test@example.com',
        password: 'password123',
        realm: 'Username-Password-Authentication',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.passwordRealm(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.passwordRealm(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('refreshToken', () => {
    it('should reject with NotImplemented error and specific message', async () => {
      const parameters = {
        refreshToken: 'refresh_token_123',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.refreshToken(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.refreshToken(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webRefreshHandled,
      });
    });
  });

  describe('userInfo', () => {
    it('should reject with NotImplemented error and specific message', async () => {
      const parameters = {
        token: 'access_token_123',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.userInfo(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.userInfo(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webUserInfoHandled,
      });
    });
  });

  describe('revoke', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        refreshToken: 'refresh_token_123',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.revoke(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.revoke(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: '`revoke` is not available on the web platform.',
      });
    });
  });

  describe('exchangeNativeSocial', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        subjectToken: 'subject_token_123',
        subjectTokenType: 'facebook',
        userProfile: { name: 'John Doe' },
      };

      await expect(
        UnimplementedWebAuthenticationProvider.exchangeNativeSocial(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.exchangeNativeSocial(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('passwordlessWithEmail', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        email: 'test@example.com',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.passwordlessWithEmail(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.passwordlessWithEmail(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('passwordlessWithSMS', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        phoneNumber: '+1234567890',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.passwordlessWithSMS(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.passwordlessWithSMS(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('loginWithEmail', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        email: 'test@example.com',
        code: '123456',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.loginWithEmail(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.loginWithEmail(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('loginWithSMS', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        phoneNumber: '+1234567890',
        code: '123456',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.loginWithSMS(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.loginWithSMS(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('loginWithOTP', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        mfaToken: 'mfa_token_123',
        otp: '123456',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.loginWithOTP(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.loginWithOTP(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('loginWithOOB', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        mfaToken: 'mfa_token_123',
        oobCode: 'oob_code_123',
        bindingCode: 'binding_123',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.loginWithOOB(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.loginWithOOB(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('loginWithRecoveryCode', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        mfaToken: 'mfa_token_123',
        recoveryCode: 'recovery_123',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.loginWithRecoveryCode(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.loginWithRecoveryCode(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('multifactorChallenge', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        mfaToken: 'mfa_token_123',
        challengeType: 'otp',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.multifactorChallenge(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.multifactorChallenge(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('resetPassword', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        email: 'test@example.com',
        connection: 'Username-Password-Authentication',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.resetPassword(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.resetPassword(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('createUser', () => {
    it('should reject with NotImplemented error', async () => {
      const parameters = {
        email: 'test@example.com',
        password: 'password123',
        connection: 'Username-Password-Authentication',
      };

      await expect(
        UnimplementedWebAuthenticationProvider.createUser(parameters)
      ).rejects.toThrow(AuthError);
      await expect(
        UnimplementedWebAuthenticationProvider.createUser(parameters)
      ).rejects.toMatchObject({
        name: 'NotImplemented',
        message: webAuthNotSupported,
      });
    });
  });

  describe('comprehensive method coverage', () => {
    it('should ensure all IAuthenticationProvider methods are implemented', () => {
      const provider = UnimplementedWebAuthenticationProvider;

      // Verify all expected methods exist
      expect(typeof provider.passwordRealm).toBe('function');
      expect(typeof provider.refreshToken).toBe('function');
      expect(typeof provider.userInfo).toBe('function');
      expect(typeof provider.revoke).toBe('function');
      expect(typeof provider.exchangeNativeSocial).toBe('function');
      expect(typeof provider.passwordlessWithEmail).toBe('function');
      expect(typeof provider.passwordlessWithSMS).toBe('function');
      expect(typeof provider.loginWithEmail).toBe('function');
      expect(typeof provider.loginWithSMS).toBe('function');
      expect(typeof provider.loginWithOTP).toBe('function');
      expect(typeof provider.loginWithOOB).toBe('function');
      expect(typeof provider.loginWithRecoveryCode).toBe('function');
      expect(typeof provider.multifactorChallenge).toBe('function');
      expect(typeof provider.resetPassword).toBe('function');
      expect(typeof provider.createUser).toBe('function');
    });
  });
});
