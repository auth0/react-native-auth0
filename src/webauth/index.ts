import Agent from './agent';
import { NativeModules, Platform } from 'react-native';

import url from 'url';
import AuthError from '../auth/authError';
import verifyToken from '../jwt';
import {
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
 * @export
 * @class WebAuth
 * @see https://auth0.com/docs/api-auth/grant/authorization-code-pkce
 */
class WebAuth {
  private domain;
  private clientId;
  private agent;

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
   * @param {Object}  parameters Parameters to send on the AuthN/AuthZ request.
   * @param {String}  [parameters.state] Random string to prevent CSRF attacks and used to discard unexepcted results. By default its a cryptographically secure random.
   * @param {String}  [parameters.nonce] Random string to prevent replay attacks of id_tokens.
   * @param {String}  [parameters.audience] Identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   * @param {String}  [parameters.scope] Scopes requested for the issued tokens. e.g. `openid profile`
   * @param {String}  [parameters.connection] The name of the identity provider to use, e.g. "google-oauth2" or "facebook". When not set, it will display Auth0's Universal Login Page.
   * @param {Number}  [parameters.max_age] The allowable elapsed time in seconds since the last time the user was authenticated (optional).
   * @param {String}  [parameters.organization] the ID of the organization to join
   * @param {String}  [parameters.invitationUrl] the invitation URL to join an organization. Takes precedence over the "organization" parameter.
   * @param {Object}  options Other configuration options.
   * @param {Number}  [options.leeway] The amount of leeway, in seconds, to accommodate potential clock skew when validating an ID token's claims. Defaults to 60 seconds if not specified.
   * @param {Boolean} [options.ephemeralSession] Disable Single-Sign-On (SSO). It only affects iOS with versions 13 and above. Defaults to `false`.
   * @param {String}  [options.customScheme] Custom scheme to build the callback URL with.
   * @returns {Promise}
   * @see https://auth0.com/docs/api/authentication#authorize-client
   *
   * @memberof WebAuth
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
   * @param {Object} parameters Parameters to send
   * @param {Bool} [parameters.federated] Optionally remove the IdP session.
   * @param {String} [parameters.customScheme] Custom scheme to build the callback URL with.
   * @param {Object} options Other configuration options.
   * @returns {Promise}
   * @see https://auth0.com/docs/logout
   *
   * @memberof WebAuth
   */
  clearSession(parameters: ClearSessionParameters = {}) {
    const { agent, domain, clientId } = this;
    return agent.logout(
      { clientId, domain },
      {
        customScheme: parameters.customScheme,
        federated: parameters.federated,
      }
    );
  }
}

export default WebAuth;
