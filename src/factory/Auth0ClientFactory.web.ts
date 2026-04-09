import type { IAuth0Client } from '../core/interfaces';
import type { Auth0Options } from '../types';
import type { WebAuth0Options } from '../types/platform-specific';
import { validateAuth0Options } from '../core/utils';

// This file ONLY imports the Web client.
import { WebAuth0Client } from '../platforms/web';

/**
 * A factory class responsible for creating the Web-specific
 * IAuth0Client instance. This file is automatically selected by bundlers
 * like Webpack when targeting the web.
 *
 * Instances are cached by domain+clientId so that React component
 * remounts (e.g., Auth0Provider unmount/remount) reuse the same
 * client and its in-flight state, preventing duplicate refresh token
 * exchanges.
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

    const cacheKey = `${options.domain}|${options.clientId}`;
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
