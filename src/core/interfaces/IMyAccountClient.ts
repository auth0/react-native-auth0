import type {
  PasskeyEnrollmentChallengeParameters,
  PasskeyEnrollmentChallengeResponse,
  EnrollPasskeyParameters,
  PasskeyAuthenticationMethod,
  GetAuthenticationMethodsParameters,
  GetAuthenticationMethodByIdParameters,
  UpdateAuthenticationMethodByIdParameters,
  DeleteAuthenticationMethodByIdParameters,
  AuthenticationMethod,
  EnrollPhoneParameters,
  EnrollEmailParameters,
  EnrollTOTPParameters,
  EnrollPushNotificationParameters,
  EnrollRecoveryCodeParameters,
  ConfirmOTPEnrollmentParameters,
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
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmEmailEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod>;

  confirmTOTPEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
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

  getAuthenticationMethodById(
    parameters: GetAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod>;

  updateAuthenticationMethodById(
    parameters: UpdateAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod>;

  deleteAuthenticationMethodById(
    parameters: DeleteAuthenticationMethodByIdParameters
  ): Promise<void>;

  // --- Factors ---

  getFactors(parameters: GetFactorsParameters): Promise<Factor[]>;
}
