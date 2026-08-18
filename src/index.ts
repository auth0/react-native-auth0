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
} from './core/models';
export { TimeoutError } from './core/utils/fetchWithTimeout';
export { parseIdToken } from './core/utils';
export { TokenType, MfaFactorType } from './types/common';
export { Auth0Provider } from './hooks/Auth0Provider';
export { useAuth0 } from './hooks/useAuth0';
export * from './types';
export {
  BiometricPolicy,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
} from './types/platform-specific';
export type { LocalAuthenticationOptions } from './types/platform-specific';
export type { MfaClient } from './core/interfaces/MfaClient';

// Re-export Auth0 as default
export { default } from './Auth0';
