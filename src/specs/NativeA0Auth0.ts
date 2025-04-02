import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

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
    localAuthenticationOptions?: LocalAuthenticationOptions
  ): Promise<void>;

  /**
   * Save credentials
   */
  saveCredentials(credentials: Credentials): Promise<void>;

  /**
   * Get credentials with the given scope
   */
  getCredentials(
    scope: string | undefined,
    minTTL: number,
    parameters: Object,
    forceRefresh: boolean
  ): Promise<Credentials>;

  /**
   * Check if there are valid credentials
   */
  hasValidCredentials(minTTL: number): Promise<boolean>;

  /**
   * Clear credentials
   */
  clearCredentials(): Promise<void>;

  /**
   * Enable local authentication
   */
  enableLocalAuthentication(
    title: string,
    cancelTitle: string,
    fallbackTitle: string,
    evaluationPolicy: number
  ): void;

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
    maxAge?: number,
    organization?: string,
    invitationUrl?: string,
    leeway?: number,
    ephemeralSession?: boolean,
    safariViewControllerPresentationStyle?: number,
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
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  [key: string]: any;
}

interface LocalAuthenticationOptions {
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
  evaluationPolicy?: number;
  /**
   * The fallback button title of the authentication prompt. **Applicable for iOS only.**
   */
  fallbackTitle?: string;
  /**
   * The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**
   */
  authenticationLevel?: number;
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
  expiresAt: number;
  /**
   * The token used to refresh the access token
   */
  refreshToken?: string;
  /**
   * Represents the scope of the current token
   */
  scope?: string;
}
