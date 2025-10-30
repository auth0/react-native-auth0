import { TurboModuleRegistry, type TurboModule } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ApiCredentials, Credentials } from '../types';
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
    useDPoP: boolean | undefined
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
   * Clear API credentials for a specific audience
   */
  clearApiCredentials(audience: string): Promise<void>;

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
    additionalParameters: { [key: string]: string } | undefined
  ): Promise<Credentials>;

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
}
