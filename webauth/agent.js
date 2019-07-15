import { NativeModules, Linking } from 'react-native';

export default class Agent {
  show(url, closeOnLoad = false, useLegacyAuthentication = false) {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. Please make sure you run `react-native link react-native-auth0`'
        )
      );
    }

    return new Promise((resolve, reject) => {
      const urlHandler = event => {
        NativeModules.A0Auth0.hide();
        Linking.removeEventListener('url', urlHandler);
        resolve(event.url);
      };
      Linking.addEventListener('url', urlHandler);
      NativeModules.A0Auth0.showUrl(
        url,
        closeOnLoad,
        useLegacyAuthentication,
        (error, redirectURL) => {
          Linking.removeEventListener('url', urlHandler);
          if (error) {
            reject(error);
          } else if (redirectURL) {
            resolve(redirectURL);
          } else if (closeOnLoad) {
            resolve();
          }
        }
      );
    });
  }

  newTransaction() {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. Please make sure you run `react-native link react-native-auth0`'
        )
      );
    }

    return new Promise((resolve, reject) => {
      NativeModules.A0Auth0.oauthParameters(parameters => {
        resolve(parameters);
      });
    });
  }
}
