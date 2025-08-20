import { Auth0Client } from '@auth0/auth0-spa-js';
import { WebCredentialsManager } from '../WebCredentialsManager';
import { CredentialsManagerError } from '../../../../core/models';

jest.mock('@auth0/auth0-spa-js');

describe('WebCredentialsManager Error Handling', () => {
  let mockSpaClient: jest.Mocked<Auth0Client>;
  let manager: WebCredentialsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpaClient = new (Auth0Client as jest.Mock<Auth0Client>)({
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
    });
    manager = new WebCredentialsManager(mockSpaClient);
  });

  it('should convert a "login_required" error into a CredentialsManagerError with type "NO_CREDENTIALS"', async () => {
    const spaJsError = {
      error: 'login_required',
      error_description: 'Login is required',
    };
    mockSpaClient.getTokenSilently.mockRejectedValue(spaJsError);
    await expect(manager.getCredentials()).rejects.toThrow(
      CredentialsManagerError
    );
    try {
      await manager.getCredentials();
    } catch (e) {
      const err = e as CredentialsManagerError;
      expect(err.type).toBe('NO_CREDENTIALS');
      expect(err.message).toBe('Login is required');
    }
  });

  it('should convert an "invalid_grant" error into a CredentialsManagerError with type "RENEW_FAILED"', async () => {
    const spaJsError = {
      error: 'invalid_grant',
      error_description: 'Invalid refresh token',
    };
    mockSpaClient.getTokenSilently.mockRejectedValue(spaJsError);
    await expect(manager.getCredentials()).rejects.toThrow(
      CredentialsManagerError
    );
    try {
      await manager.getCredentials();
    } catch (e) {
      const err = e as CredentialsManagerError;
      expect(err.type).toBe('RENEW_FAILED');
    }
  });

  it('should convert a "consent_required" error into a CredentialsManagerError with type "RENEW_FAILED"', async () => {
    const spaJsError = {
      error: 'consent_required',
      error_description: 'User consent is required',
    };
    mockSpaClient.getTokenSilently.mockRejectedValue(spaJsError);
    await expect(manager.getCredentials()).rejects.toThrow(
      CredentialsManagerError
    );
    try {
      await manager.getCredentials();
    } catch (e) {
      const err = e as CredentialsManagerError;
      expect(err.type).toBe('RENEW_FAILED');
    }
  });
});
