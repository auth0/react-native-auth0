export {
  AuthError,
  CredentialsManagerError,
  WebAuthError,
  DPoPError,
} from './core/models';
export { TimeoutError } from './core/utils/fetchWithTimeout';
export { Auth0Provider } from './hooks/Auth0Provider';
export { useAuth0 } from './hooks/useAuth0';
export * from './types';
export type {
  LocalAuthenticationLevel,
  LocalAuthenticationOptions,
  LocalAuthenticationStrategy,
} from './types/platform-specific';

// Re-export Auth0 as default
export { default } from './Auth0';
