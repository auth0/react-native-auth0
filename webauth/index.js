import Agent from './agent';
import {
  NativeModules,
  Platform
} from 'react-native';

import url from 'url';
import Auth0Error from '../auth/authError';

const { A0Auth0 } = NativeModules;

export default class WebAuth {

  /**
   * @param  {String} clientId
   * @param  {String} domain of Auth0 account
   * @return {AuthenticationAPI}
   */
  constructor(auth) {
    this.client = auth;
    const { baseUrl, clientId, domain } = auth;
    this.domain = domain;
    this.clientId = clientId;
    this.agent = new Agent();
  }

  authorize(options = {}) {
    const { clientId, domain, client, agent } = this;
    return agent
      .newTransaction()
      .then(({state, verifier, ...defaults}) => {
        const bundleIdentifier = A0Auth0.bundleIdentifier;
        const redirectUri = `${bundleIdentifier}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`
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
}