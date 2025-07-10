import type { Auth0Client } from '@auth0/auth0-spa-js';
import type { IWebAuthProvider } from '../../../core/interfaces';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
} from '../../../types';
import type {
  WebAuthorizeOptions,
  WebClearSessionOptions,
} from '../../../types/platform-specific';
import {
  AuthError,
  Credentials as CredentialsModel,
} from '../../../core/models';
import { finalizeScope } from '../../../core/utils';

/**
 * A web platform-specific implementation of the IWebAuthProvider.
 * This class translates web authentication calls into calls to the `auth0-spa-js` client.
 */
export class WebWebAuthProvider implements IWebAuthProvider {
  constructor(private client: Auth0Client) {}

  async authorize(
    parameters: WebAuthorizeParameters,
    _options?: WebAuthorizeOptions // options are often included in parameters for SPA-JS
  ): Promise<Credentials> {
    try {
      const finalScope = finalizeScope(parameters.scope);
      // loginWithRedirect does not resolve with credentials; it redirects.
      // The credentials will be available after the user is redirected back
      // and handleRedirectCallback is called. The Auth0Provider hook will
      // manage this state change. For API consistency, we can check if
      // credentials already exist after a potential redirect.
      await this.client.loginWithRedirect({
        authorizationParams: {
          ...parameters,
          scope: finalScope,
          redirect_uri: parameters.redirectUrl,
        },
      });

      // After a redirect, the app will re-initialize. We can attempt to
      // get the token silently upon return. If it succeeds, we have our credentials.
      const token = await this.client.getTokenSilently();
      const user = await this.client.getUser();

      if (!token || !user || !user.sub) {
        throw new AuthError(
          'LoginIncomplete',
          'Login flow was initiated, but no user session was found after redirect.'
        );
      }

      const claims = await this.client.getIdTokenClaims();

      return new CredentialsModel({
        idToken: claims?.__raw ?? '',
        accessToken: token,
        tokenType: 'Bearer',
        expiresAt: claims?.exp ?? 0,
        scope: await this.client
          .getTokenSilently({ detailedResponse: true })
          .then((r) => r.scope),
      });
    } catch (e: any) {
      throw new AuthError(
        e.error ?? 'LoginFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async clearSession(
    parameters: ClearSessionParameters,
    _options?: WebClearSessionOptions
  ): Promise<void> {
    try {
      await this.client.logout({
        logoutParams: {
          federated: parameters.federated,
          returnTo: parameters.returnToUrl,
        },
      });
    } catch (e: any) {
      throw new AuthError(
        e.error ?? 'LogoutFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async cancelWebAuth(): Promise<void> {
    // Web-based flows cannot be programmatically cancelled in the same way
    // as the native ASWebAuthenticationSession. This is a no-op for the web.
    return Promise.resolve();
  }
}
