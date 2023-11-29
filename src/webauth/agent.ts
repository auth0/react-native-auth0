import {
  NativeModules,
  Platform,
  Linking,
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
class Agent {
  async login(
    parameters: AgentParameters,
    options: AgentLoginOptions
  ): Promise<Credentials> {
    let linkSubscription: EmitterSubscription | null = null;
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    return new Promise(async (resolve, reject) => {
      if (
        Platform.OS === 'ios' &&
        options.safariViewControllerPresentationStyle !== undefined
      ) {
        linkSubscription = Linking.addEventListener('url', async (event) => {
          try {
            linkSubscription?.remove();
            await A0Auth0.resumeWebAuth(event.url);
          } catch (error) {
            reject(error);
          }
        });
      }
      try {
        await _ensureNativeModuleIsInitialized(
          A0Auth0,
          parameters.clientId,
          parameters.domain
        );
        let scheme = this.getScheme(
          options.useLegacyCallbackUrl ?? false,
          options.customScheme
        );
        let redirectUri =
          options.redirectUrl ?? this.callbackUri(parameters.domain, scheme);
        let credentials = await A0Auth0.webAuth(
          scheme,
          redirectUri,
          options.state,
          options.nonce,
          options.audience,
          options.scope,
          options.connection,
          options.maxAge ?? 0,
          options.organization,
          options.invitationUrl,
          options.leeway ?? 0,
          options.ephemeralSession ?? false,
          options.safariViewControllerPresentationStyle ?? 99, //Since we can't pass null to the native layer, and we need a value to represent this parameter is not set, we are using 99.
          //The native layer will check for this and ignore if the value is 99
          options.additionalParameters ?? {}
        );
        resolve(credentials);
      } catch (error) {
        linkSubscription?.remove();
        reject(error);
      }
    });
  }

  async logout(
    parameters: AgentParameters,
    options: AgentLogoutOptions
  ): Promise<void> {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    let federated = options.federated ?? false;
    let scheme = this.getScheme(
      options.useLegacyCallbackUrl ?? false,
      options.customScheme
    );
    let redirectUri =
      options.returnToUrl ?? this.callbackUri(parameters.domain, scheme);
    await _ensureNativeModuleIsInitialized(
      NativeModules.A0Auth0,
      parameters.clientId,
      parameters.domain
    );
    return A0Auth0.webAuthLogout(scheme, federated, redirectUri);
  }

  private getScheme(
    useLegacyCustomSchemeBehaviour: boolean,
    customScheme?: string
  ) {
    let scheme = NativeModules.A0Auth0.bundleIdentifier.toLowerCase();
    if (!useLegacyCustomSchemeBehaviour) {
      scheme = scheme + '.auth0';
    }
    return customScheme ?? scheme;
  }

  private callbackUri(domain: string, scheme: string) {
    let bundleIdentifier = NativeModules.A0Auth0.bundleIdentifier.toLowerCase();
    return `${scheme}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`;
  }
}

export default Agent;
