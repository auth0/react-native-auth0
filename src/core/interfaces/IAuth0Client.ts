import type { IWebAuthProvider } from './IWebAuthProvider';
import type { ICredentialsManager } from './ICredentialsManager';
import type { IAuthenticationProvider } from './IAuthenticationProvider';
import type { IUsersClient } from './IUsersClient';
import type { DPoPHeadersParams } from '../../types';

/**
 * The primary interface for the Auth0 client.
 *
 * It aggregates all core functionalities (web auth, credential management, etc.)
 * into a single, cohesive contract. Platform-specific factories will produce an
 * object that conforms to this interface.
 */
export interface IAuth0Client {
  /**
   * Provides access to methods for handling web-based authentication flows.
   */
  readonly webAuth: IWebAuthProvider;

  /**
   * Provides access to methods for securely managing user credentials on the device.
   */
  readonly credentialsManager: ICredentialsManager;

  /**
   * Provides access to methods for direct authentication grants (e.g., password-realm).
   */
  readonly auth: IAuthenticationProvider;

  /**
   * Creates a client for interacting with the Auth0 Management API's user endpoints.
   *
   * @param token An access token with the required permissions for the management operations.
   * @returns An `IUsersClient` instance configured with the provided token.
   */
  users(token: string): IUsersClient;

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
   * const headers = await auth0.getDPoPHeaders({
   *   url: 'https://api.example.com/data',
   *   method: 'GET',
   *   accessToken: credentials.accessToken,
   *   tokenType: credentials.tokenType
   * });
   *
   * fetch('https://api.example.com/data', { headers });
   * ```
   */
  getDPoPHeaders(params: DPoPHeadersParams): Promise<Record<string, string>>;
}
