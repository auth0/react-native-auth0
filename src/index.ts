// ========= Error taxonomy =========
// The error classes, their normalized code constants, and the code unions that
// make `switch (error.type)` exhaustive. This is the SDK's stable public error
// contract — see EXAMPLES.md for the full guide.
export {
  AuthError,
  CredentialsManagerError,
  CredentialsManagerErrorCodes,
  WebAuthError,
  WebAuthErrorCodes,
  DPoPError,
  DPoPErrorCodes,
  MfaError,
  MfaErrorCodes,
  PasskeyError,
  PasskeyErrorCodes,
  MyAccountError,
  MyAccountErrorCodes,
} from './core/models';
export type {
  Auth0ErrorCode,
  CredentialsManagerErrorCode,
  WebAuthErrorCode,
  DPoPErrorCode,
  MfaErrorCode,
  PasskeyErrorCode,
  MyAccountErrorCode,
} from './core/models';
export { TimeoutError } from './core/utils/fetchWithTimeout';

// ========= Utilities =========
export { parseIdToken } from './core/utils';

// ========= Enums and runtime constants =========
export { TokenType, MfaFactorType } from './types/common';
export {
  BiometricPolicy,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
  SafariViewControllerPresentationStyle,
} from './types/platform-specific';

// ========= React bindings =========
export { Auth0Provider } from './hooks/Auth0Provider';
export { useAuth0 } from './hooks/useAuth0';
export type { Auth0ContextInterface } from './hooks/Auth0Context';
export type { AuthState } from './hooks/reducer';

// ========= Client interfaces =========
// The contracts behind the `Auth0` facade's getters, so consumers can name the
// types they receive (e.g. when wrapping or mocking a client).
export type {
  IAuth0Client,
  IWebAuthProvider,
  ICredentialsManager,
  IAuthenticationProvider,
  IMyAccountClient,
  IPasswordlessClient,
  IMfaClient,
} from './core/interfaces';

// ========= Core models and options =========
export type {
  ApiCredentials,
  Auth0Options,
  Credentials,
  DPoPHeadersParameters,
  DPoPHeadersParams,
  PasswordlessChallenge,
  SessionTransferCredentials,
  User,
} from './types/common';

// ========= MFA types =========
export type {
  MfaAuthenticator,
  MfaChallengeResult,
  MfaEnrollmentChallenge,
  MfaFactor,
  MfaOobEnrollmentChallenge,
  MfaPushEnrollmentChallenge,
  MfaRecoveryCodeEnrollmentChallenge,
  MfaRequiredErrorPayload,
  MfaRequirements,
  MfaTotpEnrollmentChallenge,
} from './types/common';

// ========= Platform-specific options =========
// `NativeAuthorizeOptions` / `NativeClearSessionOptions` appear directly in the
// `authorize()` and `clearSession()` signatures, so they are part of the public
// surface. The adapter-construction options (`NativeAuth0Options`,
// `WebAuth0Options`) are internal and deliberately not exported.
export type {
  LocalAuthenticationOptions,
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
  WebAuthorizeOptions,
  WebClearSessionOptions,
} from './types/platform-specific';

// ========= Method parameters and API payloads =========
export * from './types/parameters';

// ========= Auth0 client =========
export { default, default as Auth0 } from './Auth0';
