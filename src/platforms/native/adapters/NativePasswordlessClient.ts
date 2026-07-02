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

  /**
   * Issues an OTP challenge to an email address for a database connection.
   *
   * @param parameters The email-challenge parameters.
   * @returns A promise resolving with a {@link PasswordlessChallenge}.
   */
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

  /**
   * Issues an OTP challenge to a phone number for a database connection.
   *
   * @param parameters The phone-challenge parameters.
   * @returns A promise resolving with a {@link PasswordlessChallenge}.
   */
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

  /**
   * Completes the OTP flow by verifying the one-time code and obtaining credentials.
   *
   * @param parameters The login parameters including the challenge and OTP code.
   * @returns A promise resolving with the user's {@link Credentials}.
   */
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
