import type { Auth0Options } from '../../types';
import { AuthError } from '../models';

/**
 * Validates the core Auth0 client options provided during initialization.
 *
 * @remarks
 * This function is called by the client factory to ensure that the developer
 * has provided the minimum required configuration before any network requests
 * are made. It throws a structured `AuthError` on failure.
 *
 * @param options The Auth0Options object to validate.
 * @throws {AuthError} If the domain or clientId are missing or malformed.
 */
export function validateAuth0Options(options: Auth0Options): void {
  if (!options) {
    throw new AuthError('InitializationError', 'Auth0 options are required.');
  }

  if (
    !options.domain ||
    typeof options.domain !== 'string' ||
    options.domain.trim() === ''
  ) {
    throw new AuthError(
      'InitializationError',
      'A valid "domain" is required for the Auth0 client.',
      { code: 'missing_domain' }
    );
  }

  if (
    options.domain.startsWith('http://') ||
    options.domain.startsWith('https://')
  ) {
    throw new AuthError(
      'InitializationError',
      'The "domain" should not include the protocol (e.g., "https://"). Provide the hostname only.',
      { code: 'invalid_domain' }
    );
  }

  if (
    !options.clientId ||
    typeof options.clientId !== 'string' ||
    options.clientId.trim() === ''
  ) {
    throw new AuthError(
      'InitializationError',
      'A valid "clientId" is required for the Auth0 client.',
      { code: 'missing_client_id' }
    );
  }
}
