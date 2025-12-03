import {
  Auth0Client,
  type Auth0ClientOptions,
  type LogoutOptions,
} from '@auth0/auth0-spa-js';
import type { IAuth0Client, IUsersClient } from '../../../core/interfaces';
import type { WebAuth0Options } from '../../../types/platform-specific';
import type { DPoPHeadersParams } from '../../../types';
import { WebWebAuthProvider } from './WebWebAuthProvider';
import { WebCredentialsManager } from './WebCredentialsManager';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient, TokenType } from '../../../core/services/HttpClient';
import { AuthError, DPoPError } from '../../../core/models';

export class WebAuth0Client implements IAuth0Client {
  readonly webAuth: WebWebAuthProvider;
  readonly credentialsManager: WebCredentialsManager;
  readonly auth: AuthenticationOrchestrator;

  private readonly httpClient: HttpClient;
  private readonly tokenType: TokenType;
  private readonly baseUrl: string;
  private readonly getDPoPHeadersForOrchestrator?: (
    params: DPoPHeadersParams
  ) => Promise<Record<string, string>>;
  public readonly client: Auth0Client;
  private static spaClient: Auth0Client | null = null;

  private logoutInProgress = false;

  /**
   * Factory method to get a singleton instance of Auth0Client.
   * This ensures that the client is only created once and reused.
   *
   * @param options - The Auth0ClientOptions to configure the client.
   * @returns An instance of Auth0Client.
   */
  private static getSpaClient(options: Auth0ClientOptions): Auth0Client {
    if (WebAuth0Client.spaClient) {
      return WebAuth0Client.spaClient;
    }
    WebAuth0Client.spaClient = new Auth0Client(options);
    return WebAuth0Client.spaClient;
  }

  /**
   * Reset the singleton instance. Used for testing purposes.
   * @internal
   */
  public static resetSpaClientSingleton(): void {
    WebAuth0Client.spaClient = null;
  }

  constructor(options: WebAuth0Options) {
    const baseUrl = `https://${options.domain}`;
    this.baseUrl = baseUrl;
    const useDPoP = options.useDPoP ?? true;
    this.tokenType = useDPoP ? TokenType.dpop : TokenType.bearer;

    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });

    const clientOptions: Auth0ClientOptions = {
      domain: options.domain,
      clientId: options.clientId,
      useMrrt: options.useMrrt,
      cacheLocation: options.cacheLocation ?? 'memory',
      // MRRT requires refresh tokens to work - automatically enable if useMrrt is true
      useRefreshTokens: options.useRefreshTokens ?? options.useMrrt ?? false,
      useRefreshTokensFallback: options.useRefreshTokensFallback ?? true,
      useDpop: options.useDPoP ?? true,
      authorizationParams: {
        redirect_uri:
          typeof window !== 'undefined' ? window.location.origin : '',
        ...options,
      },
    };

    // Use the singleton factory to get the spa-js client instance.
    const client = WebAuth0Client.getSpaClient(clientOptions);
    this.client = client;

    // Create a bound getDPoPHeaders function for the orchestrator
    const getDPoPHeadersForOrchestrator = async (params: DPoPHeadersParams) => {
      return this.getDPoPHeaders(params);
    };
    this.getDPoPHeadersForOrchestrator = useDPoP
      ? getDPoPHeadersForOrchestrator
      : undefined;

    this.auth = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
      tokenType: this.tokenType,
      baseUrl: baseUrl,
      getDPoPHeaders: useDPoP ? getDPoPHeadersForOrchestrator : undefined,
    });

    this.webAuth = new WebWebAuthProvider(this.client);
    this.credentialsManager = new WebCredentialsManager(this.client);
  }

  users(token: string, tokenType?: string): IUsersClient {
    // Use provided tokenType or fall back to client's default
    const effectiveTokenType = (tokenType as TokenType) ?? this.tokenType;
    // Only provide getDPoPHeaders if the effective token type is DPoP
    const getDPoPHeaders =
      effectiveTokenType === TokenType.dpop
        ? this.getDPoPHeadersForOrchestrator
        : undefined;

    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
      tokenType: effectiveTokenType,
      baseUrl: this.baseUrl,
      getDPoPHeaders,
    });
  }

  public async logout(options?: LogoutOptions): Promise<void> {
    // If a logout process has already started, do nothing.
    if (this.logoutInProgress) {
      return;
    }
    this.logoutInProgress = true;

    try {
      await this.client.logout(options);
    } catch (e: any) {
      // Reset the flag on error so a retry is possible.
      this.logoutInProgress = false;
      throw new AuthError(
        e.error ?? 'LogoutFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    // For web platform, we need to get the access token and use the underlying
    // auth0-spa-js DPoP utilities to generate the headers
    const {
      url,
      method,
      accessToken,
      tokenType,
      nonce: providedNonce,
    } = params;

    // If DPoP is not enabled or token is not DPoP type, return bearer header
    if (tokenType !== 'DPoP') {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    try {
      // Use the public DPoP methods from auth0-spa-js
      // These methods are available when useDpop is enabled
      const headers: Record<string, string> = {
        Authorization: `DPoP ${accessToken}`,
      };

      // Use provided nonce if available, otherwise get the current DPoP nonce
      // (may be undefined on first request)
      const nonce = providedNonce ?? (await this.client.getDpopNonce());

      // Generate DPoP proof using the client's public method
      const dpopProof = await this.client.generateDpopProof({
        url,
        method,
        nonce,
        accessToken,
      });

      if (dpopProof) {
        headers.DPoP = dpopProof;
      }

      return headers;
    } catch (e: any) {
      const authError = new AuthError(
        e.error ?? 'dpop_generation_failed',
        e.error_description ?? e.message ?? 'Failed to generate DPoP headers',
        { json: e }
      );
      throw new DPoPError(authError);
    }
  }
}
