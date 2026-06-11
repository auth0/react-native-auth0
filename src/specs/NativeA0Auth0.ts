import { TurboModuleRegistry, type TurboModule } from 'react-native';
import type { ApiCredentials, Credentials } from '../types';

type Int32 = number;
export interface Spec extends TurboModule {
  /**
   * Get the bundle identifier
   */
  getBundleIdentifier(): Promise<string>;

  /**
   * Check if the Auth0 instance is valid with the given configuration
   */
  hasValidAuth0InstanceWithConfiguration(
    clientId: string,
    domain: string
  ): Promise<boolean>;

  /**
   * Initialize Auth0 with the given configuration
   */
  initializeAuth0WithConfiguration(
    clientId: string,
    domain: string,
    localAuthenticationOptions:
      | { [key: string]: string | Int32 | boolean }
      | undefined,
    useDPoP: boolean | undefined,
    maxRetries: Int32
  ): Promise<void>;

  /**
   * Save credentials
   */
  saveCredentials(credentials: {
    [key: string]: string | Int32;
  }): Promise<void>;

  /**
   * Get credentials with the given scope
   */
  getCredentials(
    scope: string | undefined,
    minTTL: Int32,
    parameters: Object,
    forceRefresh: boolean
  ): Promise<Credentials>;

  /**
   * Check if there are valid credentials
   */
  hasValidCredentials(minTTL: Int32): Promise<boolean>;

  /**
   * Clear credentials
   */
  clearCredentials(): Promise<void>;

  /**
   * Get API credentials for a specific audience
   */
  getApiCredentials(
    audience: string,
    scope: string | undefined,
    minTTL: Int32,
    parameters: Object
  ): Promise<ApiCredentials>;

  /**
   * Clear API credentials for a specific audience. Optionally filter by scope.
   * @param audience The audience to clear credentials for.
   * @param scope The scope to clear credentials for. If not provided, clears all credentials for the audience.
   */
  clearApiCredentials(
    audience: string,
    scope: string | undefined
  ): Promise<void>;

  /**
   * Start web authentication
   */
  webAuth(
    scheme: string,
    redirectUri: string,
    state: string | undefined,
    nonce: string | undefined,
    audience: string | undefined,
    scope: string | undefined,
    connection: string | undefined,
    maxAge: Int32 | undefined,
    organization: string | undefined,
    invitationUrl: string | undefined,
    leeway: Int32 | undefined,
    ephemeralSession: boolean | undefined,
    safariViewControllerPresentationStyle: Int32 | undefined,
    additionalParameters: { [key: string]: string } | undefined,
    allowedBrowserPackages: string[] | undefined
  ): Promise<Credentials>;

  /**
   * Logout from web authentication
   */
  webAuthLogout(
    scheme: string,
    federated: boolean,
    redirectUri: string,
    allowedBrowserPackages: string[] | undefined
  ): Promise<void>;

  /**
   * Resume web authentication
   */
  resumeWebAuth(url: string): Promise<void>;

  /**
   * Cancel web authentication
   */
  cancelWebAuth(): Promise<void>;

  /**
   * Drain a web authentication result recovered after Android process death.
   * Resolves the recovered credentials, or null when there is nothing to recover.
   */
  resumeSession(): Promise<Credentials | null>;

  /**
   * Get the DPoP headers for a request
   */
  getDPoPHeaders(
    url: string,
    method: string,
    accessToken: string,
    tokenType: string,
    nonce?: string
  ): Promise<{ [key: string]: string }>;

  /**
   * Clear the DPoP key
   * This method clears the DPoP key from the native module.
   */
  clearDPoPKey(): Promise<void>;

  /**
   * Get session transfer credentials for Native to Web SSO
   */
  getSSOCredentials(
    parameters: Object,
    headers: Object
  ): Promise<{
    sessionTransferToken: string;
    tokenType: string;
    expiresIn: Int32;
    idToken?: string;
    refreshToken?: string;
  }>;

  /**
   * Perform Custom Token Exchange (RFC 8693)
   * Exchanges an external token for Auth0 tokens.
   */
  customTokenExchange(
    subjectToken: string,
    subjectTokenType: string,
    audience: string | undefined,
    scope: string | undefined,
    organization: string | undefined
  ): Promise<Credentials>;

