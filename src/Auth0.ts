import type { IAuth0Client } from './core/interfaces/IAuth0Client';
import { Auth0ClientFactory } from './factory/Auth0ClientFactory';
import type { Auth0Options, DPoPHeadersParams } from './types';

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
   * @param token An access token with the required permissions for the management operations.
   * @param tokenType Optional token type ('Bearer' or 'DPoP'). Defaults to the client's configured token type.
   */
  users(token: string, tokenType?: string) {
    return this.client.users(token, tokenType);
  }

  /**
   * Generates DPoP headers for making authenticated requests to custom APIs.
   * This method creates the necessary HTTP headers (Authorization and DPoP) to
   * securely bind the access token to a specific API request.
   *
   * @param params Parameters including the URL, HTTP method, access token, and token type.
   * @returns A promise that resolves to an object containing the required headers.
   *
   * @example
   * ```typescript
   * const credentials = await auth0.credentialsManager.getCredentials();
   *
   * if (credentials.tokenType === 'DPoP') {
   *   const headers = await auth0.getDPoPHeaders({
   *     url: 'https://api.example.com/data',
   *     method: 'GET',
   *     accessToken: credentials.accessToken,
   *     tokenType: credentials.tokenType
   *   });
   *
   *   const response = await fetch('https://api.example.com/data', { headers });
   * }
   * ```
   */
  getDPoPHeaders(params: DPoPHeadersParams) {
    return this.client.getDPoPHeaders(params);
  }
}

export default Auth0;
