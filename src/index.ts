import { Auth0 } from './Auth0';

export {
  AuthError,
  CredentialsManagerError,
  WebAuthError,
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

export default Auth0;
