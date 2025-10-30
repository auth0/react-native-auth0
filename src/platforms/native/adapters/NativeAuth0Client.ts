import type {
  IAuth0Client,
  IAuthenticationProvider,
  IUsersClient,
} from '../../../core/interfaces';
import type { NativeAuth0Options } from '../../../types/platform-specific';
import type { DPoPHeadersParams } from '../../../types';
import { NativeWebAuthProvider } from './NativeWebAuthProvider';
import { NativeCredentialsManager } from './NativeCredentialsManager';
import { type INativeBridge, NativeBridgeManager } from '../bridge';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';
import { AuthError, DPoPError } from '../../../core/models';

export class NativeAuth0Client implements IAuth0Client {
  readonly webAuth: NativeWebAuthProvider;
  readonly credentialsManager: NativeCredentialsManager;
  readonly auth: IAuthenticationProvider;
  private ready: Promise<void>;
  private readonly httpClient: HttpClient;
  private readonly bridge: INativeBridge;

  constructor(options: NativeAuth0Options) {
    const baseUrl = `https://${options.domain}`;
    this.httpClient = new HttpClient({
      baseUrl: baseUrl,
      timeout: options.timeout,
      headers: options.headers,
    });
    this.auth = new AuthenticationOrchestrator({
      clientId: options.clientId,
      httpClient: this.httpClient,
    });
    const bridge = new NativeBridgeManager();
    this.bridge = bridge;

    this.ready = this.initialize(bridge, options);

    // The adapters are now constructed with a "proxied" bridge that
    // automatically awaits the `ready` promise before any call.
    const guardedBridge = this.createGuardedBridge(bridge);
    this.webAuth = new NativeWebAuthProvider(guardedBridge, options.domain);
    this.credentialsManager = new NativeCredentialsManager(guardedBridge);
  }

  private async initialize(
    bridge: INativeBridge,
    options: NativeAuth0Options
  ): Promise<void> {
    const {
      clientId,
      domain,
      localAuthenticationOptions,
      useDPoP = true,
    } = options;
    const hasValidInstance = await bridge.hasValidInstance(clientId, domain);
    if (!hasValidInstance) {
      await bridge.initialize(
        clientId,
        domain,
        localAuthenticationOptions,
        useDPoP
      );
    }
  }

  users(token: string): IUsersClient {
    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
    });
  }

  async getDPoPHeaders(
    params: DPoPHeadersParams
  ): Promise<Record<string, string>> {
    await this.ready;
    try {
      return await this.bridge.getDPoPHeaders(params);
    } catch (e) {
      // Wrap the error as a DPoPError if it's an AuthError
      if (e instanceof AuthError) {
        throw new DPoPError(e);
      }
      throw e;
    }
  }

  private createGuardedBridge(bridge: INativeBridge): INativeBridge {
    const guarded: any = {};

    // Get the prototype of the bridge instance to access its methods.
    const bridgePrototype = Object.getPrototypeOf(bridge);

    // Get all method names from the prototype.
    const methodNames = Object.getOwnPropertyNames(bridgePrototype).filter(
      (name) =>
        name !== 'constructor' &&
        typeof bridgePrototype[name] === 'function' &&
        name !== 'hasValidInstance' &&
        name !== 'initialize'
    );

    // Iterate over the method names and create the wrapped (guarded) functions.
    for (const methodName of methodNames) {
      const originalMethod = (bridge as any)[methodName];

      guarded[methodName] = async (...args: any[]) => {
        // This is the "guard": wait for the initialization promise to resolve.
        await this.ready;
        // Call the original method with the correct 'this' context.
        return originalMethod.apply(bridge, args);
      };
    }

    return guarded as INativeBridge;
  }
}
