import type { IWebAuthProvider } from '../../../core/interfaces';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
} from '../../../types';
import { AuthError, WebAuthError } from '../../../core/models';
import { finalizeScope } from '../../../core/utils';
import type { Auth0Client, PopupCancelledError } from '@auth0/auth0-spa-js';

export class WebWebAuthProvider implements IWebAuthProvider {
  constructor(private client: Auth0Client) {}

  async authorize(
    parameters: WebAuthorizeParameters = {}
  ): Promise<Credentials> {
    const finalScope = finalizeScope(parameters.scope);
    const { redirectUrl, ...restParams } = parameters;
    try {
      await this.client.loginWithRedirect({
        authorizationParams: {
          ...restParams,
          scope: finalScope,
          redirect_uri: redirectUrl,
        },
      });

      // NOTE: loginWithRedirect does not resolve with a value, as it triggers a full
      // page navigation. The user session is recovered by `handleRedirectCallback`
      // when the app reloads. We return a Promise that never resolves to match the
      // interface, but in practice, the application context will be lost.
      return new Promise(() => {});
    } catch (e: any) {
      const code = e.error ?? 'AuthorizeFailed';
      throw new WebAuthError(
        new AuthError(code, e.error_description ?? e.message, { json: e, code })
      );
    }
  }

  async handleRedirectCallback(url?: string): Promise<void> {
    try {
      await this.client.handleRedirectCallback(url);
    } catch (e: any) {
      const code = e.error ?? 'RedirectCallbackError';
      throw new WebAuthError(
        new AuthError(code, e.error_description ?? e.message, { json: e, code })
      );
    }
  }

  async clearSession(parameters: ClearSessionParameters = {}): Promise<void> {
    try {
      await this.client.logout({
        logoutParams: {
          federated: parameters.federated,
          returnTo: parameters.returnToUrl,
        },
      });
    } catch (e: any) {
      const code = e.error ?? 'LogoutFailed';
      if ((e as PopupCancelledError).error === 'cancelled') {
        throw new WebAuthError(
          new AuthError(
            'cancelled',
            e.error_description ??
              e.message ??
              'User cancelled the logout popup.',
            {
              json: e,
              code,
            }
          )
        );
      }
      throw new WebAuthError(
        new AuthError(code, e.error_description ?? e.message, { json: e, code })
      );
    }
  }

  async cancelWebAuth(): Promise<void> {
    // Web-based flows cannot be programmatically cancelled. This is a no-op.
    return Promise.resolve();
  }
}
