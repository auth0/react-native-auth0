import { NativeModules, Platform, Linking } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import type { Credentials } from '../types';
import { _ensureNativeModuleIsInitializedWithConfiguration } from '../utils/nativeHelper';
import type {
  AgentLoginOptions,
  AgentLogoutOptions,
  AgentParameters,
  Auth0Module,
} from '../internal-types';
import type { LocalAuthenticationOptions } from '../credentials-manager/localAuthenticationOptions';

const A0Auth0: Auth0Module = NativeModules.A0Auth0;
class Agent {
  async login(
    parameters: AgentParameters,
    options: AgentLoginOptions,
    localAuthenticationOptions?: LocalAuthenticationOptions
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
      if (Platform.OS === 'ios') {
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
        await _ensureNativeModuleIsInitializedWithConfiguration(
          A0Auth0,
          parameters.clientId,
          parameters.domain,
          localAuthenticationOptions
        );
        let scheme = this.getScheme(
          options.useLegacyCallbackUrl ?? false,
          options.customScheme
        );
        let redirectUri =
          options.redirectUrl ?? this.callbackUri(parameters.domain, scheme);

        // The native modules will now check if scheme.startsWith("https") internally
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
          options.safariViewControllerPresentationStyle ?? 99,
          options.additionalParameters ?? {}
        );
        resolve(credentials);
      } catch (error) {
        linkSubscription?.remove();
        reject(error);
      }
    });
  }

  async cancelWebAuth(
    parameters: AgentParameters,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<void> {
    if (!NativeModules.A0Auth0) {
      return Promise.reject(
        new Error(
          'Missing NativeModule. React Native versions 0.60 and up perform auto-linking. Please see https://github.com/react-native-community/cli/blob/master/docs/autolinking.md.'
        )
      );
    }
    await _ensureNativeModuleIsInitializedWithConfiguration(
      NativeModules.A0Auth0,
      parameters.clientId,
      parameters.domain,
      localAuthenticationOptions
    );
    return A0Auth0.cancelWebAuth();
  }

  async logout(
    parameters: AgentParameters,
    options: AgentLogoutOptions,
    localAuthenticationOptions?: LocalAuthenticationOptions
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

    // The native modules will now check if scheme.startsWith("https") internally
    await _ensureNativeModuleIsInitializedWithConfiguration(
      NativeModules.A0Auth0,
      parameters.clientId,
      parameters.domain,
      localAuthenticationOptions
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
