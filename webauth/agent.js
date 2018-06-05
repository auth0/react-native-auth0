import {
  Platform,
  NativeModules,
  Linking
} from 'react-native';

const majorVersionIOS = parseInt(Platform.Version, 10);
const isIOS11Plus = Platform.OS === "ios" && majorVersionIOS >= 11;

export default class Agent {

  show(options) {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(new Error('Missing NativeModule. Please make sure you run `react-native link react-native-auth0`'));
    }

    const { url, callbackScheme, allowAuthenticationSession, closeOnLoad } = options;

    if (isIOS11Plus && allowAuthenticationSession && callbackScheme) {
      return NativeModules.A0Auth0.showAuthorization(url, callbackScheme);
    } else {
      return new Promise((resolve, reject) => {
        const urlHandler = (event) => {
          NativeModules.A0Auth0.hide();
          Linking.removeEventListener('url', urlHandler);
          resolve(event.url);
        };
        Linking.addEventListener('url', urlHandler);
        NativeModules.A0Auth0.showUrl(url, closeOnLoad, (err) => {
          Linking.removeEventListener('url', urlHandler);
          if (err) {
            reject(err);
          } else if (closeOnLoad) {
            resolve();
          }
        });
      });
    }
  }

  newTransaction() {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(new Error('Missing NativeModule. Please make sure you run `react-native link react-native-auth0`'));
    }

    return new Promise((resolve, reject) => {
      NativeModules.A0Auth0.oauthParameters((parameters) => {
        resolve(parameters);
      });
    });
  }
}