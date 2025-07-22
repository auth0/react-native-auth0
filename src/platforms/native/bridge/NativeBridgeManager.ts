import type { INativeBridge } from './INativeBridge';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  NativeClearSessionOptions,
} from '../../../types';
import {
  type LocalAuthenticationOptions,
  type NativeAuthorizeOptions,
} from '../../../types/platform-specific';
import {
  AuthError,
  Credentials as CredentialsModel,
} from '../../../core/models';
import Auth0NativeModule from '../../../specs/NativeA0Auth0';

type NativeModuleError = {
  code: string;
  message: string;
};

/**
 * Manages the direct communication with the native Auth0 module.
 * It implements the INativeBridge interface and is responsible for:
 * - Calling the actual native methods.
 *-  Normalizing data and parameters between JS and Native.
 * - Catching native errors and re-throwing them as structured AuthError objects.
 */
export class NativeBridgeManager implements INativeBridge {
  private async a0_call<T>(
    nativeMethod: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    try {
      return await nativeMethod(...args);
    } catch (e) {
      const { code, message } = e as NativeModuleError;
      throw new AuthError(code, message, { code });
    }
  }

  async hasValidInstance(clientId: string, domain: string): Promise<boolean> {
    return this.a0_call(
      Auth0NativeModule.hasValidAuth0InstanceWithConfiguration,
      clientId,
      domain
    );
  }

  async initialize(
    clientId: string,
    domain: string,
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<void> {
    // This is a new method we'd add to the native side to ensure the
    // underlying Auth0.swift/Auth0.android SDKs are configured.
    return this.a0_call(
      Auth0NativeModule.initializeAuth0WithConfiguration,
      clientId,
      domain,
      localAuthenticationOptions
    );
  }

  getBundleIdentifier(): Promise<string> {
    return this.a0_call(Auth0NativeModule.getBundleIdentifier);
  }

  async authorize(
    parameters: WebAuthorizeParameters,
    options: NativeAuthorizeOptions
  ): Promise<Credentials> {
    let presentationStyle: number | undefined;
    if (options.useSFSafariViewController === true) {
      // If just `true`, default to a safe style like `fullScreen` (value 1 from our enum)
      presentationStyle = 1;
    } else if (typeof options.useSFSafariViewController === 'object') {
      presentationStyle = options.useSFSafariViewController.presentationStyle;
    } else {
      // If false or undefined, pass undefined to the native layer.
      presentationStyle = undefined;
    }
    const scheme =
      parameters.redirectUrl?.split('://')[0] ?? options.customScheme;
    const credential = await this.a0_call(
      Auth0NativeModule.webAuth,
      scheme,
      parameters.redirectUrl,
      parameters.state,
      parameters.nonce,
      parameters.audience,
      parameters.scope,
      parameters.connection,
      parameters.maxAge ?? 0,
      parameters.organization,
      parameters.invitationUrl,
      options.leeway ?? 0,
      options.ephemeralSession ?? false,
      presentationStyle,
      parameters.additionalParameters ?? {}
    );
    return new CredentialsModel(credential);
  }

  async clearSession(
    parameters: ClearSessionParameters,
    options: NativeClearSessionOptions
  ): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.webAuthLogout,
      options.customScheme,
      parameters.federated ?? false,
      parameters.returnToUrl
    );
  }

  async cancelWebAuth(): Promise<void> {
    return this.a0_call(Auth0NativeModule.cancelWebAuth);
  }

  async saveCredentials(credentials: Credentials): Promise<void> {
    return this.a0_call(Auth0NativeModule.saveCredentials, credentials);
  }

  async getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    // Assuming the native side can take an empty object for parameters.
    const params = parameters ?? {};
    return this.a0_call(
      Auth0NativeModule.getCredentials,
      scope,
      minTtl ?? 0,
      params,
      forceRefresh ?? false
    );
  }

  async hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.a0_call(Auth0NativeModule.hasValidCredentials, minTtl ?? 0);
  }

  async clearCredentials(): Promise<void> {
    return this.a0_call(Auth0NativeModule.clearCredentials);
  }

  async resumeWebAuth(url: string): Promise<void> {
    return this.a0_call(Auth0NativeModule.resumeWebAuth, url);
  }
}
