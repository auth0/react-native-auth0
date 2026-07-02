import type {
  Credentials,
  PasswordlessChallenge,
  PasswordlessChallengeEmailParameters,
  PasswordlessChallengePhoneParameters,
  PasswordlessLoginOtpParameters,
} from '../../types';

/**
 * Client for the passwordless OTP flow on database connections.
 *
 * This is a two-step, challenge-response flow: issue a challenge to an email or
 * phone number (which delivers a one-time code and returns an opaque
 * `auth_session`), then complete the login by verifying the code.
 *
 * @remarks Native only (iOS, Android). Not supported on web.
 */
export interface IPasswordlessClient {
  /**
   * Issues an OTP challenge to an email address for a database connection.
   *
   * @param parameters The email-challenge parameters.
   * @returns A promise resolving with a {@link PasswordlessChallenge}.
   */
  challengeWithEmail(
    parameters: PasswordlessChallengeEmailParameters
  ): Promise<PasswordlessChallenge>;

  /**
   * Issues an OTP challenge to a phone number for a database connection.
   *
   * @param parameters The phone-challenge parameters.
   * @returns A promise resolving with a {@link PasswordlessChallenge}.
   */
  challengeWithPhoneNumber(
    parameters: PasswordlessChallengePhoneParameters
  ): Promise<PasswordlessChallenge>;

  /**
   * Completes the OTP flow by verifying the one-time code and obtaining credentials.
   *
   * @param parameters The login parameters including the challenge and OTP code.
   * @returns A promise resolving with the user's {@link Credentials}.
   */
  loginWithOTP(
    parameters: PasswordlessLoginOtpParameters
  ): Promise<Credentials>;
}
