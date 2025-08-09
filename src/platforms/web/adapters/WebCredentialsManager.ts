import type { ICredentialsManager } from '../../../core/interfaces';
import type { Credentials } from '../../../types';
import {
  AuthError,
  CredentialsManagerError,
  Credentials as CredentialsModel,
} from '../../../core/models';
import type { Auth0Client } from '@auth0/auth0-spa-js';

export class WebCredentialsManager implements ICredentialsManager {
  constructor(private client: Auth0Client) {}

  async saveCredentials(_credentials: Credentials): Promise<void> {
    console.warn(
      '`saveCredentials` is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.'
    );
    return Promise.resolve();
  }

  async getCredentials(
    scope?: string,
    _minTtl?: number,
    parameters?: Record<string, any>,
    forceRefresh?: boolean
  ): Promise<Credentials> {
    try {
      const tokenResponse = await this.client.getTokenSilently({
        cacheMode: forceRefresh ? 'off' : 'on',
        authorizationParams: { ...parameters, scope },
        detailedResponse: true,
      });

      const claims = await this.client.getIdTokenClaims();
      if (!claims || !claims.exp) {
        throw new AuthError(
          'ID_TOKEN_CLAIM_VALIDATION_FAILED',
          'ID token or expiration claim is missing.'
        );
      }

      return new CredentialsModel({
        idToken: tokenResponse.id_token,
        accessToken: tokenResponse.access_token,
        tokenType: 'Bearer',
        expiresAt: claims.exp,
        scope: tokenResponse.scope,
      });
    } catch (e: any) {
      const authError = new AuthError(
        e.error ?? 'GetCredentialsFailed',
        e.error_description ?? e.message,
        { json: e }
      );
      throw new CredentialsManagerError(authError);
    }
  }

  async hasValidCredentials(): Promise<boolean> {
    return this.client.isAuthenticated();
  }

  async clearCredentials(): Promise<void> {
    try {
      await this.client.logout({ openUrl: false });
    } catch (e: any) {
      const authError = new AuthError(
        e.error ?? 'ClearCredentialsFailed',
        e.error_description ?? e.message,
        { json: e }
      );
      throw new CredentialsManagerError(authError);
    }
  }
}
