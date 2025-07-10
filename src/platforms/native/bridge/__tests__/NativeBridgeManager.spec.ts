import { NativeBridgeManager } from '../NativeBridgeManager';
import { AuthError, Credentials } from '../../../../core/models';
import Auth0NativeModule from '../../../../specs/NativeA0Auth0';

// Mock the entire spec file, which is our native module.
jest.mock('../../../../specs/NativeA0Auth0');
const MockedAuth0NativeModule = Auth0NativeModule as jest.Mocked<
  typeof Auth0NativeModule
>;

// A valid JWT structure. The content doesn't matter, only that it can be decoded.
const validIdToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHwxMjM0NSJ9.s-V2h_Yfxb19i5d6sB7B5p9a8j_hS_p-A-gNq8lT9iY';

const nativeSuccessCredentials = {
  idToken: validIdToken,
  accessToken: 'access-token-from-native',
  tokenType: 'Bearer',
  expiresAt: Math.floor(Date.now() / 1000) + 3600, // Native returns expiresAt as timestamp
  refreshToken: 'refresh-token-from-native',
  scope: 'openid profile',
};

describe('NativeBridgeManager', () => {
  let bridge: NativeBridgeManager;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    bridge = new NativeBridgeManager();
  });

  describe('authorize', () => {
    const parameters = {
      state: 'state-xyz',
      nonce: 'nonce-abc',
      audience: 'https://api.example.com',
      scope: 'openid profile',
      connection: 'Username-Password-Authentication',
      maxAge: 86400,
      organization: 'org_123',
      invitationUrl: 'https://app.example.com/invite',
      redirectUrl: 'com.myapp://my-tenant.auth0.com/ios/com.myapp/callback',
      additionalParameters: { custom: 'value' },
    };
    const options = {
      customScheme: 'com.myapp',
      leeway: 60,
      ephemeralSession: true,
      useSFSafariViewController: { presentationStyle: 1 },
    };

    it('should call the native webAuth method with all parameters', async () => {
      MockedAuth0NativeModule.webAuth.mockResolvedValueOnce(
        nativeSuccessCredentials as any
      );

      await bridge.authorize(parameters, options);

      expect(MockedAuth0NativeModule.webAuth).toHaveBeenCalledTimes(1);
      expect(MockedAuth0NativeModule.webAuth).toHaveBeenCalledWith(
        options.customScheme, // scheme from options
        parameters.redirectUrl,
        parameters.state,
        parameters.nonce,
        parameters.audience,
        parameters.scope,
        parameters.connection,
        parameters.maxAge,
        parameters.organization,
        parameters.invitationUrl,
        options.leeway,
        options.ephemeralSession,
        1, // presentationStyle
        parameters.additionalParameters
      );
    });

    it('should handle missing optional parameters with correct defaults', async () => {
      MockedAuth0NativeModule.webAuth.mockResolvedValueOnce(
        nativeSuccessCredentials as any
      );
      // Only provide the required parameter `redirectUrl`
      await bridge.authorize(
        { redirectUrl: 'com.myapp://cb' },
        { customScheme: 'com.myapp' }
      );

      expect(MockedAuth0NativeModule.webAuth).toHaveBeenCalledWith(
        'com.myapp',
        'com.myapp://cb',
        undefined, // state
        undefined, // nonce
        undefined, // audience
        undefined, // scope
        undefined, // connection
        0, // maxAge
        undefined, // organization
        undefined, // invitationUrl
        0, // leeway
        false, // ephemeralSession
        undefined, // presentationStyle
        {} // additionalParameters
      );
    });

    it('should correctly transform the native response to a Credentials model', async () => {
      MockedAuth0NativeModule.webAuth.mockResolvedValueOnce(
        nativeSuccessCredentials as any
      );

      const credentials = await bridge.authorize(parameters, options);

      expect(credentials).toBeInstanceOf(Credentials);
      expect(credentials.accessToken).toBe(
        nativeSuccessCredentials.accessToken
      );
      // The model should convert `expires_in` to `expiresAt`
      expect(credentials.expiresAt).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('clearSession', () => {
    it('should call the native webAuthLogout method with all parameters', async () => {
      const parameters = { federated: true, returnToUrl: 'com.myapp://logout' };
      const options = { customScheme: 'com.myapp' };

      await bridge.clearSession(parameters, options);

      expect(MockedAuth0NativeModule.webAuthLogout).toHaveBeenCalledTimes(1);
      expect(MockedAuth0NativeModule.webAuthLogout).toHaveBeenCalledWith(
        options.customScheme,
        parameters.federated,
        parameters.returnToUrl
      );
    });
  });

  describe('getCredentials', () => {
    it('should call the native getCredentials with all parameters', async () => {
      const scope = 'openid profile';
      const minTtl = 300;
      const forceRefresh = true;

      await bridge.getCredentials(scope, minTtl, forceRefresh);

      expect(MockedAuth0NativeModule.getCredentials).toHaveBeenCalledWith(
        scope,
        minTtl,
        {}, // parameters object is currently unused but passed for spec compliance
        forceRefresh
      );
    });
  });

  describe('error handling', () => {
    it('should catch a native error and re-throw it as a structured AuthError', async () => {
      const nativeError = {
        code: 'a0.session.user_cancelled',
        message: 'User cancelled the Auth',
      };
      MockedAuth0NativeModule.webAuth.mockRejectedValueOnce(nativeError);

      await expect(bridge.authorize({} as any, {} as any)).rejects.toThrow(
        AuthError
      );

      try {
        await bridge.authorize({} as any, {} as any);
      } catch (e) {
        const authError = e as AuthError;
        expect(authError.name).toBe('a0.session.user_cancelled');
        expect(authError.message).toBe('User cancelled the Auth');
        expect(authError.code).toBe('a0.session.user_cancelled');
      }
    });
  });
});
