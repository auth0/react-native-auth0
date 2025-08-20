import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { WebAuthError } from '../../../../core/models';

jest.mock('@auth0/auth0-spa-js');

describe('WebWebAuthProvider Error Handling', () => {
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let provider: WebWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpaClient = new (Auth0Client as jest.Mock<Auth0Client>)({
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
    });
    provider = new WebWebAuthProvider(mockSpaClient);
  });

  it('should convert an "access_denied" error from clearSession into a WebAuthError with type "ACCESS_DENIED"', async () => {
    const spaJsError = {
      error: 'access_denied',
      error_description: 'Logout denied',
    };
    mockSpaClient.logout.mockRejectedValue(spaJsError);
    await expect(provider.clearSession()).rejects.toThrow(WebAuthError);
    try {
      await provider.clearSession();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('ACCESS_DENIED');
      expect(err.message).toBe('Logout denied');
    }
  });

  it('should convert a "cancelled" error from clearSession into a WebAuthError with type "USER_CANCELLED"', async () => {
    const spaJsError = {
      error: 'cancelled',
      error_description: 'Popup closed',
    };
    mockSpaClient.logout.mockRejectedValue(spaJsError);
    await expect(provider.clearSession()).rejects.toThrow(WebAuthError);
    try {
      await provider.clearSession();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('USER_CANCELLED');
    }
  });

  it('should convert a "state_mismatch" error from handleRedirectCallback into a WebAuthError with type "INVALID_STATE"', async () => {
    const spaJsError = {
      error: 'state_mismatch',
      error_description: 'Invalid state',
    };
    mockSpaClient.handleRedirectCallback.mockRejectedValue(spaJsError);
    await expect(provider.handleRedirectCallback()).rejects.toThrow(
      WebAuthError
    );
    try {
      await provider.handleRedirectCallback();
    } catch (e) {
      const err = e as WebAuthError;
      expect(err.type).toBe('INVALID_STATE');
    }
  });
});
