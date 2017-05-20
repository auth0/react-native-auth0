import {
  NativeModules
} from 'react-native';

import Session from './session';
import url from 'url';

const { A0Auth0 } = NativeModules;

export function newSession(clientId, domain, callback) {
  return new Promise((resolve, reject) => {
    A0Auth0.oauthParameters((parameters) => {
      const bundleIdentifier = A0Auth0.bundleIdentifier;
      const { state, verifier, ...query } = parameters;
      const redirectUri = `${bundleIdentifier}://${domain}/ios/${bundleIdentifier}/callback`
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
      callback(new Session({
        redirectUri,
        state,
        verifier,
        authorizeUrl,
        domain,
        clientId
      }, resolve, reject));
    });
  });
}