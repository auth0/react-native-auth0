import { Platform, Linking, type EmitterSubscription } from 'react-native';
import type { Credentials } from '../types';
import { _ensureNativeModuleIsInitializedWithConfiguration } from '../utils/nativeHelper';
import type {
  AgentLoginOptions,
  AgentLogoutOptions,
  AgentParameters,
} from '../internal-types';
import type { LocalAuthenticationOptions } from '../credentials-manager/localAuthenticationOptions';
import NativeA0Auth0 from '../specs/NativeA0Auth0';

class Agent {
  async login(
    parameters: AgentParameters,
    options: AgentLoginOptions,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<Credentials> {
    let linkSubscription: EmitterSubscription | null = null;
    if (Platform.OS === 'ios') {
      linkSubscription = Linking.addEventListener('url', async (event) => {
        linkSubscription?.remove();
        await NativeA0Auth0.resumeWebAuth(event.url);
      });
    }

    try {
      await _ensureNativeModuleIsInitializedWithConfiguration(
        NativeA0Auth0,
        parameters.clientId,
        parameters.domain,
        localAuthenticationOptions
      );
      let scheme = await this.getScheme(
        options.useLegacyCallbackUrl ?? false,
        options.customScheme
      );
      let redirectUri =
        options.redirectUrl ??
        (await this.callbackUri(parameters.domain, scheme));
      let credentials = await NativeA0Auth0.webAuth(
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

      return credentials as unknown as Credentials;
    } catch (error) {
      linkSubscription?.remove();
      throw error;
    }
  }

  async cancelWebAuth(
    parameters: AgentParameters,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<void> {
    await _ensureNativeModuleIsInitializedWithConfiguration(
      NativeA0Auth0,
      parameters.clientId,
      parameters.domain,
      localAuthenticationOptions
    );
    return NativeA0Auth0.cancelWebAuth();
  }

  async logout(
    parameters: AgentParameters,
    options: AgentLogoutOptions,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<void> {
    let federated = options.federated ?? false;
    let scheme = await this.getScheme(
      options.useLegacyCallbackUrl ?? false,
      options.customScheme
    );
    let redirectUri =
      options.returnToUrl ??
      (await this.callbackUri(parameters.domain, scheme));
    await _ensureNativeModuleIsInitializedWithConfiguration(
      NativeA0Auth0,
      parameters.clientId,
      parameters.domain,
      localAuthenticationOptions
    );
    return NativeA0Auth0.webAuthLogout(scheme, federated, redirectUri);
  }

  private async getScheme(
    useLegacyCustomSchemeBehaviour: boolean,
    customScheme?: string
  ) {
    let scheme = (await NativeA0Auth0.getBundleIdentifier()).toLowerCase();
    if (!useLegacyCustomSchemeBehaviour) {
      scheme = scheme + '.auth0';
    }
    return customScheme ?? scheme;
  }

  private async callbackUri(domain: string, scheme: string) {
    let bundleIdentifier = (
      await NativeA0Auth0.getBundleIdentifier()
    ).toLowerCase();
    return `${scheme}://${domain}/${Platform.OS}/${bundleIdentifier}/callback`;
  }
}

export default Agent;
