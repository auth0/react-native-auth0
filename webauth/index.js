import Agent from './agent';
import {
  NativeModules,
  Platform
} from 'react-native';

import url from 'url';

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

  authorize() {
    const { clientId, domain, client, agent } = this;
    return agent
      .newTransaction()
      .then(({state, verifier, ...query}) => {
        const bundleIdentifier = A0Auth0.bundleIdentifier;
        const redirectUri = `${bundleIdentifier}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`
        const authorizeUrl = url.format({
          protocol: 'https',
          host: domain,
          pathname: `authorize`,
          query: {
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            state,
            ...query
          }
        });
        return agent
          .show(authorizeUrl)
          .then((redirectUrl) => {
            if (!redirectUrl || !redirectUrl.startsWith(redirectUri)) {
              throw new Error('Unexpected url');
            }
            const { code, state: resultState } = url.parse(redirectUrl, true).query;
            if (resultState !== state) {
              throw new Error('Invalid state');
            }
            return client
              .token(code, verifier, redirectUri)
          });
      });
  }
}