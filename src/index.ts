export {
  AuthError,
  CredentialsManagerError,
  CredentialsManagerErrorCodes,
  WebAuthError,
  WebAuthErrorCodes,
  DPoPError,
  DPoPErrorCodes,
} from './core/models';
export { TimeoutError } from './core/utils/fetchWithTimeout';
export { TokenType } from './types/common';
export { Auth0Provider } from './hooks/Auth0Provider';
export { useAuth0 } from './hooks/useAuth0';
export * from './types';
export {
  BiometricPolicy,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
} from './types/platform-specific';
export type { LocalAuthenticationOptions } from './types/platform-specific';

// Re-export Auth0 as default
export { default } from './Auth0';
