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

  describe('Web Error Mappings', () => {
    const webErrorTestCases = [
      {
        code: 'login_required',
        message: 'Login is required.',
        expectedType: 'NO_CREDENTIALS',
      },
      {
        code: 'consent_required',
        message: 'Consent is required.',
        expectedType: 'RENEW_FAILED',
      },
      {
        code: 'mfa_required',
        message: 'Multi-factor authentication is required.',
        expectedType: 'RENEW_FAILED',
      },
      {
        code: 'invalid_grant',
        message: 'Invalid grant provided.',
        expectedType: 'RENEW_FAILED',
      },
      {
        code: 'invalid_refresh_token',
        message: 'Invalid refresh token.',
        expectedType: 'RENEW_FAILED',
      },
      {
        code: 'missing_refresh_token',
        message: 'Missing refresh token.',
        expectedType: 'NO_REFRESH_TOKEN',
      },
    ];

    webErrorTestCases.forEach(({ code, message, expectedType }) => {
      it(`should map ${code} to ${expectedType}`, async () => {
        const spaJsError = { error: code, error_description: message };
        mockSpaClient.getTokenSilently.mockRejectedValue(spaJsError);

        await expect(manager.getCredentials()).rejects.toThrow(
          CredentialsManagerError
        );

        try {
          await manager.getCredentials();
        } catch (e) {
          const err = e as CredentialsManagerError;
          expect(err.type).toBe(expectedType);
          expect(err.message).toBe(message);
        }
      });
    });
  });

  describe('IPSIE session_expiry ceiling', () => {
    it('should map a silent undefined token response to SESSION_EXPIRED', async () => {
      // spa-js enforces the session_expiry ceiling silently: past the ceiling
      // getTokenSilently resolves without a token rather than throwing.
      (mockSpaClient.getTokenSilently as jest.Mock).mockResolvedValue(
        undefined
      );

      await expect(manager.getCredentials()).rejects.toThrow(
        CredentialsManagerError
      );

      try {
        await manager.getCredentials();
      } catch (e) {
        const err = e as CredentialsManagerError;
        expect(err.type).toBe('SESSION_EXPIRED');
      }
    });

    it('should map a silent undefined response in getApiCredentials to SESSION_EXPIRED', async () => {
      (mockSpaClient.getTokenSilently as jest.Mock).mockResolvedValue(
        undefined
      );

      await expect(
        manager.getApiCredentials('https://api.example.com')
      ).rejects.toThrow(CredentialsManagerError);

      try {
        await manager.getApiCredentials('https://api.example.com');
      } catch (e) {
        const err = e as CredentialsManagerError;
        expect(err.type).toBe('SESSION_EXPIRED');
      }
    });
  });
});
