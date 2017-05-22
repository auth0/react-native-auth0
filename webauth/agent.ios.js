import {
  NativeModules,
  Linking
} from 'react-native';

import AuthError from '../utils/error';

const { A0Auth0 } = NativeModules;

export default class Safari {

  show(url) {
    return new Promise((resolve, reject) => {
      const urlHandler = (event) => {
        A0Auth0.hide();
        Linking.removeEventListener('url', urlHandler);
        resolve(event.url);
      };
      Linking.addEventListener('url', urlHandler);
      A0Auth0.showUrl(url, (err) => {
        Linking.removeEventListener('url', urlHandler);
        reject(new AuthError(err));
      });
    });
  }

  newTransaction() {
    return new Promise((resolve, reject) => {
      A0Auth0.oauthParameters((parameters) => {
        resolve(parameters);
      });
    });
  }
}