import type {
  IAuth0Client,
  IAuthenticationProvider,
  IUsersClient,
} from '../../../core/interfaces';
import type { NativeAuth0Options } from '../../../types/platform-specific';
import { NativeWebAuthProvider } from './NativeWebAuthProvider';
import { NativeCredentialsManager } from './NativeCredentialsManager';
import { type INativeBridge, NativeBridgeManager } from '../bridge';
import {
  AuthenticationOrchestrator,
  ManagementApiOrchestrator,
} from '../../../core/services';
import { HttpClient } from '../../../core/services/HttpClient';

export class NativeAuth0Client implements IAuth0Client {
  readonly webAuth: NativeWebAuthProvider;
  readonly credentialsManager: NativeCredentialsManager;
  readonly auth: IAuthenticationProvider;
  private ready: Promise<void>;
  private readonly httpClient: HttpClient;

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
    const { clientId, domain, localAuthenticationOptions } = options;
    const hasValidInstance = await bridge.hasValidInstance(clientId, domain);
    if (!hasValidInstance) {
      await bridge.initialize(clientId, domain, localAuthenticationOptions);
    }
  }

  users(token: string): IUsersClient {
    return new ManagementApiOrchestrator({
      token: token,
      httpClient: this.httpClient,
    });
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
