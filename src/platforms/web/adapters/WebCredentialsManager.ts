import type { CredentialsManager } from '../../../core/interfaces';
import type { Credentials, SessionTransferCredentials } from '../../../types';
import {
  AuthError,
  CredentialsManagerError,
  Credentials as CredentialsModel,
  ApiCredentials,
} from '../../../core/models';
import type { Auth0Client } from '@auth0/auth0-spa-js';

export class WebCredentialsManager implements CredentialsManager {
  constructor(private client: Auth0Client) {}

  // @auth0/auth0-spa-js (>= ^2.22.0) enforces the IPSIE `session_expiry` ceiling
  // silently: once the upstream IdP session has expired, `getTokenSilently`
  // resolves without a token instead of throwing. Surface this as SESSION_EXPIRED
  // so callers get the same actionable signal as native (re-authentication
  // required). If a future spa-js bump changes this behavior, revalidate the
  // callers that rely on the undefined return below.
  private sessionExpiredError(): CredentialsManagerError {
    return new CredentialsManagerError(
      new AuthError(
        'session_expired',
        'The session has expired and the user must re-authenticate.',
        { code: 'session_expired' }
      )
    );
  }

  // Normalize a caught error into a CredentialsManagerError. Errors we've already
  // classified (e.g. the session_expiry ceiling) are passed through unchanged;
  // anything else is wrapped in an AuthError with the given fallback code.
  private toCredentialsManagerError(
    e: any,
    fallbackCode: string
  ): CredentialsManagerError {
    if (e instanceof CredentialsManagerError) {
      return e;
    }
    const code = e.error ?? fallbackCode;
    return new CredentialsManagerError(
      new AuthError(code, e.error_description ?? e.message, { json: e, code })
    );
  }

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

      // See sessionExpiredError(): spa-js short-circuits the ceiling with an
      // undefined resolution rather than a thrown error.
      if (!tokenResponse) {
        throw this.sessionExpiredError();
      }

      const claims = await this.client.getIdTokenClaims();
      if (!claims || !claims.exp) {
        throw new AuthError(
          'ID_TOKEN_CLAIM_VALIDATION_FAILED',
          'ID token or expiration claim is missing.'
        );
      }

      // Decode the IPSIE `session_expiry` claim (absolute Unix seconds). Reject values
      // outside (0, 10_000_000_000) to match native: the upper bound discards
      // millisecond-valued timestamps that would otherwise disable the ceiling.
      const rawSessionExpiry = claims.session_expiry;
      const sessionExpiresAt =
        typeof rawSessionExpiry === 'number' &&
        rawSessionExpiry > 0 &&
        rawSessionExpiry < 10_000_000_000
          ? Math.floor(rawSessionExpiry)
          : undefined;

      return new CredentialsModel({
        idToken: tokenResponse.id_token,
        accessToken: tokenResponse.access_token,
        tokenType: tokenResponse.token_type ?? 'Bearer',
        expiresAt: claims.exp,
        scope: tokenResponse.scope,
        sessionExpiresAt,
      });
    } catch (e: any) {
      throw this.toCredentialsManagerError(e, 'GetCredentialsFailed');
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

      // See sessionExpiredError(): spa-js short-circuits the ceiling with an
      // undefined resolution rather than a thrown error.
      if (!tokenResponse) {
        throw this.sessionExpiredError();
      }

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
      throw this.toCredentialsManagerError(e, 'GetApiCredentialsFailed');
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

  async clearApiCredentials(audience: string, scope?: string): Promise<void> {
    const scopeInfo = scope ? ` and scope ${scope}` : '';
    console.warn(
      `'clearApiCredentials' for audience ${audience}${scopeInfo} is a no-op on the web. @auth0/auth0-spa-js handles credential storage automatically.`
    );
    return Promise.resolve();
  }
}
