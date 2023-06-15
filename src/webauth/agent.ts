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
      options.leeway ?? 0,
      options.ephemeralSession ?? false
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

  getScheme(customScheme?: string) {
    return customScheme ?? NativeModules.A0Auth0.bundleIdentifier.toLowerCase();
  }
}
