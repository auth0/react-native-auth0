import type { IMyAccountClient } from '../../../core/interfaces';
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
} from '../../../types';
import type { INativeBridge } from '../bridge';
import { AuthError, PasskeyError, MyAccountError } from '../../../core/models';

export class NativeMyAccountClient implements IMyAccountClient {
  private readonly bridge: INativeBridge;

  constructor(bridge: INativeBridge) {
    this.bridge = bridge;
  }

  // --- Passkey Enrollment (uses PasskeyError) ---

  async passkeyEnrollmentChallenge(
    parameters: PasskeyEnrollmentChallengeParameters
  ): Promise<PasskeyEnrollmentChallengeResponse> {
    const { accessToken, userIdentity, connection } = parameters;
    try {
      return await this.bridge.passkeyEnrollmentChallenge(
        accessToken,
        userIdentity || undefined,
        connection || undefined
      );
    } catch (e) {
      if (e instanceof AuthError) {
        throw new PasskeyError(e);
      }
      throw e;
    }
  }

  async enrollPasskey(
    parameters: EnrollPasskeyParameters
  ): Promise<PasskeyAuthenticationMethod> {
    const {
      accessToken,
      authenticationMethodId,
      authSession,
      authResponse,
      authParamsPublicKey,
    } = parameters;
    try {
      return (await this.bridge.enrollPasskey(
        accessToken,
        authenticationMethodId,
        authSession,
        authResponse,
        JSON.stringify(authParamsPublicKey)
      )) as PasskeyAuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new PasskeyError(e);
      }
      throw e;
    }
  }

  // --- Factor Enrollment (uses MyAccountError) ---

  async enrollPhone(
    parameters: EnrollPhoneParameters
  ): Promise<EnrollmentChallenge> {
    const { accessToken, phoneNumber, preferredAuthenticationMethod } =
      parameters;
    try {
      return (await this.bridge.enrollPhone(
        accessToken,
        phoneNumber,
        preferredAuthenticationMethod || undefined
      )) as EnrollmentChallenge;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async enrollEmail(
    parameters: EnrollEmailParameters
  ): Promise<EnrollmentChallenge> {
    const { accessToken, emailAddress } = parameters;
    try {
      return (await this.bridge.enrollEmail(
        accessToken,
        emailAddress
      )) as EnrollmentChallenge;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async enrollTOTP(
    parameters: EnrollTOTPParameters
  ): Promise<TOTPEnrollmentChallenge> {
    const { accessToken } = parameters;
    try {
      return (await this.bridge.enrollTOTP(
        accessToken
      )) as TOTPEnrollmentChallenge;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async enrollPushNotification(
    parameters: EnrollPushNotificationParameters
  ): Promise<TOTPEnrollmentChallenge> {
    const { accessToken } = parameters;
    try {
      return (await this.bridge.enrollPushNotification(
        accessToken
      )) as TOTPEnrollmentChallenge;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async enrollRecoveryCode(
    parameters: EnrollRecoveryCodeParameters
  ): Promise<RecoveryCodeEnrollmentChallenge> {
    const { accessToken } = parameters;
    try {
      return (await this.bridge.enrollRecoveryCode(
        accessToken
      )) as RecoveryCodeEnrollmentChallenge;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  // --- Enrollment Confirmation (uses MyAccountError) ---

  async confirmPhoneEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    try {
      return (await this.bridge.confirmEnrollmentWithOtp(
        accessToken,
        id,
        authSession,
        otpCode
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async confirmEmailEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    try {
      return (await this.bridge.confirmEnrollmentWithOtp(
        accessToken,
        id,
        authSession,
        otpCode
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async confirmTOTPEnrollment(
    parameters: ConfirmOTPEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession, otpCode } = parameters;
    try {
      return (await this.bridge.confirmEnrollmentWithOtp(
        accessToken,
        id,
        authSession,
        otpCode
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async confirmPushNotificationEnrollment(
    parameters: ConfirmPushNotificationEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession } = parameters;
    try {
      return (await this.bridge.confirmEnrollment(
        accessToken,
        id,
        authSession
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async confirmRecoveryCodeEnrollment(
    parameters: ConfirmRecoveryCodeEnrollmentParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, authSession } = parameters;
    try {
      return (await this.bridge.confirmEnrollment(
        accessToken,
        id,
        authSession
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  // --- Authentication Method Management (uses MyAccountError) ---

  async getAuthenticationMethods(
    parameters: GetAuthenticationMethodsParameters
  ): Promise<AuthenticationMethod[]> {
    const { accessToken, type } = parameters;
    try {
      return (await this.bridge.getAuthenticationMethods(
        accessToken,
        type || undefined
      )) as AuthenticationMethod[];
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async getAuthenticationMethodById(
    parameters: GetAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id } = parameters;
    try {
      return (await this.bridge.getAuthenticationMethodById(
        accessToken,
        id
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async updateAuthenticationMethodById(
    parameters: UpdateAuthenticationMethodByIdParameters
  ): Promise<AuthenticationMethod> {
    const { accessToken, id, name, preferredAuthenticationMethod } = parameters;
    try {
      return (await this.bridge.updateAuthenticationMethodById(
        accessToken,
        id,
        name || undefined,
        preferredAuthenticationMethod || undefined
      )) as AuthenticationMethod;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  async deleteAuthenticationMethodById(
    parameters: DeleteAuthenticationMethodByIdParameters
  ): Promise<void> {
    const { accessToken, id } = parameters;
    try {
      await this.bridge.deleteAuthenticationMethodById(accessToken, id);
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }

  // --- Factors (uses MyAccountError) ---

  async getFactors(parameters: GetFactorsParameters): Promise<Factor[]> {
    const { accessToken } = parameters;
    try {
      return (await this.bridge.getFactors(accessToken)) as Factor[];
    } catch (e) {
      if (e instanceof AuthError) {
        throw new MyAccountError(e);
      }
      throw e;
    }
  }
}
