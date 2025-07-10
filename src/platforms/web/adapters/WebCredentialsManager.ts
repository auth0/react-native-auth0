import type { Auth0Client } from '@auth0/auth0-spa-js';
import type { ICredentialsManager } from '../../../core/interfaces';
import type { Credentials } from '../../../types';
import {
  AuthError,
  Credentials as CredentialsModel,
} from '../../../core/models';

/**
 * A web platform-specific implementation of the ICredentialsManager.
 * It leverages the internal cache and token management of `auth0-spa-js`.
 */
export class WebCredentialsManager implements ICredentialsManager {
  constructor(private client: Auth0Client) {}

  async saveCredentials(_credentials: Credentials): Promise<void> {
    // In auth0-spa-js, credentials are saved automatically after a successful
    // login flow. This method is a no-op to maintain API compatibility.
    console.warn(
      'CredentialsManager.saveCredentials is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.'
    );
    return Promise.resolve();
  }

  async getCredentials(
    scope?: string,
    _minTtl?: number, // minTtl is not directly applicable; getTokenSilently handles expiry checks.
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    try {
      const tokenResponse = await this.client.getTokenSilently({
        cacheMode: forceRefresh ? 'off' : 'on',
        authorizationParams: {
          ...parameters,
          scope,
        },
        detailedResponse: true,
      });

      const claims = await this.client.getIdTokenClaims();
      if (!claims || !claims.exp) {
        throw new AuthError(
          'IdTokenMissing',
          'ID token or expiration claim is missing.'
        );
      }

      return new CredentialsModel({
        idToken: tokenResponse.id_token,
        accessToken: tokenResponse.access_token,
        tokenType: 'Bearer',
        expiresAt: claims.exp,
        scope: tokenResponse.scope,
        // auth0-spa-js does not expose the refresh token directly.
      });
    } catch (e: any) {
      // Map common spa-js errors to our standard AuthError
      if (e.error === 'login_required' || e.error === 'consent_required') {
        throw new AuthError(
          e.error,
          'User interaction is required for login or consent.',
          { json: e }
        );
      }
      throw new AuthError(
        e.error ?? 'GetCredentialsFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async hasValidCredentials(_minTtl?: number): Promise<boolean> {
    // The closest equivalent in auth0-spa-js is isAuthenticated(), which checks
    // for a valid, non-expired session locally.
    return this.client.isAuthenticated();
  }

  async clearCredentials(): Promise<void> {
    // This is equivalent to a local-only logout.
    // It clears the cache in auth0-spa-js without a full redirect.
    await this.client.logout({ openUrl: false });
  }
}
