import type {
  Credentials,
  ApiCredentials,
  WebAuthorizeParameters,
  ClearSessionParameters,
  DPoPHeadersParams,
  SessionTransferCredentials,
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
  PasskeyChallengeResponse,
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
   * @param maxRetries The maximum number of retry attempts for transient errors during credential renewal. **iOS only** - ignored on Android. Defaults to 0.
   * @param credentialsManagerStorageKey Namespaces the credentials store. **Android only** SharedPreferences file name. **iOS only** Keychain service name. Defaults to the shared store when omitted.
   */
  initialize(
    clientId: string,
    domain: string,
    localAuthenticationOptions?: LocalAuthenticationOptions,
    useDPoP?: boolean,
    maxRetries?: number,
    credentialsManagerStorageKey?: string
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
   * Recovers a login result that completed after Android process death.
   * Resolves with the recovered credentials, or `null` if there was nothing to recover.
   * @platform android
   */
  resumeSession(): Promise<Credentials | null>;

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
   * @param parameters Additional parameters to send during the token refresh request.
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
   * @param scope Optional scope to clear. If credentials were fetched with a scope, it is recommended to pass the same scope when clearing them.
   */
  clearApiCredentials(audience: string, scope?: string): Promise<void>;

  /**
   * Clears credentials from secure storage.
   */
  clearCredentials(): Promise<void>;

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

  /**
   * Performs a Custom Token Exchange, exchanging an external provider's token
   * for Auth0 credentials using RFC 8693 Token Exchange.
   *
   * @param subjectToken The external token to exchange.
   * @param subjectTokenType The type identifier of the external token (URI).
   * @param audience Optional target API identifier.
   * @param scope Optional space-separated scopes.
   * @param organization Optional organization ID or name.
   * @returns A promise that resolves with Auth0 credentials.
   */
  customTokenExchange(
    subjectToken: string,
    subjectTokenType: string,
    audience?: string,
    scope?: string,
    organization?: string
  ): Promise<Credentials>;

  /**
   * Lists enrolled MFA authenticators.
   *
   * @param mfaToken The MFA token from an MFA_REQUIRED error.
   * @param factorsAllowed Optional list of factor types to filter by.
   * @returns A promise that resolves with the list of enrolled authenticators.
   */
  getMfaAuthenticators(
    mfaToken: string,
    factorsAllowed?: string[]
  ): Promise<MfaAuthenticator[]>;

  /**
   * Enrolls a new MFA factor.
   *
   * @param mfaToken The MFA token from an MFA_REQUIRED error.
   * @param type The factor type: 'phone', 'email', 'otp', or 'push'.
   * @param value The phone number or email (required for 'phone' and 'email').
   * @returns A promise that resolves with the enrollment challenge details.
   */
  mfaEnroll(
    mfaToken: string,
    type: string,
    value?: string
  ): Promise<MfaEnrollmentChallenge>;

  /**
   * Requests an MFA challenge for an enrolled authenticator.
   *
   * @param mfaToken The MFA token from an MFA_REQUIRED error.
   * @param authenticatorId The ID of the enrolled authenticator.
   * @returns A promise that resolves with the challenge details.
   */
  mfaChallenge(
    mfaToken: string,
    authenticatorId: string
  ): Promise<MfaChallengeResult>;

  /**
   * Verifies an MFA code and returns credentials on success.
   *
   * @param mfaToken The MFA token.
   * @param type The verification type: 'otp', 'oob', or 'recoveryCode'.
   * @param code The OTP code, OOB code, or recovery code.
   * @param bindingCode Optional binding code for OOB verification.
   * @param scope Optional space-separated OAuth 2.0 scopes for the returned credentials.
   * @param audience Optional API audience for the returned credentials.
   * @returns A promise that resolves with credentials on successful verification.
   */
  mfaVerify(
    mfaToken: string,
    type: string,
    code: string,
    bindingCode?: string,
    scope?: string,
    audience?: string
  ): Promise<Credentials>;

  /**
   * Requests a passkey signup challenge from Auth0.
   *
   * Returns WebAuthn creation options to be used with the platform's credential manager.
   *
   * @param email The user's email address.
   * @param phoneNumber The user's phone number.
   * @param username The user's username.
   * @param name The user's display name.
   * @param givenName The user's first name.
   * @param familyName The user's last name.
   * @param nickname The user's preferred nickname.
   * @param picture URL pointing to the user's profile picture.
   * @param userMetadata Additional user metadata as key-value pairs.
   * @param realm The database connection name.
   * @param organization Optional organization ID or name.
   * @returns A promise that resolves with the challenge response.
   */
  passkeySignupChallenge(
    email?: string,
    phoneNumber?: string,
    username?: string,
    name?: string,
    givenName?: string,
    familyName?: string,
    nickname?: string,
    picture?: string,
    userMetadata?: Record<string, string>,
    realm?: string,
    organization?: string
  ): Promise<PasskeyChallengeResponse>;

  /**
   * Requests a passkey login challenge from Auth0.
   *
   * Returns WebAuthn request options to be used with the platform's credential manager.
   *
   * @param realm The database connection name.
   * @param organization Optional organization ID or name.
   * @returns A promise that resolves with the challenge response.
   */
  passkeyLoginChallenge(
    realm?: string,
    organization?: string
  ): Promise<PasskeyChallengeResponse>;

  /**
   * Exchanges a passkey credential response for Auth0 tokens.
   *
   * @param authSession The auth session from the challenge response.
   * @param authResponse JSON string of the PublicKeyCredential response.
   * @param realm The database connection name.
   * @param audience Optional target API identifier.
   * @param scope Optional space-separated scopes.
   * @param organization Optional organization ID or name.
   * @returns A promise that resolves with Auth0 credentials.
   */
  getTokenByPasskey(
    authSession: string,
    authResponse: string,
    realm?: string,
    audience?: string,
    scope?: string,
    organization?: string
  ): Promise<Credentials>;

  /**
   * Issue a passwordless OTP challenge to an email address for a database connection.
   *
   * @param email The email address to send the one-time code to.
   * @param connection The database connection name; must have `email_otp` enabled.
   * @param allowSignup Whether to allow sign-up if the user does not yet exist.
   * @returns A promise that resolves with the opaque auth session.
   */
  passwordlessChallengeWithEmail(
    email: string,
    connection: string,
    allowSignup: boolean
  ): Promise<{ authSession: string }>;

  /**
   * Issue a passwordless OTP challenge to a phone number for a database connection.
   *
   * @param phoneNumber The E.164 phone number to send the one-time code to.
   * @param connection The database connection name; must have `phone_otp` enabled.
   * @param deliveryMethod How to deliver the code: `'text'` or `'voice'`.
   * @param allowSignup Whether to allow sign-up if the user does not yet exist.
   * @returns A promise that resolves with the opaque auth session.
   */
  passwordlessChallengeWithPhoneNumber(
    phoneNumber: string,
    connection: string,
    deliveryMethod: string,
    allowSignup: boolean
  ): Promise<{ authSession: string }>;

  /**
   * Complete a passwordless OTP flow by verifying the code and obtaining credentials.
   *
   * @param authSession The opaque auth session from a prior challenge.
   * @param otp The one-time code the user received.
   * @param audience Optional target API identifier.
   * @param scope Optional space-separated scopes.
   * @returns A promise that resolves with Auth0 credentials.
   */
  passwordlessLoginWithOTP(
    authSession: string,
    otp: string,
    audience?: string,
    scope?: string
  ): Promise<Credentials>;

  /**
   * Request a passkey enrollment challenge from the My Account API.
   *
   * @param accessToken Access token for My Account API.
   * @param userIdentity Optional user identity ID (for linked accounts).
   * @param connection Optional database connection name.
   * @returns A promise that resolves with the enrollment challenge response.
   */
  passkeyEnrollmentChallenge(
    accessToken: string,
    userIdentity?: string,
    connection?: string
  ): Promise<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Record<string, any>;
  }>;

  /**
   * Verify a passkey enrollment with the My Account API.
   *
   * @param accessToken Access token for My Account API.
   * @param authenticationMethodId The authentication method ID from the challenge.
   * @param authSession The auth session from the challenge.
   * @param authResponse JSON string of the PublicKeyCredential response.
   * @returns A promise that resolves with the enrolled authentication method.
   */
  enrollPasskey(
    accessToken: string,
    authenticationMethodId: string,
    authSession: string,
    authResponse: string,
    authParamsPublicKey: string
  ): Promise<Record<string, any>>;

  /**
   * Get all authentication methods for the authenticated user.
   */
  getAuthenticationMethods(
    accessToken: string,
    type?: string
  ): Promise<Record<string, any>[]>;

  /**
   * Get a single authentication method by ID.
   */
  getAuthenticationMethodById(
    accessToken: string,
    id: string
  ): Promise<Record<string, any>>;

  /**
   * Update an authentication method by ID.
   */
  updateAuthenticationMethodById(
    accessToken: string,
    id: string,
    name?: string | null,
    preferredAuthenticationMethod?: string | null
  ): Promise<Record<string, any>>;

  /**
   * Delete an authentication method by ID.
   */
  deleteAuthenticationMethodById(
    accessToken: string,
    id: string
  ): Promise<void>;

  /**
   * Enroll a phone number as an authentication method.
   */
  enrollPhone(
    accessToken: string,
    phoneNumber: string,
    preferredAuthenticationMethod?: string
  ): Promise<Record<string, any>>;

  /**
   * Enroll an email address as an authentication method.
   */
  enrollEmail(
    accessToken: string,
    emailAddress: string
  ): Promise<Record<string, any>>;

  /**
   * Enroll TOTP as an authentication method.
   */
  enrollTOTP(accessToken: string): Promise<Record<string, any>>;

  /**
   * Enroll push notification as an authentication method.
   */
  enrollPushNotification(accessToken: string): Promise<Record<string, any>>;

  /**
   * Enroll a recovery code as an authentication method.
   */
  enrollRecoveryCode(accessToken: string): Promise<Record<string, any>>;

  /**
   * Confirm an enrollment that requires an OTP code (phone, email, TOTP).
   */
  confirmEnrollmentWithOtp(
    accessToken: string,
    id: string,
    authSession: string,
    otpCode: string
  ): Promise<Record<string, any>>;

  /**
   * Confirm an enrollment that does not require an OTP code (recovery code, push notification).
   */
  confirmEnrollment(
    accessToken: string,
    id: string,
    authSession: string
  ): Promise<Record<string, any>>;

  /**
   * Get available authentication factors.
   */
  getFactors(accessToken: string): Promise<Record<string, any>[]>;
}
