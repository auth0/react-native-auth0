import type {
  Credentials,
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
  MfaGetAuthenticatorsParameters,
  MfaEnrollParameters,
  MfaChallengeWithAuthenticatorParameters,
  MfaVerifyParameters,
} from '../../types';

/**
 * Defines the contract for MFA operations using the Flexible Factors Grant.
 *
 * An MFA client is scoped to a single MFA flow, initialized with an mfaToken
 * from an MFA_REQUIRED error. It provides methods to list authenticators,
 * enroll new factors, challenge existing factors, and verify MFA codes.
 */
export interface IMfaClient {
  /**
   * Lists the user's enrolled MFA authenticators.
   *
   * @param parameters Parameters including the MFA token and optional factor filter.
   * @returns A promise that resolves with the list of enrolled authenticators.
   */
  getAuthenticators(
    parameters: MfaGetAuthenticatorsParameters
  ): Promise<MfaAuthenticator[]>;

  /**
   * Enrolls a new MFA factor for the user.
   *
   * @param parameters Parameters specifying the factor type and any required values.
   * @returns A promise that resolves with the enrollment challenge details.
   */
  enroll(parameters: MfaEnrollParameters): Promise<MfaEnrollmentChallenge>;

  /**
   * Requests an MFA challenge for a specific enrolled authenticator.
   *
   * @param parameters Parameters including the MFA token and authenticator ID.
   * @returns A promise that resolves with the challenge details.
   */
  challenge(
    parameters: MfaChallengeWithAuthenticatorParameters
  ): Promise<MfaChallengeResult>;

  /**
   * Verifies an MFA code and returns credentials on success.
   *
   * @param parameters Parameters for verification (OTP, OOB, or recovery code).
   * @returns A promise that resolves with the user's credentials.
   */
  verify(parameters: MfaVerifyParameters): Promise<Credentials>;
}
