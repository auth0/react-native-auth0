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
    let linkSubscription: EmitterSubscription;
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    return new Promise(async (resolve, reject) => {
      try {
        if (Platform.OS === 'ios' && options.useSFSafariViewController) {
          linkSubscription = Linking.addEventListener('url', async (event) => {
            linkSubscription.remove();
            try {
              await A0Auth0.resumeWebAuth(event.url);
            } catch (error) {
              reject(error);
            }
          });
        }
        await _ensureNativeModuleIsInitialized(
          A0Auth0,
          parameters.clientId,
          parameters.domain
        );
        let scheme = this.getScheme(
          options.useLegacyCallbackUrl ?? false,
          options.customScheme
        );
        let redirectUri = this.callbackUri(parameters.domain, scheme);
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
          options.useSFSafariViewController ?? false,
          options.additionalParameters ?? {}
        );
        resolve(credentials);
      } catch (error) {
        linkSubscription.remove();
        reject(error);
      }
    });
  }

  async logout(
    parameters: AgentParameters,
    options: AgentLogoutOptions
  ): Promise<void> {
    let linkSubscription: EmitterSubscription;
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    return new Promise(async (resolve, reject) => {
      if (Platform.OS === 'ios' && options.useSFSafariViewController) {
        linkSubscription = Linking.addEventListener('url', async (event) => {
          linkSubscription.remove();
          try {
            await A0Auth0.resumeWebAuth(event.url);
          } catch (error) {
            reject(error);
          }
        });
      }
      try {
        let federated = options.federated ?? false;
        let scheme = this.getScheme(
          options.useLegacyCallbackUrl ?? false,
          options.customScheme
        );
        let redirectUri = this.callbackUri(parameters.domain, scheme);
        await _ensureNativeModuleIsInitialized(
          NativeModules.A0Auth0,
          parameters.clientId,
          parameters.domain
        );

        resolve(
          await A0Auth0.webAuthLogout(
            scheme,
            federated,
            redirectUri,
            options.useSFSafariViewController ?? false
          )
        );
      } catch (error) {
        reject(error);
      }
    });
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
