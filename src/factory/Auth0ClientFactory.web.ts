import type { IAuth0Client } from '../core/interfaces';
import type { Auth0Options } from '../types';
import type { WebAuth0Options } from '../types/platform-specific';
import { validateAuth0Options, getConfigSignature } from '../core/utils';

// This file ONLY imports the Web client.
import { WebAuth0Client } from '../platforms/web';

/**
 * Creates the Web-specific IAuth0Client; selected by bundlers when targeting web.
 * Clients are cached by config signature so remounts reuse the same instance
 * (avoiding duplicate refresh exchanges); a config change yields a fresh client.
 */
export class Auth0ClientFactory {
  private static clientCache = new Map<string, IAuth0Client>();

  /**
   * Creates or returns a cached WebAuth0Client instance.
   *
   * @param options The configuration options for the Auth0 client.
   * @returns An instance of WebAuth0Client.
   */
  static createClient(options: Auth0Options): IAuth0Client {
    validateAuth0Options(options);

    const cacheKey = getConfigSignature(options);
    let client = Auth0ClientFactory.clientCache.get(cacheKey);
    if (!client) {
      client = new WebAuth0Client(options as WebAuth0Options);
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
