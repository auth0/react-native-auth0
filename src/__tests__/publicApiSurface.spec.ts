import * as path from 'path';
import * as ts from 'typescript';

/**
 * The frozen public API surface of `src/index.ts`.
 *
 * This list is the stable public contract for v6. Adding an entry is a minor
 * change; **removing or renaming an entry is a breaking change** and must be
 * treated as such (major version, deprecation cycle, changelog entry).
 *
 * If this test fails, do not "fix" it by regenerating the list. Confirm the
 * change to the surface is intentional and versioned appropriately first.
 */
const FROZEN_PUBLIC_API = [
  'ApiCredentials',
  'Auth0',
  'Auth0Client',
  'Auth0ContextInterface',
  'Auth0ErrorCode',
  'Auth0Options',
  'Auth0Provider',
  'AuthError',
  'AuthState',
  'AuthenticationMethod',
  'AuthenticationMethodType',
  'AuthenticationMethodTypes',
  'AuthenticationProvider',
  'AuthorizeUrlParameters',
  'BiometricPolicy',
  'ClearSessionParameters',
  'ConfirmOTPEnrollmentParameters',
  'ConfirmPushNotificationEnrollmentParameters',
  'ConfirmRecoveryCodeEnrollmentParameters',
  'CreateUserParameters',
  'Credentials',
  'CredentialsManager',
  'CredentialsManagerError',
  'CredentialsManagerErrorCode',
  'CredentialsManagerErrorCodes',
  'CustomTokenExchangeParameters',
  'DPoPError',
  'DPoPErrorCode',
  'DPoPErrorCodes',
  'DPoPHeadersParameters',
  'DPoPHeadersParams',
  'DeleteAuthenticationMethodByIdParameters',
  'DeliveryMethod',
  'EnrollEmailParameters',
  'EnrollPasskeyParameters',
  'EnrollPhoneParameters',
  'EnrollPushNotificationParameters',
  'EnrollRecoveryCodeParameters',
  'EnrollTOTPParameters',
  'EnrollmentChallenge',
  'ExchangeNativeSocialParameters',
  'ExchangeParameters',
  'Factor',
  'GetAuthenticationMethodByIdParameters',
  'GetAuthenticationMethodsParameters',
  'GetFactorsParameters',
  'GetTokenByPasskeyParameters',
  'LocalAuthenticationLevel',
  'LocalAuthenticationOptions',
  'LocalAuthenticationStrategy',
  'LoginEmailParameters',
  'LoginSmsParameters',
  'LogoutUrlParameters',
  'MfaAuthenticator',
  'MfaChallengeResult',
  'MfaChallengeWithAuthenticatorParameters',
  'MfaClient',
  'MfaEnrollEmailParameters',
  'MfaEnrollOtpParameters',
  'MfaEnrollParameters',
  'MfaEnrollPushParameters',
  'MfaEnrollSmsParameters',
  'MfaEnrollVoiceParameters',
  'MfaEnrollmentChallenge',
  'MfaError',
  'MfaErrorCode',
  'MfaErrorCodes',
  'MfaFactor',
  'MfaFactorType',
  'MfaGetAuthenticatorsParameters',
  'MfaOobEnrollmentChallenge',
  'MfaPushEnrollmentChallenge',
  'MfaRecoveryCodeEnrollmentChallenge',
  'MfaRequiredErrorPayload',
  'MfaRequirements',
  'MfaTotpEnrollmentChallenge',
  'MfaVerifyOobParameters',
  'MfaVerifyOtpParameters',
  'MfaVerifyParameters',
  'MfaVerifyRecoveryCodeParameters',
  'MyAccountClient',
  'MyAccountError',
  'MyAccountErrorCode',
  'MyAccountErrorCodes',
  'NativeAuthorizeOptions',
  'NativeClearSessionOptions',
  'PasskeyAuthenticationMethod',
  'PasskeyChallengeResponse',
  'PasskeyEnrollmentChallengeParameters',
  'PasskeyEnrollmentChallengeResponse',
  'PasskeyError',
  'PasskeyErrorCode',
  'PasskeyErrorCodes',
  'PasskeyLoginChallengeParameters',
  'PasskeySignupChallengeParameters',
  'PasswordRealmParameters',
  'PasswordlessChallenge',
  'PasswordlessChallengeEmailParameters',
  'PasswordlessChallengePhoneParameters',
  'PasswordlessClient',
  'PasswordlessDeliveryMethod',
  'PasswordlessEmailParameters',
  'PasswordlessLoginOtpParameters',
  'PasswordlessSmsParameters',
  'PreferredAuthenticationMethods',
  'RecoveryCodeEnrollmentChallenge',
  'RefreshTokenParameters',
  'ResetPasswordParameters',
  'RevokeOptions',
  'SSOExchangeParameters',
  'SafariViewControllerPresentationStyle',
  'SessionTransferCredentials',
  'TOTPEnrollmentChallenge',
  'TimeoutError',
  'TokenType',
  'UpdateAuthenticationMethodByIdParameters',
  'User',
  'UserInfoParameters',
  'WebAuthError',
  'WebAuthErrorCode',
  'WebAuthErrorCodes',
  'WebAuthProvider',
  'WebAuthorizeOptions',
  'WebAuthorizeParameters',
  'WebClearSessionOptions',
  'default',
  'parseIdToken',
  'useAuth0',
];

/**
 * Resolves the actual exports of `src/index.ts` through the TypeScript compiler.
 *
 * A runtime `import * from '../index'` cannot be used here: most of the surface
 * is type-only and erased at runtime, so it would silently miss regressions in
 * the exported types — which are just as breaking as a missing class.
 */
function resolvePublicExports(): string[] {
  const projectRoot = path.resolve(__dirname, '..', '..');
  const configPath = path.join(projectRoot, 'tsconfig.json');
  const entryPoint = path.join(projectRoot, 'src', 'index.ts');

  const config = ts.getParsedCommandLineOfConfigFile(configPath, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    },
  } as ts.ParseConfigFileHost);

  if (!config) {
    throw new Error(`Unable to parse ${configPath}`);
  }

  const program = ts.createProgram([entryPoint], config.options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryPoint);

  if (!sourceFile) {
    throw new Error(`Unable to load ${entryPoint}`);
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

  if (!moduleSymbol) {
    throw new Error(`${entryPoint} is not a module`);
  }

  return checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => symbol.getName())
    .sort();
}

describe('public API surface', () => {
  // Building a full TS program is slower than a normal unit test.
  const actual = resolvePublicExports();

  it('matches the frozen v6 contract exactly', () => {
    expect(actual).toEqual([...FROZEN_PUBLIC_API].sort());
  });

  it('exports nothing that has been removed from the contract', () => {
    const frozen = new Set(FROZEN_PUBLIC_API);
    expect(actual.filter((name) => !frozen.has(name))).toEqual([]);
  });

  it('still exports everything the contract promises', () => {
    const exported = new Set(actual);
    expect(FROZEN_PUBLIC_API.filter((name) => !exported.has(name))).toEqual([]);
  });

  it('exposes the default export under a named alias', () => {
    // `default` alone is awkward for consumers doing `import { Auth0 }`.
    expect(actual).toContain('default');
    expect(actual).toContain('Auth0');
  });
});
