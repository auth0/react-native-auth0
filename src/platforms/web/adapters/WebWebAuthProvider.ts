import type { IWebAuthProvider } from '../../../core/interfaces';
import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  User,
} from '../../../types';
import { AuthError, WebAuthError } from '../../../core/models';
import { finalizeScope } from '../../../core/utils';
import type {
  Auth0Client,
  PopupCancelledError,
  User as SpaJSUser,
} from '@auth0/auth0-spa-js';

export class WebWebAuthProvider implements IWebAuthProvider {
  constructor(private client: Auth0Client) {}

  // private method to convert a SpaJSUser to a User
  private convertUser(user: SpaJSUser | undefined): User | null {
    if (!user || !user.sub) return null;
    return {
      sub: user.sub,
      name: user.name,
      givenName: user.given_name,
      familyName: user.family_name,
      middleName: user.middle_name,
      nickname: user.nickname,
      preferredUsername: user.preferred_username,
      profile: user.profile,
      picture: user.picture,
      website: user.website,
      email: user.email,
      emailVerified: user.email_verified,
      gender: user.gender,
      birthdate: user.birthdate,
      zoneinfo: user.zoneinfo,
      locale: user.locale,
      phoneNumber: user.phone_number,
      phoneNumberVerified: user.phone_number_verified,
      address: user.address,
      updatedAt: user.updated_at,
    };
  }

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

  async checkWebSession(): Promise<User | null> {
    await this.client.checkSession();
    const spaUser: SpaJSUser | undefined = await this.client.getUser();
    // convert this to a User
    const user = this.convertUser(spaUser);
    return user;
  }

  async cancelWebAuth(): Promise<void> {
    // Web-based flows cannot be programmatically cancelled. This is a no-op.
    return Promise.resolve();
  }
}
