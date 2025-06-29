import type { Credentials } from '../types';
import type { Auth0Client, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';

class CredentialsManager {
  constructor(private client: Auth0Client) {}

  /**
   * In auth0-spa-js, credentials are saved automatically after a successful login flow.
   * This method is a no-op to maintain API compatibility.
   */
  async saveCredentials(_credentials: Credentials): Promise<void> {
    console.warn(
      'CredentialsManager.saveCredentials is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.'
    );
    return Promise.resolve();
  }

  /**
   * Retrieves the stored credentials. This is analogous to getTokenSilently in auth0-spa-js.
   */
  async getCredentials(
    _scope?: string,
    _minTtl: number = 0,
    parameters: Record<string, unknown> = {}
  ): Promise<Credentials> {
    const options: GetTokenSilentlyOptions = {
      authorizationParams: {
        ...parameters,
      },
      detailedResponse: true,
    };

    const tokenResponse = await this.client.getTokenSilently(options);

    const idTokenClaims = await this.client.getIdTokenClaims();
    if (!idTokenClaims || !idTokenClaims.exp) {
      throw new Error('ID token or expiration claim is missing.');
    }

    const { id_token, access_token, scope } = tokenResponse;

    return {
      idToken: id_token,
      accessToken: access_token,
      scope: scope,
      tokenType: 'Bearer',
      expiresAt: idTokenClaims.exp,
    };
  }

  /**
   * Checks if valid, non-expired credentials exist.
   */
  async hasValidCredentials(_minTtl: number = 0): Promise<boolean> {
    // Note: minTtl is not directly applicable in the same way,
    // as getTokenSilently handles expiry checks. isAuthenticated is the closest equivalent.
    return this.client.isAuthenticated();
  }

  /**
   * Clears the stored credentials from the local cache.
   * This is equivalent to a local-only logout in auth0-spa-js.
   */
  async clearCredentials(): Promise<void> {
    // `logout({ openUrl: false })` clears local state without redirecting.
    await this.client.logout({ openUrl: false });
  }
}

export default CredentialsManager;
