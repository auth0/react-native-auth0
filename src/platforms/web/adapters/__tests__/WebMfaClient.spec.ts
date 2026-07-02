import { WebMfaClient } from '../WebMfaClient';
import { MfaError } from '../../../../core/models';
import { TokenType } from '../../../../types/common';

type MockMfa = {
  setMFAAuthDetails: jest.Mock;
  getAuthenticators: jest.Mock;
  enroll: jest.Mock;
  challenge: jest.Mock;
  verify: jest.Mock;
};

const createMockMfa = (): MockMfa => ({
  setMFAAuthDetails: jest.fn(),
  getAuthenticators: jest.fn(),
  enroll: jest.fn(),
  challenge: jest.fn(),
  verify: jest.fn(),
});

describe('WebMfaClient', () => {
  let spaMfa: MockMfa;
  let client: WebMfaClient;

  beforeEach(() => {
    spaMfa = createMockMfa();
    client = new WebMfaClient(spaMfa as any, TokenType.bearer);
  });

  describe('getAuthenticators', () => {
    const authenticators = [
      {
        id: 'otp|dev_1',
        authenticatorType: 'otp',
        active: true,
        name: 'Authenticator app',
        type: 'otp',
      },
      {
        id: 'sms|dev_2',
        authenticatorType: 'oob',
        active: true,
        name: 'SMS',
        type: 'oob',
        oobChannels: ['sms'],
      },
      {
        id: 'email|dev_3',
        authenticatorType: 'oob',
        active: false,
        type: 'oob',
        oobChannels: ['email'],
      },
    ];

    it('does not clobber the spa-js MFA context', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      await client.getAuthenticators({ mfaToken: 'MFA_TOKEN' });

      expect(spaMfa.setMFAAuthDetails).not.toHaveBeenCalled();
      expect(spaMfa.getAuthenticators).toHaveBeenCalledWith('MFA_TOKEN');
    });

    it('seeds a permissive context and retries when spa-js reports a missing context', async () => {
      spaMfa.getAuthenticators
        .mockRejectedValueOnce({
          error: 'invalid_request',
          error_description:
            'challengeType is required and must contain at least one challenge type, please check mfa_required error payload',
        })
        .mockResolvedValueOnce(authenticators);

      const result = await client.getAuthenticators({ mfaToken: 'MFA_TOKEN' });

      expect(spaMfa.setMFAAuthDetails).toHaveBeenCalledWith(
        'MFA_TOKEN',
        undefined,
        undefined,
        expect.objectContaining({
          challenge: expect.arrayContaining([
            { type: 'otp' },
            { type: 'phone' },
            { type: 'email' },
            { type: 'push-notification' },
          ]),
        })
      );
      expect(spaMfa.getAuthenticators).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(3);
    });

    it('does not retry on errors other than invalid_request', async () => {
      spaMfa.getAuthenticators.mockRejectedValue({
        error: 'invalid_grant',
        error_description: 'Malformed mfa_token',
      });

      await expect(
        client.getAuthenticators({ mfaToken: 'MFA_TOKEN' })
      ).rejects.toBeInstanceOf(MfaError);

      expect(spaMfa.setMFAAuthDetails).not.toHaveBeenCalled();
      expect(spaMfa.getAuthenticators).toHaveBeenCalledTimes(1);
    });

    it('maps oobChannel from the first oobChannels entry', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      const result = await client.getAuthenticators({ mfaToken: 'MFA_TOKEN' });

      expect(result).toEqual([
        {
          id: 'otp|dev_1',
          type: 'otp',
          authenticatorType: 'otp',
          active: true,
          name: 'Authenticator app',
          oobChannel: undefined,
        },
        {
          id: 'sms|dev_2',
          type: 'oob',
          authenticatorType: 'oob',
          active: true,
          name: 'SMS',
          oobChannel: 'sms',
        },
        {
          id: 'email|dev_3',
          type: 'oob',
          authenticatorType: 'oob',
          active: false,
          name: undefined,
          oobChannel: 'email',
        },
      ]);
    });

    it('filters otp by authenticatorType', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      const result = await client.getAuthenticators({
        mfaToken: 'MFA_TOKEN',
        factorsAllowed: ['otp'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('otp|dev_1');
    });

    it('filters oob factors by oobChannel', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      const result = await client.getAuthenticators({
        mfaToken: 'MFA_TOKEN',
        factorsAllowed: ['sms'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sms|dev_2');
    });

    it('matches push against the auth0 oobChannel', async () => {
      spaMfa.getAuthenticators.mockResolvedValue([
        {
          id: 'push|dev_4',
          authenticatorType: 'oob',
          active: true,
          name: 'Guardian',
          type: 'oob',
          oobChannels: ['auth0'],
        },
      ]);

      const result = await client.getAuthenticators({
        mfaToken: 'MFA_TOKEN',
        factorsAllowed: ['push'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('push|dev_4');
    });

    it('supports multiple factors at once', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      const result = await client.getAuthenticators({
        mfaToken: 'MFA_TOKEN',
        factorsAllowed: ['otp', 'email'],
      });

      expect(result.map((a) => a.id)).toEqual(['otp|dev_1', 'email|dev_3']);
    });

    it('returns all authenticators when factorsAllowed is empty', async () => {
      spaMfa.getAuthenticators.mockResolvedValue(authenticators);

      const result = await client.getAuthenticators({
        mfaToken: 'MFA_TOKEN',
        factorsAllowed: [],
      });

      expect(result).toHaveLength(3);
    });

    it('wraps failures in MfaError', async () => {
      spaMfa.getAuthenticators.mockRejectedValue({
        error: 'invalid_token',
        error_description: 'bad token',
        status: 401,
      });

      await expect(
        client.getAuthenticators({ mfaToken: 'MFA_TOKEN' })
      ).rejects.toBeInstanceOf(MfaError);
    });
  });

  describe('challenge', () => {
    beforeEach(() => {
      spaMfa.challenge.mockResolvedValue({
        challengeType: 'oob',
        oobCode: 'oob_123',
        bindingMethod: 'prompt',
      });
    });

    it("derives challengeType 'otp' for otp-prefixed authenticators", async () => {
      await client.challenge({
        mfaToken: 'MFA_TOKEN',
        authenticatorId: 'otp|dev_1',
      });

      expect(spaMfa.challenge).toHaveBeenCalledWith(
        expect.objectContaining({ challengeType: 'otp' })
      );
    });

    it("derives challengeType 'otp' for totp-prefixed authenticators", async () => {
      await client.challenge({
        mfaToken: 'MFA_TOKEN',
        authenticatorId: 'totp|dev_1',
      });

      expect(spaMfa.challenge).toHaveBeenCalledWith(
        expect.objectContaining({ challengeType: 'otp' })
      );
    });

    it("derives challengeType 'oob' for sms/push/email authenticators", async () => {
      for (const id of ['sms|dev_2', 'push|dev_3', 'email|dev_4']) {
        await client.challenge({ mfaToken: 'MFA_TOKEN', authenticatorId: id });
        expect(spaMfa.challenge).toHaveBeenLastCalledWith(
          expect.objectContaining({ challengeType: 'oob' })
        );
      }
    });

    it('does not clobber the spa-js MFA context', async () => {
      await client.challenge({
        mfaToken: 'MFA_TOKEN',
        authenticatorId: 'sms|dev_2',
      });

      expect(spaMfa.setMFAAuthDetails).not.toHaveBeenCalled();
    });
  });

  describe('enroll', () => {
    it('maps a TOTP enrollment response', async () => {
      spaMfa.enroll.mockResolvedValue({
        authenticatorType: 'otp',
        barcodeUri: 'otpauth://totp/x',
        secret: 'SECRET',
        recoveryCodes: ['r1'],
      });

      const result = await client.enroll({
        mfaToken: 'MFA_TOKEN',
        factorType: 'otp',
      });

      expect(result).toEqual({
        type: 'totp',
        barcodeUri: 'otpauth://totp/x',
        secret: 'SECRET',
        recoveryCodes: ['r1'],
      });
      expect(spaMfa.setMFAAuthDetails).not.toHaveBeenCalled();
    });

    it('maps a push enrollment response with barcodeUri', async () => {
      spaMfa.enroll.mockResolvedValue({
        authenticatorType: 'oob',
        oobChannel: 'auth0',
        oobCode: 'oob_push',
        barcodeUri: 'otpauth://totp/guardian',
        recoveryCodes: ['r1'],
      });

      const result = await client.enroll({
        mfaToken: 'MFA_TOKEN',
        factorType: 'push',
      });

      expect(result).toEqual({
        type: 'push',
        barcodeUri: 'otpauth://totp/guardian',
        oobCode: 'oob_push',
        oobChannel: 'auth0',
        recoveryCodes: ['r1'],
      });
    });

    it('maps an OOB enrollment response', async () => {
      spaMfa.enroll.mockResolvedValue({
        authenticatorType: 'oob',
        oobCode: 'oob_123',
        bindingMethod: 'prompt',
      });

      const result = await client.enroll({
        mfaToken: 'MFA_TOKEN',
        factorType: 'sms',
        phoneNumber: '+12025550135',
      });

      expect(result).toEqual({
        type: 'oob',
        oobCode: 'oob_123',
        bindingMethod: 'prompt',
        recoveryCodes: undefined,
      });
      expect(spaMfa.enroll).toHaveBeenCalledWith(
        expect.objectContaining({ phoneNumber: '+12025550135' })
      );
    });
  });

  describe('verify', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    });

    afterEach(() => {
      (Date.now as jest.Mock).mockRestore();
    });

    it('maps a successful otp verification and preserves scope', async () => {
      spaMfa.verify.mockResolvedValue({
        access_token: 'at',
        id_token: 'it',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile',
        refresh_token: 'rt',
      });

      const result = await client.verify({ mfaToken: 'MFA_TOKEN', otp: '123' });

      expect(spaMfa.verify).toHaveBeenCalledWith({
        mfaToken: 'MFA_TOKEN',
        otp: '123',
      });
      expect(spaMfa.setMFAAuthDetails).not.toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'at',
        idToken: 'it',
        tokenType: 'Bearer',
        expiresAt: 1000 + 3600,
        scope: 'openid profile',
        refreshToken: 'rt',
      });
    });

    it('passes oobCode and bindingCode through', async () => {
      spaMfa.verify.mockResolvedValue({
        access_token: 'at',
        id_token: 'it',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      await client.verify({
        mfaToken: 'MFA_TOKEN',
        oobCode: 'oob_123',
        bindingCode: '000000',
      });

      expect(spaMfa.verify).toHaveBeenCalledWith({
        mfaToken: 'MFA_TOKEN',
        oobCode: 'oob_123',
        bindingCode: '000000',
      });
    });

    it('seeds scope and audience via setMFAAuthDetails before verifying', async () => {
      spaMfa.verify.mockResolvedValue({
        access_token: 'at',
        id_token: 'it',
        token_type: 'Bearer',
        expires_in: 3600,
      });

      await client.verify({
        mfaToken: 'MFA_TOKEN',
        otp: '123',
        scope: 'openid profile',
        audience: 'https://api.example.com',
      });

      expect(spaMfa.setMFAAuthDetails).toHaveBeenCalledWith(
        'MFA_TOKEN',
        'openid profile',
        'https://api.example.com'
      );
      expect(spaMfa.verify).toHaveBeenCalledWith({
        mfaToken: 'MFA_TOKEN',
        otp: '123',
      });
    });

    it('wraps failures in MfaError', async () => {
      spaMfa.verify.mockRejectedValue({
        error: 'invalid_grant',
        error_description: 'wrong code',
      });

      await expect(
        client.verify({ mfaToken: 'MFA_TOKEN', otp: 'bad' })
      ).rejects.toBeInstanceOf(MfaError);
    });
  });
});
