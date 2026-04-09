import type { IAuth0Client } from '../core/interfaces';
import type { Auth0Options } from '../types';
import type { NativeAuth0Options } from '../types/platform-specific';
import { validateAuth0Options } from '../core/utils';

// This file ONLY imports the Native client.
import { NativeAuth0Client } from '../platforms/native';

/**
 * A factory class responsible for creating the Native-specific
 * IAuth0Client instance. This file is automatically selected by the Metro
 * bundler during a build for iOS or Android.
 *
 * Instances are cached by domain+clientId so that React component
 * remounts (e.g., Auth0Provider unmount/remount) reuse the same
 * client and its in-flight state, preventing duplicate refresh token
 * exchanges.
 */
export class Auth0ClientFactory {
  private static clientCache = new Map<string, IAuth0Client>();

  /**
   * Creates or returns a cached NativeAuth0Client instance.
   *
   * @param options The configuration options for the Auth0 client.
   * @returns An instance of NativeAuth0Client.
   */
  static createClient(options: Auth0Options): IAuth0Client {
    validateAuth0Options(options);

    const cacheKey = `${options.domain}|${options.clientId}`;
    let client = Auth0ClientFactory.clientCache.get(cacheKey);
    if (!client) {
      client = new NativeAuth0Client(options as NativeAuth0Options);
      Auth0ClientFactory.clientCache.set(cacheKey, client);
    }
    return client;
  }

  /**
   * Reset the client cache. Used for testing purposes.
   * @internal
   */
  static resetClientCache(): void {
    Auth0ClientFactory.clientCache.clear();
  }
}
