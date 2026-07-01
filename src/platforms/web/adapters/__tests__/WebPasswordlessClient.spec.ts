import { WebPasswordlessClient } from '../WebPasswordlessClient';
import { AuthError } from '../../../../core/models';

describe('WebPasswordlessClient', () => {
  let client: WebPasswordlessClient;

  beforeEach(() => {
    client = new WebPasswordlessClient();
  });

  it('challengeWithEmail rejects with an UnsupportedOperation AuthError', async () => {
    await expect(
      client.challengeWithEmail({ email: 'user@example.com' })
    ).rejects.toThrow(AuthError);
    await expect(
      client.challengeWithEmail({ email: 'user@example.com' })
    ).rejects.toMatchObject({ name: 'UnsupportedOperation' });
  });

  it('challengeWithPhoneNumber rejects with an UnsupportedOperation AuthError', async () => {
    await expect(
      client.challengeWithPhoneNumber({ phoneNumber: '+15555550123' })
    ).rejects.toThrow(AuthError);
    await expect(
      client.challengeWithPhoneNumber({ phoneNumber: '+15555550123' })
    ).rejects.toMatchObject({ name: 'UnsupportedOperation' });
  });

  it('loginWithOTP rejects with an UnsupportedOperation AuthError', async () => {
    await expect(
      client.loginWithOTP({
        challenge: { authSession: 'session' },
        otp: '123456',
      })
    ).rejects.toThrow(AuthError);
    await expect(
      client.loginWithOTP({
        challenge: { authSession: 'session' },
        otp: '123456',
      })
    ).rejects.toMatchObject({ name: 'UnsupportedOperation' });
  });
});
