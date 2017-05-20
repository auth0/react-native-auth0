import {
  NativeModules,
  Linking
} from 'react-native';

const { A0Auth0 } = NativeModules;

export default class Safari {

  show(url) {
    return new Promise((resolve, reject) => {
      const urlHandler = (event) => {
        Linking.removeEventListener('url', urlHandler);
        resolve(event.url);
      };
      Linking.addEventListener('url', urlHandler);
      A0Auth0.showUrl(url, (err) => {
        Linking.removeEventListener('url', urlHandler);
        reject(err);
      });
    });
  }

  hide() {
    A0Auth0.hide();
  }

  newTransaction() {
    return new Promise((resolve, reject) => {
      A0Auth0.oauthParameters((parameters) => {
        resolve(parameters);
      });
    });
  }
}