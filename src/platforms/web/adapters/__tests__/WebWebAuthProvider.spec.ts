import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { finalizeScope } from '../../../../core/utils';
import { AuthError } from '../../../../core/models';

// Mock the direct dependencies
jest.mock('@auth0/auth0-spa-js');
jest.mock('../../../../core/utils/scope');

const MockAuth0Client = Auth0Client as jest.MockedClass<typeof Auth0Client>;
const mockFinalizeScope = finalizeScope as jest.Mock;

describe('WebWebAuthProvider', () => {
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let provider: WebWebAuthProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock instance of the underlying spa-js client.
    // This is the object that will be passed into our provider's constructor.
    mockSpaClient = new MockAuth0Client({} as any);

    // Construct the provider with the mock dependency.
    provider = new WebWebAuthProvider(mockSpaClient);

    // Provide a default mock implementation for the scope utility.
    mockFinalizeScope.mockImplementation(
      (scope) => scope || 'openid profile email'
    );
  });

  describe('authorize', () => {
    it('should call finalizeScope with the provided scope', () => {
      // The promise from authorize() is designed to never resolve, so we don't await it.
      // We are only testing the synchronous calls that happen before the redirect.
      provider.authorize({ scope: 'read:data' });
      expect(mockFinalizeScope).toHaveBeenCalledWith('read:data');
    });

    it('should call loginWithRedirect on the spa-js client with all parameters', () => {
      const parameters = {
        audience: 'https://api.example.com',
        connection: 'Username-Password-Authentication',
        redirectUrl: 'https://app.com/callback',
        scope: 'openid profile read:data',
        state: 'custom-state',
        nonce: 'custom-nonce',
      };

      // Re-configure the mock scope utility for this specific test
      mockFinalizeScope.mockReturnValue('openid profile read:data');

      provider.authorize(parameters);

      expect(mockSpaClient.loginWithRedirect).toHaveBeenCalledTimes(1);
      expect(mockSpaClient.loginWithRedirect).toHaveBeenCalledWith({
        authorizationParams: {
          audience: parameters.audience,
          connection: parameters.connection,
          scope: 'openid profile read:data',
          redirect_uri: parameters.redirectUrl,
          state: parameters.state,
          nonce: parameters.nonce,
        },
      });
    });

    it('should handle empty parameters by using defaults', () => {
      mockFinalizeScope.mockReturnValue('openid profile email');

      provider.authorize({});

      expect(mockSpaClient.loginWithRedirect).toHaveBeenCalledWith({
        authorizationParams: {
          scope: 'openid profile email',
          redirect_uri: undefined,
        },
      });
    });

    it('should return a never-resolving promise to simulate redirect behavior', async () => {
      const authorizePromise = provider.authorize({});
      const timeout = new Promise((resolve) => setTimeout(resolve, 100));

      // We expect the test to finish (due to timeout) before the authorizePromise resolves.
      // This confirms it's a hanging promise.
      await expect(
        Promise.race([authorizePromise, timeout])
      ).resolves.toBeUndefined();
    });
  });

  describe('handleRedirectCallback', () => {
    it('should call the client handleRedirectCallback method with provided URL', async () => {
      const expectedResult = {
        appState: { returnTo: '/dashboard' },
        user: { sub: 'auth0|123', name: 'Test User' },
      };
      mockSpaClient.handleRedirectCallback.mockResolvedValue(expectedResult);

      await provider.handleRedirectCallback(
        'https://app.com/callback?code=123'
      );

      expect(mockSpaClient.handleRedirectCallback).toHaveBeenCalledWith(
        'https://app.com/callback?code=123'
      );
    });

    it('should call the client handleRedirectCallback method without URL when none provided', async () => {
      const expectedResult = {
        appState: { returnTo: '/dashboard' },
        user: { sub: 'auth0|123', name: 'Test User' },
      };
      mockSpaClient.handleRedirectCallback.mockResolvedValue(expectedResult);

      await provider.handleRedirectCallback();

      expect(mockSpaClient.handleRedirectCallback).toHaveBeenCalledWith(
        undefined
      );
    });

    it('should throw AuthError when handleRedirectCallback fails', async () => {
      const callbackError = {
        error: 'invalid_request',
        error_description: 'Invalid authorization code',
      };
      mockSpaClient.handleRedirectCallback.mockRejectedValue(callbackError);

      await expect(provider.handleRedirectCallback()).rejects.toThrow(
        AuthError
      );
      await expect(provider.handleRedirectCallback()).rejects.toMatchObject({
        name: 'invalid_request',
        message: 'Invalid authorization code',
      });
    });

    it('should handle errors without error_description by using the message', async () => {
      const callbackError = {
        error: 'callback_error',
        message: 'Something went wrong during callback',
      };
      mockSpaClient.handleRedirectCallback.mockRejectedValue(callbackError);

      await expect(provider.handleRedirectCallback()).rejects.toThrow(
        AuthError
      );
      await expect(provider.handleRedirectCallback()).rejects.toMatchObject({
        name: 'callback_error',
        message: 'Something went wrong during callback',
      });
    });

    it('should handle errors without error or error_description by using defaults', async () => {
      const callbackError = {
        message: 'Unknown callback error',
      };
      mockSpaClient.handleRedirectCallback.mockRejectedValue(callbackError);

      await expect(provider.handleRedirectCallback()).rejects.toThrow(
        AuthError
      );
      await expect(provider.handleRedirectCallback()).rejects.toMatchObject({
        name: 'RedirectCallbackError',
        message: 'Unknown callback error',
      });
    });
  });

  describe('clearSession', () => {
    it("should call the client's logout method with correct parameters", async () => {
      const parameters = {
        returnToUrl: 'https://app.com/logout',
        federated: true,
      };

      await provider.clearSession(parameters);

      expect(mockSpaClient.logout).toHaveBeenCalledTimes(1);
      expect(mockSpaClient.logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: parameters.returnToUrl,
          federated: parameters.federated,
        },
      });
    });

    it('should handle empty parameters by using defaults', async () => {
      await provider.clearSession({});

      expect(mockSpaClient.logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: undefined,
          federated: undefined,
        },
      });
    });

    it('should handle undefined parameters', async () => {
      await provider.clearSession();

      expect(mockSpaClient.logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: undefined,
          federated: undefined,
        },
      });
    });

    it('should throw an AuthError if the client logout fails', async () => {
      const logoutError = {
        error: 'logout_failed',
        error_description: 'Could not log out',
      };
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(provider.clearSession()).rejects.toThrow(AuthError);
      await expect(provider.clearSession()).rejects.toMatchObject({
        name: 'logout_failed',
        message: 'Could not log out',
      });
    });

    it('should handle logout errors without error_description by using the message', async () => {
      const logoutError = {
        error: 'logout_error',
        message: 'Logout operation failed',
      };
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(provider.clearSession()).rejects.toThrow(AuthError);
      await expect(provider.clearSession()).rejects.toMatchObject({
        name: 'logout_error',
        message: 'Logout operation failed',
      });
    });

    it('should handle logout errors without error or error_description by using defaults', async () => {
      const logoutError = {
        message: 'Unknown logout error',
      };
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(provider.clearSession()).rejects.toThrow(AuthError);
      await expect(provider.clearSession()).rejects.toMatchObject({
        name: 'LogoutFailed',
        message: 'Unknown logout error',
      });
    });
  });

  describe('cancelWebAuth', () => {
    it('should resolve immediately as it is a no-op on the web', async () => {
      await expect(provider.cancelWebAuth()).resolves.toBeUndefined();
      expect(mockSpaClient.loginWithRedirect).not.toHaveBeenCalled();
      expect(mockSpaClient.logout).not.toHaveBeenCalled();
    });
  });
});
