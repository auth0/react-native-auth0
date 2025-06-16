import { TurboModuleRegistry, type TurboModule } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

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
    localAuthenticationOptions?: { [key: string]: string | Int32 | boolean }
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
   * Start web authentication
   */
  webAuth(
    scheme: string,
    redirectUri: string,
    state?: string,
    nonce?: string,
    audience?: string,
    scope?: string,
    connection?: string,
    maxAge?: Int32,
    organization?: string,
    invitationUrl?: string,
    leeway?: Int32,
    ephemeralSession?: boolean,
    safariViewControllerPresentationStyle?: Int32,
    additionalParameters?: { [key: string]: string }
  ): Promise<CredentialsResponse>;

  /**
   * Logout from web authentication
   */
  webAuthLogout(
    scheme: string,
    federated: boolean,
    redirectUri: string
  ): Promise<void>;

  /**
   * Resume web authentication
   */
  resumeWebAuth(url: string): Promise<void>;

  /**
   * Cancel web authentication
   */
  cancelWebAuth(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('A0Auth0');

interface CredentialsResponse {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: Int32;
  refresh_token?: string;
  scope?: string;
  [key: string]: any;
}

export interface LocalAuthenticationOptions {
  /**
   * The title of the authentication prompt. **Applicable for both Android and iOS**.
   */
  title: string;
  /**
   * The subtitle of the authentication prompt. **Applicable for Android only.**
   */
  subtitle?: string;
  /**
   * The description of the authentication prompt. **Applicable for Android only.**
   */
  description?: string;
  /**
   * The cancel button title of the authentication prompt. **Applicable for both Android and iOS.**
   */
  cancelTitle?: string;
  /**
   * The evaluation policy to use when prompting the user for authentication. Defaults to LocalAuthenticationStrategy.deviceOwnerWithBiometrics. **Applicable for iOS only.**
   */
  evaluationPolicy?: Int32;
  /**
   * The fallback button title of the authentication prompt. **Applicable for iOS only.**
   */
  fallbackTitle?: string;
  /**
   * The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**
   */
  authenticationLevel?: Int32;
  /**
   * Should the user be given the option to authenticate with their device PIN, pattern, or password instead of a biometric. **Applicable for Android only.**
   */
  deviceCredentialFallback?: boolean;
}

interface Credentials {
  /**
   * A token in JWT format that has user claims
   */
  idToken: string;
  /**
   * The token used to make API calls
   */
  accessToken: string;
  /**
   * The type of the token, e.g.: Bearer
   */
  tokenType: string;
  /**
   * Used to denote when the token will expire, as a UNIX timestamp
   */
  expiresAt: Int32;
  /**
   * The token used to refresh the access token
   */
  refreshToken?: string;
  /**
   * Represents the scope of the current token
   */
  scope?: string;
}
