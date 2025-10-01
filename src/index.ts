import { Auth0ClientFactory } from './factory/Auth0ClientFactory';
import type { IAuth0Client } from './core/interfaces/IAuth0Client';
import type { Auth0Options } from './types';
export { AuthError } from './core/models/AuthError';
export { TimeoutError } from './core/utils/fetchWithTimeout';
export { useAuth0 } from './hooks/useAuth0';
export { Auth0Provider } from './hooks/Auth0Provider';
export type {
  LocalAuthenticationOptions,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
} from './types/platform-specific';

export * from './types';

/**
 * The main Auth0 client class.
 *
 * This class acts as a facade, creating and delegating to a platform-specific
 * client instance (Native or Web) under the hood.
 *
 * @example
 * ```
 * import Auth0 from 'react-native-auth0';
 *
 * const auth0 = new Auth0({
 *   domain: 'YOUR_AUTH0_DOMAIN',
 *   clientId: 'YOUR_AUTH0_CLIENT_ID'
 * });
 * ```
 */
class Auth0 {
  private client: IAuth0Client;

  /**
   * Creates an instance of the Auth0 client.
   * @param options Configuration options for the client.
   */
  constructor(options: Auth0Options) {
    // The factory detects the platform and returns the appropriate client implementation.
    // The rest of this class is completely unaware of whether it's running on native or web.
    this.client = Auth0ClientFactory.createClient(options);
  }

  /**
   * Provides access to the web-based authentication methods.
   * @see IWebAuthProvider
   */
  get webAuth() {
    return this.client.webAuth;
  }

  /**
   * Provides access to the credentials management methods.
   * @see ICredentialsManager
   */
  get credentialsManager() {
    return this.client.credentialsManager;
  }

  /**
   * Provides access to direct authentication methods (e.g., password-realm).
   * @see IAuthenticationProvider
   */
  get auth() {
    return this.client.auth;
  }

  /**
   * Provides access to the Management API (e.g., for user patching).
   */
  users(token: string) {
    return this.client.users(token);
  }
}

export default Auth0;
