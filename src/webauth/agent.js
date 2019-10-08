import { NativeModules, Linking } from 'react-native';

export default class Agent {
  show(url, closeOnLoad = false) {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
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
      NativeModules.A0Auth0.showUrl(url, closeOnLoad, (error, redirectURL) => {
        Linking.removeEventListener('url', urlHandler);
        if (error) {
          reject(error);
        } else if(redirectURL) {
          resolve(redirectURL);
        } else if(closeOnLoad) {
          resolve();
        }
      });
    });
  }

  newTransaction() {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
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
