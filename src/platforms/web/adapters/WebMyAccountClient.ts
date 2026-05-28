import type { IMyAccountClient } from '../../../core/interfaces';
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
} from '../../../types';
import { AuthError, PasskeyError, MyAccountError } from '../../../core/models';

export class WebMyAccountClient implements IMyAccountClient {
  async passkeyEnrollmentChallenge(
    _parameters: PasskeyEnrollmentChallengeParameters
  ): Promise<PasskeyEnrollmentChallengeResponse> {
    throw new PasskeyError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollPasskey(
    _parameters: EnrollPasskeyParameters
  ): Promise<PasskeyAuthenticationMethod> {
    throw new PasskeyError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollPhone(
    _parameters: EnrollPhoneParameters
  ): Promise<EnrollmentChallenge> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollEmail(
    _parameters: EnrollEmailParameters
  ): Promise<EnrollmentChallenge> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollTOTP(
    _parameters: EnrollTOTPParameters
  ): Promise<TOTPEnrollmentChallenge> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollPushNotification(
    _parameters: EnrollPushNotificationParameters
  ): Promise<TOTPEnrollmentChallenge> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async enrollRecoveryCode(
    _parameters: EnrollRecoveryCodeParameters
  ): Promise<RecoveryCodeEnrollmentChallenge> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async confirmPhoneEnrollment(
    _parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async confirmEmailEnrollment(
    _parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async confirmTOTPEnrollment(
    _parameters: ConfirmEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async confirmPushNotificationEnrollment(
    _parameters: ConfirmPushNotificationEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async confirmRecoveryCodeEnrollment(
    _parameters: ConfirmRecoveryCodeEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async getAuthenticationMethods(
    _parameters: GetAuthenticationMethodsParameters
  ): Promise<AuthenticationMethod[]> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async getAuthenticationMethod(
    _parameters: GetAuthenticationMethodParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async updateAuthenticationMethod(
    _parameters: UpdateAuthenticationMethodParameters
  ): Promise<AuthenticationMethod> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async deleteAuthenticationMethod(
    _parameters: DeleteAuthenticationMethodParameters
  ): Promise<void> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }

  async getFactors(_parameters: GetFactorsParameters): Promise<Factor[]> {
    throw new MyAccountError(
      new AuthError(
        'UnsupportedOperation',
        'My Account API is not supported on the web platform'
      )
    );
  }
}
