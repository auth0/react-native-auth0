import { Linking, Platform, type EmitterSubscription } from 'react-native';
import type { IWebAuthProvider } from '../../../core/interfaces';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
} from '../../../types';
import type {
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
} from '../../../types/platform-specific';
import type { INativeBridge } from '../bridge';
import { finalizeScope } from '../../../core/utils';
import { AuthError } from '../../../core/models';

const webAuthNotSupported = 'This Method is only available in web platform.';

/**
 * A native platform-specific implementation of the IWebAuthProvider.
 * This class translates web authentication calls into calls to the native bridge.
 */
export class NativeWebAuthProvider implements IWebAuthProvider {
  constructor(
    private bridge: INativeBridge,
    private domain: string
  ) {}
  handleRedirectCallback(): Promise<void> {
    throw new AuthError('NotImplemented', webAuthNotSupported);
  }

  async authorize(
    parameters: WebAuthorizeParameters = {},
    options: NativeAuthorizeOptions = {}
  ): Promise<Credentials> {
    let linkSubscription: EmitterSubscription | null = null;
    if (Platform.OS === 'ios') {
      linkSubscription = Linking.addEventListener('url', async (event) => {
        // This listener catches the deep link and forwards it to the native side.
        linkSubscription?.remove();
        await this.bridge.resumeWebAuth(event.url);
      });
    }

    try {
      // 1. Construct the scheme and redirectUri here.
      const scheme =
        options.customScheme ??
        (await this.getDefaultScheme(options.useLegacyCallbackUrl));
      const redirectUri =
        parameters.redirectUrl ?? (await this.getCallbackUri(scheme));
      const finalScope = finalizeScope(parameters.scope);

      // 2. Create the final parameter set for the bridge.
      const authParams: WebAuthorizeParameters = {
        ...parameters,
        scope: finalScope,
        redirectUrl: redirectUri,
      };

      // 3. Create the final options set for the bridge.
      const authOptions: NativeAuthorizeOptions = {
        ...options,
        customScheme: scheme,
      };

      // 4. Call the bridge with the finalized parameters and options.
      const credentials = await this.bridge.authorize(authParams, authOptions);

      // On success, we can safely remove the listener if it hasn't been already.
      linkSubscription?.remove();
      return credentials;
    } catch (error) {
      // On error, always clean up the listener.
      linkSubscription?.remove();
      throw error;
    }
  }

  async clearSession(
    parameters: ClearSessionParameters = {},
    options: NativeClearSessionOptions = {}
  ): Promise<void> {
    // 1. Determine the scheme from the `options` object.
    const scheme =
      options.customScheme ??
      (await this.getDefaultScheme(options.useLegacyCallbackUrl));

    // 2. Determine the returnToUrl from the `parameters` object, providing a default if needed.
    const returnToUrl =
      parameters.returnToUrl ?? (await this.getCallbackUri(scheme));

    // 3. Prepare the final parameters and options for the bridge.
    const finalParameters: ClearSessionParameters = {
      ...parameters,
      returnToUrl,
    };
    const finalOptions: NativeClearSessionOptions = {
      ...options,
      customScheme: scheme,
    };

    // 4. Call the bridge with the two separate, finalized objects.
    return this.bridge.clearSession(finalParameters, finalOptions);
  }

  async cancelWebAuth(): Promise<void> {
    // This is a direct pass-through, as the method signatures match.
    return this.bridge.cancelWebAuth();
  }

  private async getDefaultScheme(useLegacy: boolean = false): Promise<string> {
    const bundleId = (await this.bridge.getBundleIdentifier()).toLowerCase();
    return useLegacy ? bundleId : `${bundleId}.auth0`;
  }

  private async getCallbackUri(scheme: string): Promise<string> {
    const bundleId = (await this.bridge.getBundleIdentifier()).toLowerCase();
    return `${scheme}://${this.domain}/${Platform.OS}/${bundleId}/callback`;
  }
}
