import Agent from './agent';
import {NativeModules, Platform} from 'react-native';

import url from 'url';
import AuthError from '../auth/authError';
import verifyToken from '../jwt';

const {A0Auth0} = NativeModules;

const callbackUri = (domain, customScheme) => {
  const bundleIdentifier = A0Auth0.bundleIdentifier;
  const lowerCasedIdentifier = bundleIdentifier.toLowerCase();
  if (!customScheme && bundleIdentifier !== lowerCasedIdentifier) {
    console.warn(
      'The Bundle Identifier or Application ID of your app contains uppercase characters and will be lowercased to build the Callback URL. Check the Auth0 dashboard to whitelist the right URL value.',
    );
  }
  return `${customScheme || lowerCasedIdentifier}://${domain}/${
    Platform.OS
  }/${bundleIdentifier}/callback`;
};

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
  constructor(auth) {
    this.client = auth;
    const {baseUrl, clientId, domain} = auth;
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
   * @param {String}  [options.skipLegacyListener] Whether to register the event listener necessary for the SDK to work on iOS <11 or not. Defaults to `false`.
   * @returns {Promise}
   * @see https://auth0.com/docs/api/authentication#authorize-client
   *
   * @memberof WebAuth
   */
  authorize(parameters = {}, options = {}) {
    const {clientId, domain, client, agent} = this;
    return agent.newTransaction().then(({state, verifier, ...defaults}) => {
      const redirectUri = callbackUri(domain, options.customScheme);
      const expectedState = parameters.state || state;
      if (parameters.invitationUrl) {
        const urlQuery = url.parse(parameters.invitationUrl, true).query;
        const {invitation, organization} = urlQuery;
        if (!invitation || !organization) {
          throw new AuthError({
            json: {
              error: 'a0.invalid_invitation_url',
              error_description: `The invitation URL provided doesn't contain the 'organization' or 'invitation' values.`,
            },
            status: 0,
          });
        }
        parameters.invitation = invitation;
        parameters.organization = organization;
      }

      let query = {
        ...defaults,
        clientId,
        responseType: 'code',
        redirectUri,
        state: expectedState,
        ...parameters,
      };
      const authorizeUrl = this.client.authorizeUrl(query);
      return agent
        .show(
          authorizeUrl,
          options.ephemeralSession,
          options.skipLegacyListener,
        )
        .then(redirectUrl => {
          if (!redirectUrl || !redirectUrl.startsWith(redirectUri)) {
            throw new AuthError({
              json: {
                error: 'a0.redirect_uri.not_expected',
                error_description: `Expected ${redirectUri} but got ${redirectUrl}`,
              },
              status: 0,
            });
          }
          const query = url.parse(redirectUrl, true).query;
          const {code, state: resultState, error} = query;
          if (error) {
            throw new AuthError({json: query, status: 0});
          }
          if (resultState !== expectedState) {
            throw new AuthError({
              json: {
                error: 'a0.state.invalid',
                error_description: `Invalid state received in redirect url`,
              },
              status: 0,
            });
          }

          return client
            .exchange({code, verifier, redirectUri})
            .then(credentials => {
              return verifyToken(credentials.idToken, {
                domain,
                clientId,
                nonce: parameters.nonce,
                maxAge: parameters.max_age,
                scope: parameters.scope,
                leeway: options.leeway,
                orgId: parameters.organization,
              }).then(() => Promise.resolve(credentials));
            });
        });
    });
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
   * @param {String} [options.skipLegacyListener] Whether to register the event listener necessary for the SDK to work on iOS <11 or not. Defaults to `false`.
   * @returns {Promise}
   * @see https://auth0.com/docs/logout
   *
   * @memberof WebAuth
   */
  clearSession(parameters = {}, options = {}) {
    const {client, agent, domain, clientId} = this;
    parameters.clientId = clientId;
    parameters.returnTo = callbackUri(domain, parameters.customScheme);
    parameters.federated = parameters.federated || false;
    const logoutUrl = client.logoutUrl(parameters);
    return agent.show(logoutUrl, false, options.skipLegacyListener, true);
  }
}

export default WebAuth;
