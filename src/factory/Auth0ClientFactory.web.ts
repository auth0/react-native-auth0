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
 */
export class Auth0ClientFactory {
  /**
   * Creates and returns a WebAuth0Client instance.
   *
   * @param options The configuration options for the Auth0 client.
   * @returns An instance of WebAuth0Client.
   */
  static createClient(options: Auth0Options): IAuth0Client {
    validateAuth0Options(options);

    // No platform detection needed. We know we are on the web.
    return new WebAuth0Client(options as WebAuth0Options);
  }
}
