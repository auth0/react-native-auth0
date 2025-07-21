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

/**
 * Validates that a given parameters object contains all specified required keys.
 *
 * @param params The object to validate.
 * @param requiredKeys An array of keys that must be present in the params object.
 * @throws {AuthError} If any of the required keys are missing.
 */
export function validateParameters(
  params: Record<string, unknown>,
  requiredKeys: string[]
): void {
  const missingKeys = requiredKeys.filter(
    (key) => params[key] === null || params[key] === undefined
  );

  if (missingKeys.length > 0) {
    throw new AuthError(
      'MissingParameters',
      `The following parameters are required but were not provided: ${missingKeys.join(
        ', '
      )}`,
      { code: 'missing_parameters' }
    );
  }
}
