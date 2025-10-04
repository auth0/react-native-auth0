import type {
  Credentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  User,
} from '../../types';

import type {
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
  WebAuthorizeOptions,
  WebClearSessionOptions,
} from '../../types/platform-specific';

/**
 * Defines the contract for a provider that handles web-based authentication flows,
 * such as redirecting to the Auth0 Universal Login page.
 */
export interface IWebAuthProvider {
  /**
   * Initiates the web-based authentication flow.
   *
   * @remarks
   * This method will redirect the user to a browser to log in. The `options` parameter
   * is generic to allow platform-specific configurations.
   *
   * @param parameters The parameters to send to the `/authorize` endpoint.
   * @param options Platform-specific options to customize the authentication experience.
   * @returns A promise that resolves with the user's credentials upon successful authentication.
   */
  authorize(
    parameters: WebAuthorizeParameters,
    options?: NativeAuthorizeOptions | WebAuthorizeOptions
  ): Promise<Credentials>;

  /**
   * Handles the redirect callback after authentication.
   *
   * @remarks
   * **Platform specific:** This method is only available in the context of a web application.
   * @returns A promise that resolves when the redirect callback has been processed.
   */
  handleRedirectCallback(): Promise<void>;

  /**
   * Clears the user's session, including any cookies stored in the browser.
   *
   * @param parameters The parameters to send to the `/v2/logout` endpoint.
   * @param options Platform-specific options to customize the logout experience.
   * @returns A promise that resolves when the session has been cleared.
   */
  clearSession(
    parameters?: ClearSessionParameters,
    options?: NativeClearSessionOptions | WebClearSessionOptions
  ): Promise<void>;

  /**
   * Retrives the authenticated user's profile information.
   *
   * @remarks
   * This method fetches the user's profile from the Auth0 session if available.
   *
   * @returns A promise that resolves with the user's profile information, or null if not authenticated.
   */
  getWebUser(): Promise<User | null>;

  /**
   * Checks the user's session and updates the local state if the session is still valid.
   */
  checkWebSession(): Promise<void>;

  /**
   * Cancels an ongoing web authentication transaction.
   *
   * @remarks
   * **Platform specific:** This is primarily used on iOS to handle scenarios where the user manually
   * dismisses the login modal. On other platforms, it may be a no-op.
   *
   * @returns A promise that resolves when the operation is complete.
   */
  cancelWebAuth(): Promise<void>;
}
