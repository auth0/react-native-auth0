import {
  NativeModules,
  Linking,
  Platform,
  EmitterSubscription,
} from 'react-native';
import { Credentials } from 'src/types';
import { _ensureNativeModuleIsInitialized } from '../utils/nativeHelper';
import {
  AgentLoginOptions,
  AgentLogoutOptions,
  AgentParameters,
  Auth0Module,
} from 'src/internal-types';

const A0Auth0: Auth0Module = NativeModules.A0Auth0;
export default class Agent {
  async login(
    parameters: AgentParameters,
    options: AgentLoginOptions
  ): Promise<Credentials> {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    await _ensureNativeModuleIsInitialized(
      A0Auth0,
      parameters.clientId,
      parameters.domain
    );
    let scheme = this.getScheme(options.customScheme);
    return A0Auth0.webAuth(
      scheme,
      options.state,
      options.nonce,
      options.audience,
      options.scope,
      options.connection,
      options.maxAge ?? 0,
      options.organization,
      options.invitationUrl,
      options.leeway ?? 0
    );
  }

  async logout(
    parameters: AgentParameters,
    options: AgentLogoutOptions
  ): Promise<void> {
    let federated = options.federated ?? false;
    let scheme = this.getScheme(options.customScheme);
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    await _ensureNativeModuleIsInitialized(
      NativeModules.A0Auth0,
      parameters.clientId,
      parameters.domain
    );

    return A0Auth0.webAuthLogout(scheme, federated);
  }

  show(
    url: string,
    ephemeralSession = false,
    skipLegacyListener = false,
    closeOnLoad = false
  ): Promise<string | undefined> {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }

    return new Promise((resolve, reject) => {
      let eventURL: EmitterSubscription;
      const removeListener = () => {
        //This is done to handle backward compatibility with RN <= 0.64 which doesn't return EmitterSubscription on addEventListener
        //TODO we are removing this logic as
        // 1. We will remove this file during native code migration
        // 2. skipLegacyListener will be removed which will cause eventURL to never be null
        eventURL.remove();
      };
      const urlHandler = (event: any) => {
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
      NativeModules.A0Auth0.showUrl(
        url,
        ...params,
        (error: any, redirectURL: string) => {
          if (!skipLegacyListener) {
            removeListener();
          }
          if (error) {
            reject(error);
          } else if (redirectURL) {
            resolve(redirectURL);
          } else if (closeOnLoad) {
            resolve(undefined);
          } else {
            reject(new Error('Unknown WebAuth error'));
          }
        }
      );
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
      NativeModules.A0Auth0.oauthParameters((parameters: any) => {
        resolve(parameters);
      });
    });
  }

  getScheme(customScheme?: string) {
    return customScheme ?? NativeModules.A0Auth0.bundleIdentifier.toLowerCase();
  }
}
