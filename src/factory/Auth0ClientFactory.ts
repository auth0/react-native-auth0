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
 */
export class Auth0ClientFactory {
  /**
   * Creates and returns a NativeAuth0Client instance.
   *
   * @param options The configuration options for the Auth0 client.
   * @returns An instance of NativeAuth0Client.
   */
  static createClient(options: Auth0Options): IAuth0Client {
    validateAuth0Options(options);

    // No platform detection needed. We know we are on native.
    return new NativeAuth0Client(options as NativeAuth0Options);
  }
}
