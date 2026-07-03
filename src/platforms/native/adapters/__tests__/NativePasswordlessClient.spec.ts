import { NativePasswordlessClient } from '../NativePasswordlessClient';
import type { INativeBridge } from '../../bridge';

const mockBridge = {
  passwordlessChallengeWithEmail: jest.fn(),
  passwordlessChallengeWithPhoneNumber: jest.fn(),
  passwordlessLoginWithOTP: jest.fn(),
} as unknown as jest.Mocked<INativeBridge>;

describe('NativePasswordlessClient', () => {
  let client: NativePasswordlessClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new NativePasswordlessClient(mockBridge);
  });

  describe('challengeWithEmail', () => {
    it('forwards email and connection and defaults allowSignup', async () => {
      mockBridge.passwordlessChallengeWithEmail.mockResolvedValueOnce({
        authSession: 'session_email',
      });

      const result = await client.challengeWithEmail({
        email: 'user@example.com',
        connection: 'my-db',
      });

      expect(mockBridge.passwordlessChallengeWithEmail).toHaveBeenCalledWith(
        'user@example.com',
        'my-db',
        false
      );
      expect(result).toEqual({ authSession: 'session_email' });
    });

    it('passes through provided connection and allowSignup', async () => {
      mockBridge.passwordlessChallengeWithEmail.mockResolvedValueOnce({
        authSession: 'session_email',
      });

      await client.challengeWithEmail({
        email: 'user@example.com',
        connection: 'custom-db',
        allowSignup: true,
      });

      expect(mockBridge.passwordlessChallengeWithEmail).toHaveBeenCalledWith(
        'user@example.com',
        'custom-db',
        true
      );
    });

    it('propagates errors from the bridge', async () => {
      const error = new Error('challenge failed');
      mockBridge.passwordlessChallengeWithEmail.mockRejectedValueOnce(error);

      await expect(
        client.challengeWithEmail({
          email: 'user@example.com',
          connection: 'my-db',
        })
      ).rejects.toThrow(error);
    });
  });

  describe('challengeWithPhoneNumber', () => {
    it('forwards connection and defaults deliveryMethod and allowSignup', async () => {
      mockBridge.passwordlessChallengeWithPhoneNumber.mockResolvedValueOnce({
        authSession: 'session_phone',
      });

      const result = await client.challengeWithPhoneNumber({
        phoneNumber: '+15555550123',
        connection: 'my-db',
      });

      expect(
        mockBridge.passwordlessChallengeWithPhoneNumber
      ).toHaveBeenCalledWith('+15555550123', 'my-db', 'text', false);
      expect(result).toEqual({ authSession: 'session_phone' });
    });

    it('passes through provided values including voice delivery', async () => {
      mockBridge.passwordlessChallengeWithPhoneNumber.mockResolvedValueOnce({
        authSession: 'session_phone',
      });

      await client.challengeWithPhoneNumber({
        phoneNumber: '+15555550123',
        connection: 'custom-db',
        deliveryMethod: 'voice',
        allowSignup: true,
      });

      expect(
        mockBridge.passwordlessChallengeWithPhoneNumber
      ).toHaveBeenCalledWith('+15555550123', 'custom-db', 'voice', true);
    });
  });

  describe('loginWithOTP', () => {
    const credentials = {
      idToken: 'id_token',
      accessToken: 'access_token',
      tokenType: 'Bearer',
      expiresAt: 1700000000,
    };

    it('forwards the challenge authSession and otp', async () => {
      mockBridge.passwordlessLoginWithOTP.mockResolvedValueOnce(credentials);

      const result = await client.loginWithOTP({
        challenge: { authSession: 'session_login' },
        otp: '123456',
      });

      expect(mockBridge.passwordlessLoginWithOTP).toHaveBeenCalledWith(
        'session_login',
        '123456',
        undefined,
        undefined
      );
      expect(result).toEqual(credentials);
    });

    it('forwards audience and scope when provided', async () => {
      mockBridge.passwordlessLoginWithOTP.mockResolvedValueOnce(credentials);

      await client.loginWithOTP({
        challenge: { authSession: 'session_login' },
        otp: '123456',
        audience: 'https://api.example.com',
        scope: 'openid profile',
      });

      expect(mockBridge.passwordlessLoginWithOTP).toHaveBeenCalledWith(
        'session_login',
        '123456',
        'https://api.example.com',
        'openid profile'
      );
    });

    it('propagates errors from the bridge', async () => {
      const error = new Error('login failed');
      mockBridge.passwordlessLoginWithOTP.mockRejectedValueOnce(error);

      await expect(
        client.loginWithOTP({
          challenge: { authSession: 'session_login' },
          otp: '000000',
        })
      ).rejects.toThrow(error);
    });
  });
});
