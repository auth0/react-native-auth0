import { Auth0Client, type Auth0ClientOptions } from '@auth0/auth0-spa-js';
import type { IAuth0Client, IUsersClient } from '../../../core/interfaces';
import type { WebAuth0Options } from '../../../types/platform-specific';
import { WebWebAuthProvider } from './WebWebAuthProvider';
import { WebCredentialsManager } from './WebCredentialsManager';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';

/**
 * The concrete implementation of IAuth0Client for the Web platform (React Native Web).
 *
 * This class instantiates the `auth0-spa-js` client and all the necessary
 * web-specific adapters that use it to fulfill their contracts. It also handles
 * the initial redirect callback flow.
 */
export class WebAuth0Client implements IAuth0Client {
  readonly webAuth: WebWebAuthProvider;
  readonly credentialsManager: WebCredentialsManager;
  readonly auth: AuthenticationOrchestrator;

  private readonly client: Auth0Client;
  private readonly httpClient: HttpClient;

  constructor(options: WebAuth0Options) {
    const baseUrl = `https://${options.domain}`;

    // 1. Create the HttpClient.
    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });

    // 2. Instantiate the AuthenticationOrchestrator.
    this.auth = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
    });

    const { clientId, domain, ...otherOptions } = options;
    const clientOptions: Auth0ClientOptions = {
      clientId: clientId,
      domain: domain,
      cacheLocation: otherOptions.cacheLocation ?? 'memory',
      useRefreshTokens: otherOptions.useRefreshTokens ?? true,
      authorizationParams: {
        // A default redirect_uri is required by spa-js.
        // This can be overridden in the `authorize` call.
        redirect_uri:
          typeof window !== 'undefined' ? window.location.origin : '',
      },
      ...otherOptions, // Pass through any other spa-js compatible options.
    };

    this.client = new Auth0Client(clientOptions);

    // Automatically handle the redirect from Auth0 when the app loads.
    // This is a fire-and-forget operation. The hooks layer will update the
    // UI once the user state is resolved.
    this.handleRedirect();

    // Instantiate our adapters with the configured spa-js client.
    this.webAuth = new WebWebAuthProvider(this.client);
    this.credentialsManager = new WebCredentialsManager(this.client);
  }

  /**
   * Creates a client for interacting with the Auth0 Management API's user endpoints.
   *
   * @param token An access token with the required permissions for the management operations.
   * @returns An `IUsersClient` instance configured with the provided token.
   */
  users(token: string): IUsersClient {
    // Re-use the same HttpClient, but the orchestrator will add its own auth header.
    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
    });
  }

  /**
   * Private method to handle the redirect from Auth0 after a login attempt.
   * This should only run once when the application loads.
   */
  private async handleRedirect(): Promise<void> {
    if (
      typeof window !== 'undefined' &&
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      try {
        // This method processes the code and state, exchanges them for tokens,
        // and caches the result.
        await this.client.handleRedirectCallback();
      } catch (e) {
        // Errors during handleRedirectCallback are often informational
        // (e.g., user is already logged in). We can log them but
        // shouldn't crash the app. The developer can get the error
        // state from the useAuth0 hook if needed.
        console.error('Error during handleRedirectCallback:', e);
      } finally {
        // Clean the URL to remove the code and state parameters,
        // preventing the logic from running again on a page refresh.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }
}
