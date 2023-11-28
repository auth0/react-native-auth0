import Agent from './agent';

import {
  ClearSessionOptions,
  ClearSessionParameters,
  Credentials,
  SafariViewControllerPresentationStyle,
  WebAuthorizeOptions,
  WebAuthorizeParameters,
} from '../types';

import Auth from '../auth';
import { object } from 'prop-types';

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
    let presentationStyle = options.useSFSafariViewController
      ? (options.useSFSafariViewController as { presentationStyle: number })
          ?.presentationStyle ??
        SafariViewControllerPresentationStyle.fullScreen
      : undefined;
    return agent.login(
      { clientId, domain },
      {
        ...parameters,
        safariViewControllerPresentationStyle: presentationStyle,
        ...options,
      }
    );
  }

  /**
   *  Removes Auth0 session and optionally remove the Identity Provider session.
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
