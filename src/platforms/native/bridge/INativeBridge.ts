import type {
  Credentials,
  ApiCredentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  DPoPHeadersParams,
  SessionTransferCredentials,
} from '../../../types';
import type {
  LocalAuthenticationOptions,
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
} from '../../../types/platform-specific';

/**
 * The contract defining all methods that the native-side module must implement.
 * This interface is the single source of truth for communication between the
 * JavaScript and the native layers (iOS/Android).
 */
export interface INativeBridge {
  /**
   * Checks if the native SDK has been initialized with the required credentials.
   * This should be called before any other method.
   *
   * @returns A promise that resolves with true if initialized, false otherwise.
   */
  hasValidInstance(clientId: string, domain: string): Promise<boolean>;
  /**
   * Initializes the native SDK with the required credentials.
   * This should be called before any other method.
   *
   * @param clientId The Auth0 application client ID.
   * @param domain The Auth0 application domain.
   * @param localAuthenticationOptions Options for local authentication.
   * @param useDPoP Whether to enable DPoP (Demonstrating Proof-of-Possession) for token requests.
   */
  initialize(
    clientId: string,
    domain: string,
    localAuthenticationOptions?: LocalAuthenticationOptions,
    useDPoP?: boolean
  ): Promise<void>;

  /**
   * Retrieves the bundle identifier for the native application.
   * @returns A promise that resolves with the bundle identifier as a string.
   */
  getBundleIdentifier(): Promise<string>;

  /**
   * Triggers the native web-based authentication flow.
   *
   * @param parameters The parameters for the `/authorize` endpoint.
   * @param options The native-specific options for the web-based flow.
   * @returns A promise that resolves with the user's credentials.
   */
  authorize(
    parameters: WebAuthorizeParameters,
    options: NativeAuthorizeOptions
  ): Promise<Credentials>;

  /**
   * Triggers the native web-based logout flow.
   *
   * @param parameters The parameters for the `/v2/logout` endpoint.
   * @param options The native-specific options for the logout flow.
   * @returns A promise that resolves when the logout is complete.
   */
  clearSession(
    parameters: ClearSessionParameters,
    options: NativeClearSessionOptions
  ): Promise<void>;

  /**
   * Cancels an ongoing web authentication flow.
   * @platform ios
   */
  cancelWebAuth(): Promise<void>;

  /**
   * Saves credentials to the native secure storage (Keychain/EncryptedSharedPreferences).
   * @param credentials The credentials to save.
   */
  saveCredentials(credentials: Credentials): Promise<void>;

  /**
   * Retrieves credentials from secure storage. This method performs a token refresh
   * if the access token is expired and a refresh token is available.
   *
   * @param scope The scopes to request during a token refresh.
   * @param minTtl The minimum time-to-live (in seconds) for the access token.
   * @param forceRefresh If true, forces a token refresh.
   * @returns A promise that resolves with the credentials.
   */
  getCredentials(
    scope?: string,
    minTtl?: number,
    parameters?: object,
    forceRefresh?: boolean
  ): Promise<Credentials>;

  /**
   * Checks if valid credentials exist in secure storage.
   *
   * @param minTtl The minimum time-to-live (in seconds) for the access token.
   * @returns A promise that resolves with true if valid credentials exist.
   */
  hasValidCredentials(minTtl?: number): Promise<boolean>;

  /**
   * Retrieves API-specific credentials from secure storage.
   *
   * @param audience The audience of the API.
   * @param scope The scopes to request during a token refresh.
   * @param minTtl The minimum time-to-live (in seconds) for the access token.
   * @param parameters Additional parameters for the refresh request.
   * @returns A promise that resolves with the API credentials.
   */
  getApiCredentials(
    audience: string,
    scope?: string,
    minTtl?: number,
    parameters?: object
  ): Promise<ApiCredentials>;

  /**
   * Clears API credentials for a specific audience from secure storage.
   * Optionally filter by scope to clear only specific scope-based credentials.
   *
   * @param audience The audience of the API.
   * @param scope Optional scope to clear. If not provided, clears all credentials for the audience.
   */
  clearApiCredentials(audience: string, scope?: string): Promise<void>;

  /**
   * Clears credentials from secure storage.
   * Optionally filter by audience and scope to clear specific credentials.
   *
   * @param audience Optional audience to clear credentials for. If not provided, clears all credentials.
   * @param scope Optional scope to clear. Only applicable when audience is provided.
   */
  clearCredentials(audience?: string, scope?: string): Promise<void>;

  /**
   * Resumes the web authentication flow with the provided URL.
   * @param url The URL to resume the authentication flow.
   * @returns A promise that resolves when the flow has been resumed.
   */
  resumeWebAuth(url: string): Promise<void>;

  /**
   * Generates DPoP headers for making authenticated requests to custom APIs.
   * This method creates the necessary HTTP headers (Authorization and DPoP) to
   * securely bind the access token to a specific API request.
   *
   * @param params Parameters including the URL, HTTP method, access token, and token type.
   * @returns A promise that resolves to an object containing the required headers.
   */
  getDPoPHeaders(params: DPoPHeadersParams): Promise<Record<string, string>>;

  /**
   * Clears the DPoP key from secure storage.
   * This should be called during logout to ensure the key is removed.
   */
  clearDPoPKey(): Promise<void>;

  /**
   * Obtains session transfer credentials for performing Native to Web SSO.
   *
   * @remarks
   * This method exchanges the stored refresh token for a session transfer token
   * that can be used to authenticate in web contexts without requiring the user
   * to log in again. The session transfer token is short-lived and expires after
   * a few minutes.
   *
   * If Refresh Token Rotation is enabled, this method will also update the stored
   * credentials with new tokens (ID token and refresh token) returned from the
   * token exchange.
   *
   * @param parameters Optional additional parameters to pass to the token exchange.
   * @param headers Optional additional headers to include in the token exchange request.
   * @returns A promise that resolves with the session transfer credentials.
   *
   * @see https://auth0.com/docs/authenticate/single-sign-on/native-to-web/configure-implement-native-to-web
   */
  getSSOCredentials(
    parameters?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<SessionTransferCredentials>;
}
