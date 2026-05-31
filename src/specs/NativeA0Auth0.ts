import { TurboModuleRegistry, type TurboModule } from 'react-native';

// NOTE: This spec uses only Codegen-compatible inline types (primitives, `Object`,
// inline object literals). It must not import / reference type aliases such as
// `Credentials`, `ApiCredentials`, or `Int32`, because RN 0.85+ Codegen rejects
// any `TSTypeReference` to imported / aliased types in NativeModule specs:
//
//   UnsupportedTypeAnnotationParserError: Module NativeA0Auth0:
//   TypeScript type annotation 'TSTypeReference' is unsupported in NativeModule specs.
//
// The native iOS / Android implementations already coerce numbers to NSInteger /
// Double and treat option dictionaries as untyped maps, so this is a type-level
// change only — no runtime behavior shifts. The `Credentials` / `ApiCredentials`
// types remain part of the public JS API surface and are used by the
// CredentialsManager / WebAuth wrappers that consume this bridge.
//
// See https://github.com/auth0/react-native-auth0/issues/1553 for context.
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
    localAuthenticationOptions: Object | undefined,
    useDPoP: boolean | undefined,
    maxRetries: number
  ): Promise<void>;

  /**
   * Save credentials
   */
  saveCredentials(credentials: Object): Promise<void>;

  /**
   * Get credentials with the given scope
   */
  getCredentials(
    scope: string | undefined,
    minTTL: number,
    parameters: Object,
    forceRefresh: boolean
  ): Promise<Object>;

  /**
   * Check if there are valid credentials
   */
  hasValidCredentials(minTTL: number): Promise<boolean>;

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
    minTTL: number,
    parameters: Object
  ): Promise<Object>;

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
    maxAge: number | undefined,
    organization: string | undefined,
    invitationUrl: string | undefined,
    leeway: number | undefined,
    ephemeralSession: boolean | undefined,
    safariViewControllerPresentationStyle: number | undefined,
    additionalParameters: Object | undefined,
    allowedBrowserPackages: string[] | undefined
  ): Promise<Object>;

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
   * Get the DPoP headers for a request
   */
  getDPoPHeaders(
    url: string,
    method: string,
    accessToken: string,
    tokenType: string,
    nonce?: string
  ): Promise<Object>;

  /**
   * Clear the DPoP key
   * This method clears the DPoP key from the native module.
   */
  clearDPoPKey(): Promise<void>;

  /**
   * Get session transfer credentials for Native to Web SSO
   */
  getSSOCredentials(parameters: Object, headers: Object): Promise<Object>;

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
  ): Promise<Object>;

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
    userMetadata: Object | undefined,
    realm: string | undefined,
    organization: string | undefined
  ): Promise<Object>;

  /**
   * Request a passkey login challenge from Auth0.
   */
  passkeyLoginChallenge(
    realm: string | undefined,
    organization: string | undefined
  ): Promise<Object>;

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
  ): Promise<Object>;
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
  evaluationPolicy: number | undefined;
  /**
   * The fallback button title of the authentication prompt. **Applicable for iOS only.**
   */
  fallbackTitle: string | undefined;
  /**
   * The authentication level to use when prompting the user for authentication. Defaults to LocalAuthenticationLevel.strong. **Applicable for Android only.**
   */
  authenticationLevel: number | undefined;
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
  biometricTimeout: number | undefined;
}
