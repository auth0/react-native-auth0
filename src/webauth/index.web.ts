import {
  type RedirectLoginOptions,
  type LogoutOptions,
  Auth0Client,
} from '@auth0/auth0-spa-js';
import type {
  ClearSessionParameters,
  Credentials,
  WebAuthorizeParameters,
} from '../types';

class WebAuth {
  constructor(
    private client: Auth0Client,
    private domain: string
  ) {
    // This method needs to be bound to the instance, as it's called from outside the class context
    // when handling the redirect callback.
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  /**
   * Initiates the login flow by redirecting to the Auth0 Universal Login Page.
   */
  async authorize(
    parameters: WebAuthorizeParameters = {},
    _options: unknown = {}
  ): Promise<Credentials> {
    const { redirectUrl, ...authParams } = parameters;

    const loginOptions: RedirectLoginOptions = {
      authorizationParams: {
        ...authParams,
        redirect_uri: redirectUrl,
      },
    };
    await this.client.loginWithRedirect(loginOptions);

    // loginWithRedirect does not resolve with credentials; they are obtained
    // after the user is redirected back to the app. We return an empty object
    // to satisfy the type signature, but the app flow should depend on handleRedirect.
    return {} as Credentials;
  }

  /**
   * Handles the redirect from Auth0 after a login attempt.
   */
  async handleRedirect() {
    if (
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      await this.client.handleRedirectCallback();
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Clears the user's session on the Auth0 server and locally.
   */
  async clearSession(
    parameters: ClearSessionParameters = {},
    _options: unknown = {}
  ): Promise<void> {
    const logoutOptions: LogoutOptions = {
      logoutParams: {
        returnTo: parameters.returnToUrl,
        federated: parameters.federated,
      },
    };
    return this.client.logout(logoutOptions);
  }
}

export default WebAuth;
