import { NativeMfaClient } from '../NativeMfaClient';
import type { INativeBridge } from '../../bridge';
import { AuthError, MfaError, MfaErrorCodes } from '../../../../core/models';

const mockBridge: jest.Mocked<INativeBridge> = {
  mfaGetAuthenticators: jest.fn(),
  mfaEnroll: jest.fn(),
  mfaChallenge: jest.fn(),
  mfaVerify: jest.fn(),
  initialize: jest.fn(),
  hasValidInstance: jest.fn(),
  getBundleIdentifier: jest.fn(),
  authorize: jest.fn(),
  clearSession: jest.fn(),
  cancelWebAuth: jest.fn(),
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  resumeWebAuth: jest.fn(),
  getDPoPHeaders: jest.fn(),
  clearDPoPKey: jest.fn(),
  getSSOCredentials: jest.fn(),
  getApiCredentials: jest.fn(),
  clearApiCredentials: jest.fn(),
  customTokenExchange: jest.fn(),
};

describe('NativeMfaClient', () => {
  let client: NativeMfaClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new NativeMfaClient(mockBridge);
  });

  describe('getAuthenticators', () => {
    it('should call bridge with mfaToken and factorsAllowed', async () => {
      const authenticators = [
        {
          id: 'sms|dev_123',
          authenticatorType: 'oob',
          active: true,
          oobChannel: 'sms',
        },
      ];
      mockBridge.mfaGetAuthenticators.mockResolvedValueOnce(authenticators);

      const result = await client.getAuthenticators({
        mfaToken: 'mfa_token_123',
        factorsAllowed: ['otp', 'oob'],
      });

      expect(mockBridge.mfaGetAuthenticators).toHaveBeenCalledWith(
        'mfa_token_123',
        ['otp', 'oob']
      );
      expect(result).toEqual(authenticators);
    });

    it('should call bridge with undefined factorsAllowed when not provided', async () => {
      mockBridge.mfaGetAuthenticators.mockResolvedValueOnce([]);

      await client.getAuthenticators({ mfaToken: 'mfa_token_123' });

      expect(mockBridge.mfaGetAuthenticators).toHaveBeenCalledWith(
        'mfa_token_123',
        undefined
      );
    });

    it('should wrap AuthError in MfaError', async () => {
      const authError = new AuthError('invalid_grant', 'Token expired', {
        code: 'expired_token',
      });
      mockBridge.mfaGetAuthenticators.mockRejectedValueOnce(authError);

      await expect(
        client.getAuthenticators({ mfaToken: 'mfa_token_123' })
      ).rejects.toThrow(MfaError);

      try {
        await client.getAuthenticators({ mfaToken: 'mfa_token_123' });
      } catch {
        // Re-mock since first call consumed it
      }
      // Use a fresh mock to verify type
      mockBridge.mfaGetAuthenticators.mockRejectedValueOnce(authError);
      try {
        await client.getAuthenticators({ mfaToken: 'mfa_token_123' });
      } catch (e) {
        expect(e).toBeInstanceOf(MfaError);
        expect((e as MfaError).type).toBe(MfaErrorCodes.EXPIRED_MFA_TOKEN);
      }
    });

    it('should rethrow non-AuthError errors as-is', async () => {
      const error = new Error('Network error');
      mockBridge.mfaGetAuthenticators.mockRejectedValueOnce(error);

      await expect(
        client.getAuthenticators({ mfaToken: 'mfa_token_123' })
      ).rejects.toThrow(error);
    });
  });

  describe('enroll', () => {
    it('should enroll phone factor with phoneNumber', async () => {
      const challenge = { type: 'oob' as const, oobCode: 'oob_123' };
      mockBridge.mfaEnroll.mockResolvedValueOnce(challenge);

      const result = await client.enroll({
        mfaToken: 'mfa_token_123',
        phoneNumber: '+12025550135',
      });

      expect(mockBridge.mfaEnroll).toHaveBeenCalledWith(
        'mfa_token_123',
        'phone',
        '+12025550135'
      );
      expect(result).toEqual(challenge);
    });

    it('should enroll voice factor with phoneNumber and voice flag', async () => {
      const challenge = { type: 'oob' as const, oobCode: 'oob_voice' };
      mockBridge.mfaEnroll.mockResolvedValueOnce(challenge);

      const result = await client.enroll({
        mfaToken: 'mfa_token_123',
        phoneNumber: '+12025550135',
        voice: true,
      });

      expect(mockBridge.mfaEnroll).toHaveBeenCalledWith(
        'mfa_token_123',
        'voice',
        '+12025550135'
      );
      expect(result).toEqual(challenge);
    });

    it('should enroll email factor with email', async () => {
      const challenge = { type: 'oob' as const, oobCode: 'oob_456' };
      mockBridge.mfaEnroll.mockResolvedValueOnce(challenge);

      const result = await client.enroll({
        mfaToken: 'mfa_token_123',
        email: 'user@example.com',
      });

      expect(mockBridge.mfaEnroll).toHaveBeenCalledWith(
        'mfa_token_123',
        'email',
        'user@example.com'
      );
      expect(result).toEqual(challenge);
    });

    it('should enroll otp factor', async () => {
      const challenge = {
        type: 'totp' as const,
        barcodeUri: 'otpauth://totp/...',
        secret: 'JBSWY3DPEHPK3PXP',
      };
      mockBridge.mfaEnroll.mockResolvedValueOnce(challenge);

      const result = await client.enroll({
        mfaToken: 'mfa_token_123',
        type: 'otp',
      });

      expect(mockBridge.mfaEnroll).toHaveBeenCalledWith(
        'mfa_token_123',
        'otp',
        undefined
      );
      expect(result).toEqual(challenge);
    });

    it('should enroll push factor', async () => {
      const challenge = { type: 'oob' as const, oobCode: 'oob_789' };
      mockBridge.mfaEnroll.mockResolvedValueOnce(challenge);

      const result = await client.enroll({
        mfaToken: 'mfa_token_123',
        type: 'push',
      });

      expect(mockBridge.mfaEnroll).toHaveBeenCalledWith(
        'mfa_token_123',
        'push',
        undefined
      );
      expect(result).toEqual(challenge);
    });

    it('should wrap AuthError in MfaError', async () => {
      const authError = new AuthError('enrollment_error', 'Enrollment failed', {
        code: 'MFA_ENROLLMENT_ERROR',
      });
      mockBridge.mfaEnroll.mockRejectedValueOnce(authError);

      try {
        await client.enroll({ mfaToken: 'mfa_token_123', type: 'otp' });
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(MfaError);
        expect((e as MfaError).type).toBe(MfaErrorCodes.ENROLLMENT_FAILED);
      }
    });

    it('should rethrow non-AuthError errors as-is', async () => {
      const error = new Error('Enrollment failed');
      mockBridge.mfaEnroll.mockRejectedValueOnce(error);

      await expect(
        client.enroll({ mfaToken: 'mfa_token_123', type: 'otp' })
      ).rejects.toThrow(error);
    });
  });

  describe('challenge', () => {
    it('should call bridge with mfaToken and authenticatorId', async () => {
      const challengeResult = {
        challengeType: 'oob',
        oobCode: 'oob_challenge_123',
      };
      mockBridge.mfaChallenge.mockResolvedValueOnce(challengeResult);

      const result = await client.challenge({
        mfaToken: 'mfa_token_123',
        authenticatorId: 'sms|dev_123',
      });

      expect(mockBridge.mfaChallenge).toHaveBeenCalledWith(
        'mfa_token_123',
        'sms|dev_123'
      );
      expect(result).toEqual(challengeResult);
    });

    it('should wrap AuthError in MfaError', async () => {
      const authError = new AuthError('challenge_error', 'Challenge failed', {
        code: 'mfa_challenge_failed',
      });
      mockBridge.mfaChallenge.mockRejectedValueOnce(authError);

      try {
        await client.challenge({
          mfaToken: 'mfa_token_123',
          authenticatorId: 'sms|dev_123',
        });
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(MfaError);
        expect((e as MfaError).type).toBe(MfaErrorCodes.CHALLENGE_FAILED);
      }
    });

    it('should rethrow non-AuthError errors as-is', async () => {
      const error = new Error('Challenge failed');
      mockBridge.mfaChallenge.mockRejectedValueOnce(error);

      await expect(
        client.challenge({
          mfaToken: 'mfa_token_123',
          authenticatorId: 'sms|dev_123',
        })
      ).rejects.toThrow(error);
    });
  });

  describe('verify', () => {
    const mockCredentials = {
      idToken: 'id_token',
      accessToken: 'access_token',
      tokenType: 'Bearer',
      expiresAt: 1234567890,
    };

    it('should verify OTP code', async () => {
      mockBridge.mfaVerify.mockResolvedValueOnce(mockCredentials);

      const result = await client.verify({
        mfaToken: 'mfa_token_123',
        otp: '123456',
      });

      expect(mockBridge.mfaVerify).toHaveBeenCalledWith(
        'mfa_token_123',
        'otp',
        '123456'
      );
      expect(result).toEqual(mockCredentials);
    });

    it('should verify OOB code without binding code', async () => {
      mockBridge.mfaVerify.mockResolvedValueOnce(mockCredentials);

      const result = await client.verify({
        mfaToken: 'mfa_token_123',
        oobCode: 'oob_code_123',
      });

      expect(mockBridge.mfaVerify).toHaveBeenCalledWith(
        'mfa_token_123',
        'oob',
        'oob_code_123',
        undefined
      );
      expect(result).toEqual(mockCredentials);
    });

    it('should verify OOB code with binding code', async () => {
      mockBridge.mfaVerify.mockResolvedValueOnce(mockCredentials);

      const result = await client.verify({
        mfaToken: 'mfa_token_123',
        oobCode: 'oob_code_123',
        bindingCode: '654321',
      });

      expect(mockBridge.mfaVerify).toHaveBeenCalledWith(
        'mfa_token_123',
        'oob',
        'oob_code_123',
        '654321'
      );
      expect(result).toEqual(mockCredentials);
    });

    it('should verify recovery code', async () => {
      mockBridge.mfaVerify.mockResolvedValueOnce(mockCredentials);

      const result = await client.verify({
        mfaToken: 'mfa_token_123',
        recoveryCode: 'RECOVERY_CODE_123',
      });

      expect(mockBridge.mfaVerify).toHaveBeenCalledWith(
        'mfa_token_123',
        'recoveryCode',
        'RECOVERY_CODE_123'
      );
      expect(result).toEqual(mockCredentials);
    });

    it('should wrap AuthError in MfaError for invalid_otp', async () => {
      const authError = new AuthError('invalid_otp', 'Invalid OTP', {
        code: 'invalid_otp',
      });
      mockBridge.mfaVerify.mockRejectedValueOnce(authError);

      try {
        await client.verify({ mfaToken: 'mfa_token_123', otp: '000000' });
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(MfaError);
        expect((e as MfaError).type).toBe(MfaErrorCodes.INVALID_OTP);
      }
    });

    it('should rethrow non-AuthError errors as-is', async () => {
      const error = new Error('Verification failed');
      mockBridge.mfaVerify.mockRejectedValueOnce(error);

      await expect(
        client.verify({ mfaToken: 'mfa_token_123', otp: '123456' })
      ).rejects.toThrow(error);
    });
  });
});
