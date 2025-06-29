import LocalAuthenticationLevel from './localAuthenticationLevel';
import LocalAuthenticationStrategy from './localAuthenticationStrategy';

/**
 * The options for configuring the display of local authentication prompt, authentication level (Android only) and evaluation policy (iOS only).
 */

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
  evaluationPolicy?: LocalAuthenticationStrategy;
  /**
   * The fallback button title of the authentication prompt. **Applicable for iOS only.**
   */
  fallbackTitle?: string;
  /**
   * The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**
   */
  authenticationLevel?: LocalAuthenticationLevel;
  /**
   * Should the user be given the option to authenticate with their device PIN, pattern, or password instead of a biometric. **Applicable for Android only.**
   */
  deviceCredentialFallback?: boolean;
}

export type { LocalAuthenticationOptions };
