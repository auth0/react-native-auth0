import type { IWebAuthProvider } from '../../../core/interfaces';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
} from '../../../types';
import { AuthError } from '../../../core/models';
import { finalizeScope } from '../../../core/utils';
import type { Auth0Client } from '@auth0/auth0-spa-js';

export class WebWebAuthProvider implements IWebAuthProvider {
  constructor(private client: Auth0Client) {}

  async authorize(
    parameters: WebAuthorizeParameters = {}
  ): Promise<Credentials> {
    const finalScope = finalizeScope(parameters.scope);
    const { redirectUrl, ...restParams } = parameters;
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
  }

  async handleRedirectCallback(url?: string): Promise<RedirectLoginResult> {
    try {
      return await this.client.handleRedirectCallback(url);
    } catch (e: any) {
      throw new AuthError(
        e.error ?? 'RedirectCallbackError',
        e.error_description ?? e.message,
        { json: e }
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
      throw new AuthError(
        e.error ?? 'LogoutFailed',
        e.error_description ?? e.message,
        { json: e }
      );
    }
  }

  async cancelWebAuth(): Promise<void> {
    // Web-based flows cannot be programmatically cancelled. This is a no-op.
    return Promise.resolve();
  }
}
