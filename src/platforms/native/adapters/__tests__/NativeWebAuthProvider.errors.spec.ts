import { NativeWebAuthProvider } from '../NativeWebAuthProvider';
import { INativeBridge } from '../../bridge';
import { WebAuthError } from '../../../../core/models';

// Mock the native bridge
const mockBridge: jest.Mocked<INativeBridge> = {
  authorize: jest.fn(),
  clearSession: jest.fn(),
  getBundleIdentifier: jest.fn().mockResolvedValue('com.app.test'),
  // Stub other methods to satisfy the interface
  hasValidInstance: jest.fn(),
  initialize: jest.fn(),
  saveCredentials: jest.fn(),
  getCredentials: jest.fn(),
  hasValidCredentials: jest.fn(),
  clearCredentials: jest.fn(),
  cancelWebAuth: jest.fn(),
  resumeWebAuth: jest.fn(),
};

describe('NativeWebAuthProvider Error Handling', () => {
  let provider: NativeWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new NativeWebAuthProvider(mockBridge, 'test.auth0.com');
  });

  it('should convert an Android "user_cancelled" error from authorize into a WebAuthError', async () => {
    const nativeError = {
      code: 'a0.session.user_cancelled',
      message: 'User cancelled.',
    };
    mockBridge.authorize.mockRejectedValue(nativeError);

    await expect(provider.authorize()).rejects.toThrow(WebAuthError);
    try {
      await provider.authorize();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('USER_CANCELLED');
      expect(err.message).toBe('User cancelled.');
    }
  });

  it('should convert an iOS "USER_CANCELLED" error from authorize into a WebAuthError', async () => {
    const nativeError = { code: 'USER_CANCELLED', message: 'User cancelled.' };
    mockBridge.authorize.mockRejectedValue(nativeError);

    await expect(provider.authorize()).rejects.toThrow(WebAuthError);
    try {
      await provider.authorize();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('USER_CANCELLED');
    }
  });

  it('should convert a "BROWSER_NOT_AVAILABLE" error from clearSession into a WebAuthError', async () => {
    const nativeError = {
      code: 'a0.browser_not_available',
      message: 'No browser.',
    };
    mockBridge.clearSession.mockRejectedValue(nativeError);

    await expect(provider.clearSession()).rejects.toThrow(WebAuthError);
    try {
      await provider.clearSession();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('BROWSER_NOT_AVAILABLE');
    }
  });
});
