import {NativeModules, Linking, Platform} from 'react-native';

export default class Agent {
  show(
    url,
    ephemeralSession = false,
    skipLegacyListener = false,
    closeOnLoad = false,
  ) {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.',
        ),
      );
    }

    return new Promise((resolve, reject) => {
      let eventURL;
      const removeListener = () => {
        //This is done to handle backward compatibility with RN <= 0.64 which doesn't return EmitterSubscription on addEventListener
        if (eventURL === undefined) {
          Linking.removeEventListener('url', urlHandler);
        } else {
          eventURL.remove();
        }
      };
      const urlHandler = event => {
        NativeModules.A0Auth0.hide();
        if (!skipLegacyListener) {
          removeListener();
        }
        resolve(event.url);
      };
      const params =
        Platform.OS === 'ios' ? [ephemeralSession, closeOnLoad] : [closeOnLoad];
      if (!skipLegacyListener) {
        eventURL = Linking.addEventListener('url', urlHandler);
      }
      NativeModules.A0Auth0.showUrl(url, ...params, (error, redirectURL) => {
        if (!skipLegacyListener) {
          removeListener();
        }
        if (error) {
          reject(error);
        } else if (redirectURL) {
          resolve(redirectURL);
        } else if (closeOnLoad) {
          resolve();
        } else {
          reject(new Error('Unknown WebAuth error'));
        }
      });
    });
  }

  newTransaction() {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.',
        ),
      );
    }

    return new Promise((resolve, reject) => {
      NativeModules.A0Auth0.oauthParameters(parameters => {
        resolve(parameters);
      });
    });
  }
}
