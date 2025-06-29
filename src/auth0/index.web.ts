import Auth from '../auth';
import CredentialsManager from '../credentials-manager';
import WebAuth from '../webauth';
import type { Auth0Options } from '../types';
import { Auth0Client, type Auth0ClientOptions } from '@auth0/auth0-spa-js';
import type UsersApi from '../management/users';
/**
 * Auth0 for React Native client
 */
class Auth0 {
  public auth: Auth;
  public webAuth: WebAuth;
  public credentialsManager: CredentialsManager;
  private client: Auth0Client;
  private domain: string;

  constructor(options: Auth0Options) {
    this.domain = options.domain;
    const clientOptions: Auth0ClientOptions = {
      authorizationParams: {
        redirect_uri: window.location.origin, // Default, can be overridden in authorize()
      },
      // For best security, tokens are stored in memory by default.
      // useRefreshTokens: true and cacheLocation: 'localstorage' can be used for persistence.
      cacheLocation: 'memory',
      ...options,
    };

    this.client = new Auth0Client(clientOptions);

    this.auth = new Auth(this.client);
    this.webAuth = new WebAuth(this.client, this.domain);
    this.credentialsManager = new CredentialsManager(this.client);

    // Automatically handle the redirect callback when the app loads
    this.webAuth.handleRedirect();
  }

  /**
   * Creates a client for the Auth0 Management API.
   * Requires a token with the appropriate permissions.
   */
  users(token: string): UsersApi {
    return new UsersApi(this.domain, token);
  }
}

export default Auth0;
