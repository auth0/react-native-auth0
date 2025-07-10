/**
 * This module serves as a central registry for all platform-specific client implementations.
 *
 * The Auth0ClientFactory uses this file to dynamically import the correct client
 * based on the runtime environment. Adding a new platform (e.g., for desktop)
 * would simply involve creating a new platform module and exporting its client
 * class from this file.
 */

export { NativeAuth0Client } from './native';
export { WebAuth0Client } from './web';
