import type { IWebAuthProvider } from './IWebAuthProvider';
import type { ICredentialsManager } from './ICredentialsManager';
import type { IAuthenticationProvider } from './IAuthenticationProvider';
import type { IUsersClient } from './IUsersClient';
import type { IMfaClient } from './IMfaClient';
import type {
  DPoPHeadersParams,
  TokenType,
  CustomTokenExchangeParameters,
  Credentials,
} from '../../types';

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
   * @param tokenType Optional token type ('Bearer' or 'DPoP'). Defaults to the client's configured token type.
   * @returns An `IUsersClient` instance configured with the provided token.
   */
  users(token: string, tokenType?: TokenType): IUsersClient;

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

  /**
   * Performs a Custom Token Exchange using RFC 8693.
   * Exchanges an external identity provider token for Auth0 tokens.
   *
   * @param parameters The token exchange parameters.
   * @returns A promise resolving with Auth0 credentials.
   */
  customTokenExchange(
    parameters: CustomTokenExchangeParameters
  ): Promise<Credentials>;

  /**
   * Creates an MFA client for performing Flexible Factors Grant operations.
   *
   * The MFA client provides methods to list authenticators, enroll new MFA
   * factors, challenge existing factors, and verify MFA codes.
   *
   * @returns An `IMfaClient` instance for interacting with the MFA API.
   *
   * @example
   * ```typescript
   * const mfaClient = auth0.mfa();
   *
   * // List enrolled authenticators
   * const authenticators = await mfaClient.getAuthenticators({ mfaToken });
   *
   * // Challenge an authenticator
   * const challenge = await mfaClient.challenge({ mfaToken, authenticatorId });
   *
   * // Verify with OTP
   * const credentials = await mfaClient.verify({ mfaToken, otp: '123456' });
   * ```
   */
  mfa(): IMfaClient;
}
