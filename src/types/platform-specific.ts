import type { Auth0Options } from './common';

// ========= Native Enums =========

/**
 * @remarks
 * **Platform specific:** iOS only.
 * Presentation styles for the web-based login screen on iOS.
 * @see https://developer.apple.com/documentation/uikit/uimodalpresentationstyle
 */
export enum SafariViewControllerPresentationStyle {
  automatic = -2,
  none,
  fullScreen,
  pageSheet,
  formSheet,
  currentContext,
  custom,
  overFullScreen,
  overCurrentContext,
  popover,
}

/**
 * @remarks
 * **Platform specific:** Android only.
 * The level of local authentication required to access credentials on Android.
 */
export enum LocalAuthenticationLevel {
  strong = 0,
  weak,
  deviceCredential,
}

/**
 * @remarks
 * **Platform specific:** iOS only.
 * The evaluation policy to use when accessing credentials on iOS.
 */
export enum LocalAuthenticationStrategy {
  deviceOwnerWithBiometrics = 1,
  deviceOwner,
}

/**
 * @remarks
 * **Platform specific:** Native only (iOS/Android).
 * Controls when biometric authentication prompts are shown when accessing stored credentials.
 *
 * - `default`: System-managed behavior (preserves backward compatibility, reuses LAContext on iOS; maps to Always policy on Android)
 * - `always`: Always prompts for biometric authentication (creates fresh LAContext on iOS, maps to 'always' on Android)
 * - `session`: Prompts once, then caches for the specified timeout in seconds
 * - `appLifecycle`: Prompts once until app restart or manual clear, with optional timeout
 */
export enum BiometricPolicy {
  default = 'default',
  always = 'always',
  session = 'session',
  appLifecycle = 'appLifecycle',
}

// ========= Native-Specific Options =========

/**
 * @remarks
 * **Platform specific:** Native only (iOS/Android).
 * Options for configuring local authentication (e.g., biometrics or device PIN).
 */
export interface LocalAuthenticationOptions {
  title: string;
  subtitle?: string;
  description?: string;
  cancelTitle?: string;
  evaluationPolicy?: LocalAuthenticationStrategy;
  authenticationLevel?: LocalAuthenticationLevel;
  fallbackTitle?: string;
  deviceCredentialFallback?: boolean;
  /**
   * Controls when biometric authentication prompts are shown when accessing stored credentials.
   * @default BiometricPolicy.default
   */
  biometricPolicy?: BiometricPolicy;
  /**
   * Timeout in seconds for session and appLifecycle policies.
   * - For `session` policy: credentials are cached for this duration after successful biometric authentication
   * - For `appLifecycle` policy: optional timeout, defaults to 3600 seconds (1 hour) if not specified
   * @default 3600 (1 hour)
   */
  biometricTimeout?: number;
}

/**
 * Extends the core Auth0Options with native-specific configuration.
 * @remarks
 * **Platform specific:** Native only (iOS/Android).
 */
export interface NativeAuth0Options extends Auth0Options {
  localAuthenticationOptions?: LocalAuthenticationOptions;
}

/**
 * Options specific to the `authorize` method on Native platforms.
 * @remarks
 * **Platform specific:** Native only (iOS/Android).
 */
export interface NativeAuthorizeOptions {
  /**
   * The amount of leeway, in seconds, to accommodate potential clock skew when validating an ID token's claims.
   * @default 60 seconds.
   */
  leeway?: number;
  /**
   * **iOS only**: Disable Single-Sign-On (SSO). It only affects iOS with versions 13 and above.
   * @default `false`
   */
  ephemeralSession?: boolean;
  /**
   * Custom scheme to build the callback URL with.
   */
  customScheme?: string;
  /**
   * This will use older callback URL. See {@link https://github.com/auth0/react-native-auth0/blob/master/MIGRATION_GUIDE.md#callback-url-migration} for more details.
   */
  useLegacyCallbackUrl?: boolean;
  /**
   * **iOS only:** Uses `SFSafariViewController` instead of `ASWebAuthenticationSession`. If empty object is set, the presentationStyle defaults to {@link SafariViewControllerPresentationStyle.fullScreen}
   *
   * This can be used as a boolean value or as an object which sets the `presentationStyle`. See the examples below for reference
   *
   * @example
   * ```typescript
   * await authorize({}, {useSFSafariViewController: true});
   * ```
   *
   * or
   *
   * @example
   * ```typescript
   * await authorize({}, {useSFSafariViewController: {presentationStyle: SafariViewControllerPresentationStyle.fullScreen}});
   * ```
   */
  useSFSafariViewController?:
    | {
        presentationStyle?: SafariViewControllerPresentationStyle;
      }
    | boolean;
}

/**
 * Options specific to the `clearSession` method on Native platforms.
 * @remarks
 * **Platform specific:** Native only (iOS/Android).
 */
export interface NativeClearSessionOptions {
  /**
   * A custom scheme to be used in the callback URL for logout.
   */
  customScheme?: string;

  /**
   * If `true`, the SDK will generate a legacy-style callback URL.
   * See migration guide for details.
   */
  useLegacyCallbackUrl?: boolean;
}

// ========= Web-Specific Options =========

/**
 * Extends the core Auth0Options with web-specific configuration
 * that is passed down to `@auth0/auth0-spa-js`.
 * @remarks
 * **Platform specific:** Web only.
 * @see https://auth0.github.io/auth0-spa-js/interfaces/Auth0ClientOptions.html
 */
export interface WebAuth0Options extends Auth0Options {
  /** How and where to cache session data. Defaults to `memory`. */
  cacheLocation?: 'memory' | 'localstorage';
  /** Enables the use of refresh tokens for silent authentication. */
  useRefreshTokens?: boolean;
  /**
   * Fallback to iframe-based token retrieval if refresh token fails.
   * @default true
   */
  useRefreshTokensFallback?: boolean;
  /** A custom audience for the `getTokenSilently` call. */
  audience?: string;
  /** A custom scope for the `getTokenSilently` call. */
  scope?: string;
  /**
   * **Web only:** Enables the use of Multi-Resource Refresh Tokens (MRRT).
   * When enabled, `useRefreshTokens` is automatically set to `true`.
   * @default false
   */
  useMrrt?: boolean;
}

/**
 * Options specific to the `authorize` method on the Web platform.
 * (Currently a placeholder, can be extended later).
 * @remarks
 * **Platform specific:** Web only.
 */
export interface WebAuthorizeOptions {}

/**
 * Options specific to the `clearSession` method on the Web platform.
 * (Currently a placeholder, can be extended later).
 * @remarks
 * **Platform specific:** Web only.
 */
export interface WebClearSessionOptions {}
