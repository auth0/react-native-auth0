import type { IAuthenticationProvider } from '../../../core/interfaces';
import { AuthError } from '../../../core/models';

const webAuthNotSupported =
  'This authentication method is not available on the web platform for security reasons. Please use the browser-based authorize() flow.';
const webRefreshHandled =
  'Token refresh is handled automatically by `credentialsManager.getCredentials()` on the web.';
const webUserInfoHandled =
  'User Info should be retrieved by decoding the ID token from `credentialsManager.getCredentials()` on the web.';

/**
 * An IAuthenticationProvider implementation for the web that explicitly
 * disallows direct-grant authentication methods for security reasons.
 */

export const UnimplementedWebAuthenticationProvider: IAuthenticationProvider = {
  // Original stubs
  passwordRealm: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  refreshToken: () =>
    Promise.reject(new AuthError('NotImplemented', webRefreshHandled)),
  userInfo: () =>
    Promise.reject(new AuthError('NotImplemented', webUserInfoHandled)),
  revoke: () =>
    Promise.reject(
      new AuthError(
        'NotImplemented',
        '`revoke` is not available on the web platform.'
      )
    ),

  // Stubs for newly added methods
  exchange: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  exchangeNativeSocial: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  passwordlessWithEmail: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  passwordlessWithSMS: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  loginWithEmail: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  loginWithSMS: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  loginWithOTP: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  loginWithOOB: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  loginWithRecoveryCode: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  multifactorChallenge: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  resetPassword: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
  createUser: () =>
    Promise.reject(new AuthError('NotImplemented', webAuthNotSupported)),
};
