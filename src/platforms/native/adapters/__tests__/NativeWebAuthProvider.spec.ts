import { Linking, Platform } from 'react-native';
import { NativeWebAuthProvider } from '../NativeWebAuthProvider';
import { INativeBridge } from '../../bridge';
import { finalizeScope } from '../../../../core/utils';

// 1. Mock the dependencies
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' }, // Default to iOS for listener tests
  Linking: {
    addEventListener: jest.fn(),
  },
}));

jest.mock('../../../../core/utils/scope');

const mockBridge: jest.Mocked<INativeBridge> = {
  authorize: jest.fn(),
  clearSession: jest.fn(),
  cancelWebAuth: jest.fn(),
  getBundleIdentifier: jest.fn().mockResolvedValue('com.my-app'),
  resumeWebAuth: jest.fn(),
  // Add stubs for other bridge methods
  hasValidInstance: jest.fn(),
  initialize: jest.fn(),
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
};

const mockFinalizeScope = finalizeScope as jest.Mock;
const mockAddEventListener = Linking.addEventListener as jest.Mock;

describe('NativeWebAuthProvider', () => {
  const domain = 'my-tenant.auth0.com';
  let provider: NativeWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NativeWebAuthProvider(mockBridge, domain);

    // Provide a default implementation for finalizeScope
    mockFinalizeScope.mockImplementation((scope) =>
      scope ? `openid ${scope}` : 'openid profile email'
    );

    // Mock the listener to return a mock subscription object
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
  });

  describe('authorize', () => {
    it('should call finalizeScope with the provided scope', async () => {
      await provider.authorize({ scope: 'read:data' });
      expect(mockFinalizeScope).toHaveBeenCalledWith('read:data');
    });

    it('should derive scheme and redirectUri if not provided', async () => {
      await provider.authorize({});

      const expectedScheme = 'com.my-app.auth0';
      const expectedRedirectUri = `com.my-app.auth0://${domain}/ios/com.my-app/callback`;

      expect(mockBridge.authorize).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUrl: expectedRedirectUri,
        }),
        expect.objectContaining({
          customScheme: expectedScheme,
        })
      );
    });

    it('should use provided customScheme and redirectUrl', async () => {
      const parameters = { redirectUrl: 'my-app://custom-callback' };
      const options = { customScheme: 'my-app' };

      await provider.authorize(parameters, options);

      expect(mockBridge.authorize).toHaveBeenCalledWith(
        expect.objectContaining({ redirectUrl: 'my-app://custom-callback' }),
        expect.objectContaining({ customScheme: 'my-app' })
      );
    });

    it('should use legacy scheme when useLegacyCallbackUrl is true', async () => {
      const options = { useLegacyCallbackUrl: true };
      await provider.authorize({}, options);

      const expectedScheme = 'com.my-app'; // No '.auth0' suffix
      const expectedRedirectUri = `com.my-app://${domain}/ios/com.my-app/callback`;

      expect(mockBridge.authorize).toHaveBeenCalledWith(
        expect.objectContaining({ redirectUrl: expectedRedirectUri }),
        expect.objectContaining({ customScheme: expectedScheme })
      );
    });

    describe('Linking listener (iOS)', () => {
      beforeEach(() => {
        Platform.OS = 'ios';
      });

      it('should add a Linking listener on iOS', async () => {
        await provider.authorize({});
        expect(Linking.addEventListener).toHaveBeenCalledWith(
          'url',
          expect.any(Function)
        );
      });

      it('should remove the Linking listener on success', async () => {
        const mockSubscription = { remove: jest.fn() };
        mockAddEventListener.mockReturnValueOnce(mockSubscription);
        mockBridge.authorize.mockResolvedValueOnce({} as any); // Simulate success

        await provider.authorize({});

        expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
      });

      it('should remove the Linking listener on failure', async () => {
        const mockSubscription = { remove: jest.fn() };
        mockAddEventListener.mockReturnValueOnce(mockSubscription);
        mockBridge.authorize.mockRejectedValueOnce(new Error('Auth failed'));

        // The error is expected and should be caught by the caller.
        await expect(provider.authorize({})).rejects.toThrow('Auth failed');

        expect(mockSubscription.remove).toHaveBeenCalledTimes(1);
      });

      it('should call resumeWebAuth when the listener is triggered', async () => {
        let listenerCallback: (event: { url: string }) => void = () => {};
        mockAddEventListener.mockImplementation((_event, callback) => {
          listenerCallback = callback;
          return { remove: jest.fn() };
        });

        // We don't await this, as it would "hang" until the listener is called.
        provider.authorize({});

        // Simulate the deep link event.
        const resumeUrl = 'my-app://callback?code=123';
        await listenerCallback({ url: resumeUrl });

        expect(mockBridge.resumeWebAuth).toHaveBeenCalledWith(resumeUrl);
      });
    });

    it('should NOT add a Linking listener on Android', async () => {
      Platform.OS = 'android';
      await provider.authorize({});
      expect(Linking.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    beforeEach(() => {
      Platform.OS = 'ios'; // Ensure Platform.OS is set to iOS for clearSession tests
    });

    it('should derive scheme and returnToUrl if not provided', async () => {
      await provider.clearSession({});

      const expectedScheme = 'com.my-app.auth0';
      const expectedReturnToUrl = `com.my-app.auth0://${domain}/ios/com.my-app/callback`;

      expect(mockBridge.clearSession).toHaveBeenCalledWith(
        expect.objectContaining({ returnToUrl: expectedReturnToUrl }),
        expect.objectContaining({ customScheme: expectedScheme })
      );
    });

    it('should use provided customScheme and returnToUrl', async () => {
      const parameters = { returnToUrl: 'my-app://custom-logout' };
      const options = { customScheme: 'my-app' };

      await provider.clearSession(parameters, options);

      expect(mockBridge.clearSession).toHaveBeenCalledWith(
        expect.objectContaining({ returnToUrl: 'my-app://custom-logout' }),
        expect.objectContaining({ customScheme: 'my-app' })
      );
    });
  });

  describe('cancelWebAuth', () => {
    it('should call the bridge to cancel the web auth flow', async () => {
      await provider.cancelWebAuth();
      expect(mockBridge.cancelWebAuth).toHaveBeenCalledTimes(1);
    });
  });
});
