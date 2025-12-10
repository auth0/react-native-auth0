import type { ICredentialsManager } from '../../../core/interfaces';
import type { Credentials, SessionTransferCredentials } from '../../../types';
import {
  AuthError,
  CredentialsManagerError,
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
          'ID_TOKEN_CLAIM_VALIDATION_FAILED',
          'ID token or expiration claim is missing.'
        );
      }

      return new CredentialsModel({
        idToken: tokenResponse.id_token,
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type ?? 'Bearer',
        expiresAt: claims.exp,
        scope: tokenResponse.scope,
      });
    } catch (e: any) {
      const code = e.error ?? 'GetCredentialsFailed';
      const authError = new AuthError(code, e.error_description ?? e.message, {
        json: e,
        code,
      });
      throw new CredentialsManagerError(authError);
    }
  }

  async getApiCredentials(
    audience: string,
    scope?: string,
    _minTtl?: number,
    parameters?: Record<string, any>
  ): Promise<ApiCredentials> {
    try {
      const tokenResponse = await this.client.getTokenSilently({
        authorizationParams: {
          ...parameters,
          audience: audience,
          scope: scope,
        },
        detailedResponse: true,
      });

      // Calculate access token expiration from expires_in (seconds until expiration)
      // This is more accurate than using ID token claims for API credentials
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const expiresAt = nowInSeconds + (tokenResponse.expires_in ?? 3600);

      return new ApiCredentials({
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        expiresAt: expiresAt,
        scope: tokenResponse.scope,
      });
    } catch (e: any) {
      const code = e.error ?? 'GetApiCredentialsFailed';
      const authError = new AuthError(code, e.error_description ?? e.message, {
        json: e,
        code,
      });
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
      const code = e.error ?? 'ClearCredentialsFailed';
      const authError = new AuthError(code, e.error_description ?? e.message, {
        json: e,
        code,
      });
      throw new CredentialsManagerError(authError);
    }
  }

  async getSSOCredentials(
    _parameters?: Record<string, any>,
    _headers?: Record<string, string>
  ): Promise<SessionTransferCredentials> {
    const authError = new AuthError(
      'UnsupportedOperation',
      'Native to Web SSO is only supported on native platforms (iOS/Android). This feature is not available in web environments.',
      { code: 'unsupported_operation' }
    );
    throw new CredentialsManagerError(authError);
  }

  async clearApiCredentials(audience: string): Promise<void> {
    console.warn(
      `'clearApiCredentials' for audience ${audience} is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.`
    );
    return Promise.resolve();
  }
}
