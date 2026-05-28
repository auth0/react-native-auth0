import type {
  PasskeyEnrollmentChallengeParameters,
  PasskeyEnrollmentChallengeResponse,
  EnrollPasskeyParameters,
  PasskeyAuthenticationMethod,
  GetAuthenticationMethodsParameters,
  GetAuthenticationMethodParameters,
  UpdateAuthenticationMethodParameters,
  DeleteAuthenticationMethodParameters,
  AuthenticationMethod,
  EnrollPhoneParameters,
  EnrollEmailParameters,
  EnrollTOTPParameters,
  EnrollPushNotificationParameters,
  EnrollRecoveryCodeParameters,
  ConfirmEnrollmentParameters,
  ConfirmRecoveryCodeEnrollmentParameters,
  ConfirmPushNotificationEnrollmentParameters,
  GetFactorsParameters,
  EnrollmentChallenge,
  TOTPEnrollmentChallenge,
  RecoveryCodeEnrollmentChallenge,
  Factor,
} from '../../types';

export interface IMyAccountClient {
  // --- Passkey Enrollment ---

  passkeyEnrollmentChallenge(
    parameters: PasskeyEnrollmentChallengeParameters
  ): Promise<PasskeyEnrollmentChallengeResponse>;

  enrollPasskey(
    parameters: EnrollPasskeyParameters
  ): Promise<PasskeyAuthenticationMethod>;

  // --- Factor Enrollment ---

  enrollPhone(parameters: EnrollPhoneParameters): Promise<EnrollmentChallenge>;

  enrollEmail(parameters: EnrollEmailParameters): Promise<EnrollmentChallenge>;

  enrollTOTP(
    parameters: EnrollTOTPParameters
  ): Promise<TOTPEnrollmentChallenge>;

  enrollPushNotification(
    parameters: EnrollPushNotificationParameters
  ): Promise<TOTPEnrollmentChallenge>;

  enrollRecoveryCode(
    parameters: EnrollRecoveryCodeParameters
  ): Promise<RecoveryCodeEnrollmentChallenge>;

  // --- Enrollment Confirmation ---

  confirmPhoneEnrollment(
    parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmEmailEnrollment(
    parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmTOTPEnrollment(
    parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmPushNotificationEnrollment(
    parameters: ConfirmPushNotificationEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmRecoveryCodeEnrollment(
    parameters: ConfirmRecoveryCodeEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  // --- Authentication Method Management ---

  getAuthenticationMethods(
    parameters: GetAuthenticationMethodsParameters
  ): Promise<AuthenticationMethod[]>;

  getAuthenticationMethod(
    parameters: GetAuthenticationMethodParameters
  ): Promise<AuthenticationMethod>;

  updateAuthenticationMethod(
    parameters: UpdateAuthenticationMethodParameters
  ): Promise<AuthenticationMethod>;

  deleteAuthenticationMethod(
    parameters: DeleteAuthenticationMethodParameters
  ): Promise<void>;

  // --- Factors ---

  getFactors(parameters: GetFactorsParameters): Promise<Factor[]>;
}
