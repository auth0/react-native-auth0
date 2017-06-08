import Agent from './agent';
import {
  NativeModules,
  Platform
} from 'react-native';

import url from 'url';
import Auth0Error from '../utils/error';

const { A0Auth0 } = NativeModules;

export default class WebAuth {

  /**
   * @param  {String} clientId
   * @param  {String} domain of Auth0 account
   * @return {AuthenticationAPI}
   */
  constructor(clientId, domain, client) {
    if (domain == null) {
      throw new Error("must supply a valid Auth0 domain");
    }
    this.domain = domain;
    this.clientId = clientId;
    this.agent = new Agent();
    this.client = client;
  }

  authorize(options = {}) {
    const { clientId, domain, client, agent } = this;
    return agent
      .newTransaction()
      .then(({state, verifier, ...defaults}) => {
        const bundleIdentifier = A0Auth0.bundleIdentifier;
        const redirectUri = `${bundleIdentifier.toLowerCase()}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`
        const expectedState = options.state || state;
        let query = {
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri,
          state: expectedState,
          ...defaults,
        };
        if (options.audience) {
          query.audience = options.audience;
        }
        if (options.scope) {
          query.scope = options.scope;
        }
        if (options.nonce) {
          query.nonce = options.nonce;
        }
        if (options.connection) {
          query.connection = options.connection
        }
        const authorizeUrl = url.format({
          protocol: 'https',
          host: domain,
          pathname: `authorize`,
          query
        });
        return agent
          .show(authorizeUrl)
          .then((redirectUrl) => {
            if (!redirectUrl || !redirectUrl.startsWith(redirectUri)) {
              throw new AuthError0({
                error: 'a0.redirect_uri.not_expected',
                error_description: `Expected ${redirectUri} but got ${redirectUrl}`
              });
            }
            const query = url.parse(redirectUrl, true).query
            const {
              code,
              state: resultState,
              error
            } = query;
            if (error) {
              throw new Auth0Error(query);
            }
            if (resultState !== expectedState) {
              throw new Error({
                error: 'a0.state.invalid',
                error_description: `Invalid state recieved in redirect url`
              });
            }
            return client
              .token(code, verifier, redirectUri)
          });
      });
  }
}