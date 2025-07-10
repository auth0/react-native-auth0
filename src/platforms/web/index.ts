/**
 * This is the primary entry point for the Web platform module.
 *
 * It exports the main client class, `WebAuth0Client`, which aggregates all
 * web-specific functionality and adapters built on top of `auth0-spa-js`.
 * This class is intended to be consumed by the `Auth0ClientFactory`.
 */

export { WebAuth0Client } from './adapters/WebAuth0Client';
