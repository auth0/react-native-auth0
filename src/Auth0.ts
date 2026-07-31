import type { IAuth0Client } from './core/interfaces/IAuth0Client';
import type { IMfaClient } from './core/interfaces/IMfaClient';
import type { TokenType } from './types/common';
import { Auth0ClientFactory } from './factory/Auth0ClientFactory';
import type {
  Auth0Options,
  DPoPHeadersParams,
  CustomTokenExchangeParameters,
  PasskeySignupChallengeParameters,
  PasskeyLoginChallengeParameters,
  PasskeyChallengeResponse,
  GetTokenByPasskeyParameters,
  Credentials,
} from './types';

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
   * Provides access to the My Account API for managing authentication methods.
   *
   * @example
   * ```typescript
   * const methods = await auth0.myAccount.getAuthenticationMethods({ accessToken });
   * await auth0.myAccount.deleteAuthenticationMethodById({ accessToken, id: 'auth_method_123' });
   * ```
   */
  get myAccount() {
    return this.client.myAccount;
  }

  /**
   * Provides access to the passwordless OTP flow for database connections.
   *
   * @remarks Native only (iOS, Android). Not supported on web.
   *
   * @example
   * ```typescript
   * const challenge = await auth0.passwordless.challengeWithEmail({
   *   email: 'user@example.com',
   * });
   * const credentials = await auth0.passwordless.loginWithOTP({
   *   challenge,
   *   otp: '123456',
   * });
   * ```
   */
  get passwordless() {
    return this.client.passwordless;
  }

  /**
   * Provides access to the Management API (e.g., for user patching).
   * @param token An access token with the required permissions for the management operations.
   * @param tokenType Optional token type ('Bearer' or 'DPoP'). Defaults to the client's configured token type.
   */
  users(token: string, tokenType?: TokenType) {
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

  /**
   * Performs a Custom Token Exchange using RFC 8693.
   * Exchanges an external identity provider token for Auth0 tokens.
   *
   * @param parameters The token exchange parameters.
   * @returns A promise resolving with Auth0 credentials.
   *
   * @example
   * ```typescript
   * const credentials = await auth0.customTokenExchange({
   *   subjectToken: 'external-idp-token',
   *   subjectTokenType: 'urn:acme:external-idp-token',
   *   audience: 'https://api.example.com',
   *   scope: 'openid profile email',
   *   organization: 'org_abc123'
   * });
   * ```
   */
  customTokenExchange(
    parameters: CustomTokenExchangeParameters
  ): Promise<Credentials> {
    return this.client.customTokenExchange(parameters);
  }

  /**
   * Provides access to MFA operations using the Flexible Factors Grant.
   *
   * The MFA client provides methods to list authenticators, enroll new MFA
   * factors, challenge existing factors, and verify MFA codes.
   *
   * @example
   * ```typescript
   * // List enrolled authenticators
   * const authenticators = await auth0.mfa.getAuthenticators({ mfaToken });
   *
   * // Verify with OTP
   * const credentials = await auth0.mfa.verify({ mfaToken, otp: '123456' });
   * ```
   */
  get mfa(): IMfaClient {
    return this.client.mfa;
  }

  /**
   * Requests a passkey signup challenge from Auth0.
   *
   * Returns WebAuthn creation options that should be passed to the platform's
   * credential manager to create a new passkey credential.
   *
   * @param parameters The parameters for the signup challenge.
   * @returns A promise resolving with the challenge response containing authSession and authParamsPublicKey.
   */
  passkeySignupChallenge(
    parameters: PasskeySignupChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    return this.client.passkeySignupChallenge(parameters);
  }

  /**
   * Requests a passkey login challenge from Auth0.
   *
   * Returns WebAuthn request options that should be passed to the platform's
   * credential manager to assert an existing passkey.
   *
   * @param parameters The parameters for the login challenge.
   * @returns A promise resolving with the challenge response containing authSession and authParamsPublicKey.
   */
  passkeyLoginChallenge(
    parameters: PasskeyLoginChallengeParameters
  ): Promise<PasskeyChallengeResponse> {
    return this.client.passkeyLoginChallenge(parameters);
  }

  /**
   * Exchanges a passkey credential response for Auth0 tokens.
   *
   * Call this after the platform credential manager returns the passkey
   * credential (from either signup or login flow).
   *
   * @param parameters The exchange parameters including authSession and authResponse.
   * @returns A promise resolving with the user's credentials.
   */
  getTokenByPasskey(
    parameters: GetTokenByPasskeyParameters
  ): Promise<Credentials> {
    return this.client.getTokenByPasskey(parameters);
  }
}

export default Auth0;
