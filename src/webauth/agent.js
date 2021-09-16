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
      //add variable to store Event
      let eventURL;
      const urlHandler = event => {
        NativeModules.A0Auth0.hide();
        Linking.removeEventListener('url', urlHandler);
        resolve(event.url);
      };
      //set variable with new event
      eventURL = Linking.addEventListener('url', urlHandler);
      NativeModules.A0Auth0.showUrl(url, closeOnLoad, (error, redirectURL) => {
       //use event.remove() method instead of EventEmitter.removeListener('type',...)
       eventURL.remove();
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
