import type { IPasswordlessClient } from '../../../core/interfaces';
import type {
  Credentials,
  PasswordlessChallenge,
  PasswordlessChallengeEmailParameters,
  PasswordlessChallengePhoneParameters,
  PasswordlessLoginOtpParameters,
} from '../../../types';
import { AuthError } from '../../../core/models';

const NOT_SUPPORTED = 'Passwordless OTP is not supported on the web platform';

export class WebPasswordlessClient implements IPasswordlessClient {
  async challengeWithEmail(
    _parameters: PasswordlessChallengeEmailParameters
  ): Promise<PasswordlessChallenge> {
    throw new AuthError('UnsupportedOperation', NOT_SUPPORTED);
  }

  async challengeWithPhoneNumber(
    _parameters: PasswordlessChallengePhoneParameters
  ): Promise<PasswordlessChallenge> {
    throw new AuthError('UnsupportedOperation', NOT_SUPPORTED);
  }

  async loginWithOTP(
    _parameters: PasswordlessLoginOtpParameters
  ): Promise<Credentials> {
    throw new AuthError('UnsupportedOperation', NOT_SUPPORTED);
  }
}
