import {
  Auth0Client,
  type Auth0ClientOptions,
  type LogoutOptions,
} from '@auth0/auth0-spa-js';
import type { IAuth0Client, IUsersClient } from '../../../core/interfaces';
import type { WebAuth0Options } from '../../../types/platform-specific';
import { WebWebAuthProvider } from './WebWebAuthProvider';
import { WebCredentialsManager } from './WebCredentialsManager';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';
import { AuthError } from '../../../core/models';

let spaClient: Auth0Client | null = null;
let redirectHandled = false;

/**
 * Factory function to get a singleton instance of Auth0Client.
 * This ensures that the client is only created once and reused.
 *
 * @param options - The Auth0ClientOptions to configure the client.
 * @returns An instance of Auth0Client.
 */
const getSpaClient = (options: Auth0ClientOptions): Auth0Client => {
  if (spaClient) {
    return spaClient;
  }
  spaClient = new Auth0Client(options);
  return spaClient;
};

export class WebAuth0Client implements IAuth0Client {
  readonly webAuth: WebWebAuthProvider;
  readonly credentialsManager: WebCredentialsManager;
  readonly auth: AuthenticationOrchestrator;

  private readonly httpClient: HttpClient;
  public readonly client: Auth0Client;

  private logoutInProgress = false;

  constructor(options: WebAuth0Options) {
    const baseUrl = `https://${options.domain}`;

    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });

    this.auth = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
    });

    const clientOptions: Auth0ClientOptions = {
      domain: options.domain,
      clientId: options.clientId,
      cacheLocation: options.cacheLocation ?? 'memory',
      useRefreshTokens: options.useRefreshTokens ?? true,
      authorizationParams: {
        redirect_uri:
          typeof window !== 'undefined' ? window.location.origin : '',
        ...options,
      },
    };

    // Use the singleton factory to get the spa-js client instance.
    const client = getSpaClient(clientOptions);
    this.client = client;

    this.webAuth = new WebWebAuthProvider(this.client);
    this.credentialsManager = new WebCredentialsManager(this.client);
  }

  users(token: string): IUsersClient {
    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
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
}
