import Agent from './agent';

import {
  ClearSessionOptions,
  ClearSessionParameters,
  Credentials,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
} from '../types';

import Auth from '../auth';

/**
 * Helper to perform Auth against Auth0 hosted login page
 *
 * It will use `/authorize` endpoint of the Authorization Server (AS)
 * with Code Grant and Proof Key for Challenge Exchange (PKCE).
 *
 * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
 */
class WebAuth {
  private domain: string;
  private clientId: string;
  private agent: Agent;

  /**
   * @ignore
   */
  constructor(auth: Auth) {
    const { clientId, domain } = auth;
    this.domain = domain;
    this.clientId = clientId;
    this.agent = new Agent();
  }

  /**
   * Starts the AuthN/AuthZ transaction against the AS in the in-app browser.
   *
   * In iOS <11 it will use `SFSafariViewController`, in iOS 11 `SFAuthenticationSession`  and in iOS >11 `ASWebAuthenticationSession`.
   * In Android it will use Chrome Custom Tabs.
   *
   * To learn more about how to customize the authorize call, check the Universal Login Page
   * article at https://auth0.com/docs/hosted-pages/login
   *
   * @see https://auth0.com/docs/api/authentication#authorize-client
   * @returns A poplulated instance of {@link Credentials}.
   */
  authorize(
    parameters: WebAuthorizeParameters = {},
    options: WebAuthorizeOptions = {}
  ): Promise<Credentials> {
    const { clientId, domain, agent } = this;
    return agent.login({ clientId, domain }, { ...parameters, ...options });
  }

  /**
   *  Removes Auth0 session and optionally remove the Identity Provider session.
   *
   * In iOS <11 it will use `SFSafariViewController`, in iOS 11 `SFAuthenticationSession`  and in iOS >11 `ASWebAuthenticationSession`.
   * In Android it will use Chrome Custom Tabs.
   *
   * @see https://auth0.com/docs/logout
   */
  clearSession(
    parameters: ClearSessionParameters = {},
    options: ClearSessionOptions = {}
  ) {
    const { agent, domain, clientId } = this;
    return agent.logout(
      { clientId, domain },
      {
        ...parameters,
        ...options,
      }
    );
  }
}

export default WebAuth;
