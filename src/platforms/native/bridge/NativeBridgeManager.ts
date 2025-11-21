import type { INativeBridge } from './INativeBridge';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  NativeClearSessionOptions,
  DPoPHeadersParams,
  SessionTransferCredentials,
} from '../../../types';
import {
  SafariViewControllerPresentationStyle,
  type LocalAuthenticationOptions,
  type NativeAuthorizeOptions,
} from '../../../types/platform-specific';
import {
  AuthError,
  Credentials as CredentialsModel,
} from '../../../core/models';
import Auth0NativeModule from '../../../specs/NativeA0Auth0';
import type { NativeModuleError } from '../../../core/interfaces';

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
      throw new AuthError(code, message, { code, json: e });
    }
  }

  async hasValidInstance(clientId: string, domain: string): Promise<boolean> {
    return this.a0_call(
      Auth0NativeModule.hasValidAuth0InstanceWithConfiguration.bind(
        Auth0NativeModule
      ),
      clientId,
      domain
    );
  }

  async initialize(
    clientId: string,
    domain: string,
    localAuthenticationOptions?: LocalAuthenticationOptions,
    useDPoP: boolean = true
  ): Promise<void> {
    // This is a new method we'd add to the native side to ensure the
    // underlying Auth0.swift/Auth0.android SDKs are configured.
    return this.a0_call(
      Auth0NativeModule.initializeAuth0WithConfiguration.bind(
        Auth0NativeModule
      ),
      clientId,
      domain,
      localAuthenticationOptions,
      useDPoP
    );
  }

  getBundleIdentifier(): Promise<string> {
    return this.a0_call(
      Auth0NativeModule.getBundleIdentifier.bind(Auth0NativeModule)
    );
  }

  async authorize(
    parameters: WebAuthorizeParameters,
    options: NativeAuthorizeOptions
  ): Promise<Credentials> {
    let presentationStyle = options.useSFSafariViewController
      ? (options.useSFSafariViewController as { presentationStyle: number })
          ?.presentationStyle ??
        SafariViewControllerPresentationStyle.fullScreen
      : undefined;
    const scheme =
      parameters.redirectUrl?.split('://')[0] ?? options.customScheme;
    const credential = await this.a0_call(
      Auth0NativeModule.webAuth.bind(Auth0NativeModule),
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
      presentationStyle ?? 99, // Since we can't pass null to the native layer, and we need a value to represent this parameter is not set, we are using 99.
      // //The native layer will check for this and ignore if the value is 99
      parameters.additionalParameters ?? {}
    );
    return new CredentialsModel(credential);
  }

  async clearSession(
    parameters: ClearSessionParameters,
    options: NativeClearSessionOptions
  ): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.webAuthLogout.bind(Auth0NativeModule),
      options.customScheme,
      parameters.federated ?? false,
      parameters.returnToUrl
    );
  }

  async cancelWebAuth(): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.cancelWebAuth.bind(Auth0NativeModule)
    );
  }

  async saveCredentials(credentials: Credentials): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.saveCredentials.bind(Auth0NativeModule),
      credentials
    );
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
      Auth0NativeModule.getCredentials.bind(Auth0NativeModule),
      scope,
      minTtl ?? 0,
      params,
      forceRefresh ?? false
    );
  }

  async hasValidCredentials(minTtl?: number): Promise<boolean> {
    return this.a0_call(
      Auth0NativeModule.hasValidCredentials.bind(Auth0NativeModule),
      minTtl ?? 0
    );
  }

  async clearCredentials(): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.clearCredentials.bind(Auth0NativeModule)
    );
  }

  async resumeWebAuth(url: string): Promise<void> {
    return this.a0_call(
      Auth0NativeModule.resumeWebAuth.bind(Auth0NativeModule),
      url
    );
  }

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    return this.a0_call(
      Auth0NativeModule.getDPoPHeaders.bind(Auth0NativeModule),
      params.url,
      params.method,
      params.accessToken,
      params.tokenType,
      params.nonce
    );
  }

  async clearDPoPKey(): Promise<void> {
    return this.a0_call(Auth0NativeModule.clearDPoPKey.bind(Auth0NativeModule));
  }

  async getSSOCredentials(
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<SessionTransferCredentials> {
    const params = parameters ?? {};
    const hdrs = headers ?? {};
    return this.a0_call(
      Auth0NativeModule.getSSOCredentials.bind(Auth0NativeModule),
      params,
      hdrs
    );
  }
}
