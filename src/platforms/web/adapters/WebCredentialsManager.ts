import type { ICredentialsManager } from '../../../core/interfaces';
import type { Credentials } from '../../../types';
import {
  AuthError,
  Credentials as CredentialsModel,
  ApiCredentials,
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
      });
    } catch (e: any) {
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

  async getApiCredentials(
    audience: string,
    scope?: string,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials> {
    console.warn(
      `'getApiCredentials' for audience ${audience}, scope ${scope}, parameters ${JSON.stringify(
        parameters
      )} is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.`
    );
    return new ApiCredentials({
      accessToken: '',
      tokenType: 'Bearer',
      expiresAt: 0,
      scope: scope,
    });
  }

  async hasValidCredentials(): Promise<boolean> {
    return this.client.isAuthenticated();
  }

  async clearCredentials(): Promise<void> {
    await this.client.logout({ openUrl: false });
  }

  async clearApiCredentials(audience: string): Promise<void> {
    console.warn(
      `'clearApiCredentials' for audience ${audience} is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.`
    );
    return Promise.resolve();
  }
}
