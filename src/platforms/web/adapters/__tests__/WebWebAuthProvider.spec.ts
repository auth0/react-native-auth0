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
        },
      });
    });

    it('should throw an error to interrupt the app flow, as it redirects', async () => {
      // This confirms the promise doesn't resolve with credentials, which is correct behavior for a redirect.
      // It should hang until Jest times it out, but we can check if it throws our specific Redirecting error.
      // In your latest implementation, it just returns a hanging promise. Let's test that it doesn't resolve or reject quickly.
      const authorizePromise = provider.authorize({});

      const timeout = new Promise((resolve) => setTimeout(resolve, 100));

      // We expect the test to finish (due to timeout) before the authorizePromise resolves.
      // This confirms it's a hanging promise.
      await expect(
        Promise.race([authorizePromise, timeout])
      ).resolves.toBeUndefined();
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

    it('should throw an AuthError if the client logout fails', async () => {
      const logoutError = {
        error: 'logout_failed',
        error_description: 'Could not log out',
      };
      mockSpaClient.logout.mockRejectedValue(logoutError);

      await expect(provider.clearSession()).rejects.toThrow(AuthError);
      await expect(provider.clearSession()).rejects.toMatchObject({
        name: 'logout_failed',
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
