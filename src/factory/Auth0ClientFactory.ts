import type { IAuth0Client } from '../core/interfaces';
import type { Auth0Options } from '../types';
import type {
  NativeAuth0Options,
  WebAuth0Options,
} from '../types/platform-specific';
import { validateAuth0Options } from '../core/utils';
import { PlatformDetector } from './PlatformDetector';

// Import all platform clients from the central platform registry.
import { NativeAuth0Client, WebAuth0Client } from '../platforms';

/**
 * A factory class responsible for creating the appropriate platform-specific
 * IAuth0Client instance based on the runtime environment.
 */
export class Auth0ClientFactory {
  /**
   * Creates and returns a platform-specific instance of an IAuth0Client.
   *
   * @param options The configuration options for the Auth0 client.
   * @returns An instance of a class that implements the `IAuth0Client` interface.
   */
  static createClient(options: Auth0Options): IAuth0Client {
    // First, validate the core options to fail early on misconfiguration.
    validateAuth0Options(options);

    const platform = PlatformDetector.detect();

    switch (platform) {
      case 'native':
        // We cast the options to the native-specific type. This is safe
        // because we've detected the platform.
        return new NativeAuth0Client(options as NativeAuth0Options);

      case 'web':
        // Similarly, we cast for the web platform.
        return new WebAuth0Client(options as WebAuth0Options);

      // The default case is technically unreachable because PlatformDetector throws,
      // but it's good practice for type safety and future-proofing.
      default:
        throw new Error(
          `The platform "${platform}" is not supported by the Auth0ClientFactory.`
        );
    }
  }
}