  /**
   * Request a passkey signup challenge from Auth0.
   */
  passkeySignupChallenge(
    email: string | undefined,
    phoneNumber: string | undefined,
    username: string | undefined,
    name: string | undefined,
    givenName: string | undefined,
    familyName: string | undefined,
    nickname: string | undefined,
    picture: string | undefined,
    userMetadata: { [key: string]: string } | undefined,
    realm: string | undefined,
    organization: string | undefined
  ): Promise<{ authSession: string; authParamsPublicKey: Object }>;

  /**
   * Request a passkey login challenge from Auth0.
   */
  passkeyLoginChallenge(
    realm: string | undefined,
    organization: string | undefined
  ): Promise<{ authSession: string; authParamsPublicKey: Object }>;

  /**
   * Exchange a passkey credential response for Auth0 tokens.
   */
  getTokenByPasskey(
    authSession: string,
    authResponse: string,
    realm: string | undefined,
    audience: string | undefined,
    scope: string | undefined,
    organization: string | undefined
  ): Promise<Credentials>;

  /**
   * Request a passkey enrollment challenge from the My Account API.
   */
  passkeyEnrollmentChallenge(
    accessToken: string,
    userIdentity: string | undefined,
    connection: string | undefined
  ): Promise<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Object;
  }>;

  /**
   * Verify a passkey enrollment with the My Account API.
   */
  enrollPasskey(
    accessToken: string,
    authenticationMethodId: string,
    authSession: string,
    authResponse: string,
    authParamsPublicKey: string
  ): Promise<Object>;

  /**
   * Get all authentication methods for the authenticated user.
   */
  getAuthenticationMethods(
    accessToken: string,
    type: string | undefined
  ): Promise<Object[]>;

  /**
   * Get a single authentication method by ID.
   */
  getAuthenticationMethodById(accessToken: string, id: string): Promise<Object>;

  /**
   * Update an authentication method by ID.
   */
  updateAuthenticationMethodById(
    accessToken: string,
    id: string,
    name: string | null | undefined,
    preferredAuthenticationMethod: string | null | undefined
  ): Promise<Object>;

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
    preferredAuthenticationMethod: string | undefined
  ): Promise<Object>;

  /**
   * Enroll an email address as an authentication method.
   */
  enrollEmail(accessToken: string, emailAddress: string): Promise<Object>;

  /**
   * Enroll TOTP as an authentication method.
   */
  enrollTOTP(accessToken: string): Promise<Object>;

  /**
   * Enroll push notification as an authentication method.
   */
  enrollPushNotification(accessToken: string): Promise<Object>;

  /**
   * Enroll a recovery code as an authentication method.
   */
  enrollRecoveryCode(accessToken: string): Promise<Object>;

  /**
   * Confirm an enrollment that requires an OTP code.
   */
  confirmEnrollmentWithOtp(
    accessToken: string,
    id: string,
    authSession: string,
    otpCode: string
  ): Promise<Object>;

  /**
   * Confirm an enrollment without an OTP code (recovery code, push notification).
   */
  confirmEnrollment(
    accessToken: string,
    id: string,
    authSession: string
  ): Promise<Object>;

  /**
   * Get available authentication factors.
   */
  getFactors(accessToken: string): Promise<Object[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('A0Auth0');

export interface LocalAuthenticationOptions {
  /**
   * The title of the authentication prompt. **Applicable for both Android and iOS**.
   */
  title: string;
  /**
   * The subtitle of the authentication prompt. **Applicable for Android only.**
   */
  subtitle: string | undefined;
  /**
   * The description of the authentication prompt. **Applicable for Android only.**
   */
  description: string | undefined;
  /**
   * The cancel button title of the authentication prompt. **Applicable for both Android and iOS.**
   */
  cancelTitle: string | undefined;
  /**
   * The evaluation policy to use when prompting the user for authentication. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics. **Applicable for iOS only.**
   */
  evaluationPolicy: Int32 | undefined;
  /**
   * The fallback button title of the authentication prompt. **Applicable for iOS only.**
   */
  fallbackTitle: string | undefined;
  /**
   * The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**
   */
  authenticationLevel: Int32 | undefined;
  /**
   * Should the user be given the option to authenticate with their device PIN, pattern, or password instead of a biometric. **Applicable for Android only.**
   */
  deviceCredentialFallback: boolean | undefined;
  /**
   * Controls when biometric authentication prompts are shown. **Applicable for both Android and iOS.**
   */
  biometricPolicy: string | undefined;
  /**
   * Timeout in seconds for session and appLifecycle policies. Defaults to 3600 seconds (1 hour). **Applicable for both Android and iOS.**
   */
  biometricTimeout: Int32 | undefined;
}
