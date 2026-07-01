import type { IPasswordlessClient } from '../../../core/interfaces';
import type {
  Credentials,
  PasswordlessChallenge,
  PasswordlessChallengeEmailParameters,
  PasswordlessChallengePhoneParameters,
  PasswordlessLoginOtpParameters,
} from '../../../types';
import type { INativeBridge } from '../bridge';

export class NativePasswordlessClient implements IPasswordlessClient {
  private readonly bridge: INativeBridge;

  constructor(bridge: INativeBridge) {
    this.bridge = bridge;
  }

  async challengeWithEmail(
    parameters: PasswordlessChallengeEmailParameters
  ): Promise<PasswordlessChallenge> {
    const { email, connection, allowSignup } = parameters;
    return this.bridge.passwordlessChallengeWithEmail(
      email,
      connection,
      allowSignup ?? false
    );
  }

  async challengeWithPhoneNumber(
    parameters: PasswordlessChallengePhoneParameters
  ): Promise<PasswordlessChallenge> {
    const { phoneNumber, connection, deliveryMethod, allowSignup } = parameters;
    return this.bridge.passwordlessChallengeWithPhoneNumber(
      phoneNumber,
      connection,
      deliveryMethod ?? 'text',
      allowSignup ?? false
    );
  }

  async loginWithOTP(
    parameters: PasswordlessLoginOtpParameters
  ): Promise<Credentials> {
    const { challenge, otp, audience, scope } = parameters;
    return this.bridge.passwordlessLoginWithOTP(
      challenge.authSession,
      otp,
      audience,
      scope
    );
  }
}
