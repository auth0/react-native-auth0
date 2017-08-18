import Agent from './agent';
import {
  NativeModules,
  Platform
} from 'react-native';

import url from 'url';
import Auth0Error from '../auth/auth0Error';
import AuthError from '../auth/authError';

const { A0Auth0 } = NativeModules;

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
export default class WebAuth {

  constructor(auth) {
    this.client = auth;
    const { baseUrl, clientId, domain } = auth;
    this.domain = domain;
    this.clientId = clientId;
    this.agent = new Agent();
  }

  /**
   * Starts the AuthN/AuthZ transaction against the AS in the in-app browser.
   *
   * In iOS it will use `SFSafariViewController` and in Android Chrome Custom Tabs.
   *
   * @param {Object} parameters parameters to send
   * @param {String} [parameters.state] random string to prevent CSRF attacks and used to discard unexepcted results. By default its a cryptographically secure random.
   * @param {String} [parameters.nonce] random string to prevent replay attacks of id_tokens.
   * @param {String} [parameters.audience] identifier of Resource Server (RS) to be included as audience (aud claim) of the issued access token
   * @param {String} [parameters.scope] scopes requested for the issued tokens. e.g. `openid profile`
   * @returns {Promise}
   * @see https://auth0.com/docs/api/authentication#authorize-client
   *
   * @memberof WebAuth
   */
  authorize(options = {}) {
    const { clientId, domain, client, agent } = this;
    return agent
      .newTransaction()
      .then(({state, verifier, ...defaults}) => {
        const bundleIdentifier = A0Auth0.bundleIdentifier;
        const redirectUri = `${bundleIdentifier.toLowerCase()}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`
        const expectedState = options.state || state;
        let query = {
          ...options,
          clientId,
          responseType: 'code',
          redirectUri,
          state: expectedState,
          ...defaults,
        };
        const authorizeUrl = this.client.authorizeUrl(query);
        return agent
          .show(authorizeUrl)
          .then((redirectUrl) => {
            if (!redirectUrl || !redirectUrl.startsWith(redirectUri)) {
              throw new AuthError({
                json: {
                  error: 'a0.redirect_uri.not_expected',
                  error_description: `Expected ${redirectUri} but got ${redirectUrl}`
                },
                status: 0
              });
            }
            const query = url.parse(redirectUrl, true).query
            const {
              code,
              state: resultState,
              error
            } = query;
            if (error) {
              throw new Auth0Error({json: query, status: 0});
            }
            if (resultState !== expectedState) {
              throw new AuthError({
                json: {
                  error: 'a0.state.invalid',
                  error_description: `Invalid state recieved in redirect url`
                },
                status: 0
              });
            }
            return client.exchange({code, verifier, redirectUri})
          });
      });
  }

  /**
   *  Removes Auth0 session and optionally remove the Identity Provider session.
   *  In iOS it will use `SFSafariViewController`
   *
   * @param {Object} parameters parameters to send
   * @param {Bool} [parameters.federated] Optionally remove the IdP session.
   * @returns {Promise}
   * @see https://auth0.com/docs/logout
   *
   * @memberof WebAuth
   */
  clearSession(options = {}) {
    if (Platform.OS !== 'ios') {
      return Promise.reject(new AuthError({
        json: {
          error: 'a0.platform.not_available',
          error_description: `Cannot perform operation in platform ${Platform.OS}`
        },
        status: 0
      }));
    }
    const { client, agent } = this;
    const federated = options.federated || false;
    const logoutUrl = client.logoutUrl(options);
    return agent.show(logoutUrl, true);
  }
}
