import { Auth0Client, PasskeyGetTokenError } from '@auth0/auth0-spa-js';
import { WebAuth0Client } from '../WebAuth0Client';
import { WebWebAuthProvider } from '../WebWebAuthProvider';
import { WebCredentialsManager } from '../WebCredentialsManager';
import { AuthenticationOrchestrator } from '../../../../core/services';
import { HttpClient } from '../../../../core/services/HttpClient';
import { PasskeyError, PasskeyErrorCodes } from '../../../../core/models';

// Unlike WebAuth0Client.spec.ts, this spec does NOT mock core/models, and it throws
// the real auth0-spa-js error classes. It exercises the adapter's error mapping and
// the real PasskeyError together, so a change in the shape of a spa-js error shows
// up here and not only in a user's app.
jest.mock('@auth0/auth0-spa-js', () => ({
  ...jest.requireActual('@auth0/auth0-spa-js'),
  Auth0Client: jest.fn(),
}));
jest.mock('../WebWebAuthProvider');
jest.mock('../WebCredentialsManager');
jest.mock('../../../../core/services/AuthenticationOrchestrator');
jest.mock('../../../../core/services/HttpClient');

describe('WebAuth0Client passkey identifier verification (real PasskeyError)', () => {
  let client: WebAuth0Client;
  let spaPasskey: {
    getSignupChallenge: jest.Mock;
    getTokenWithPasskey: jest.Mock;
  };

  const credential = { id: 'credential-id' } as any;
  const exchange = () =>
    client
      .getTokenByPasskey({
        authSession: 'session-1',
        authResponse: credential,
        verification: { email: '000000' },
      })
      .catch((e: unknown) => e as PasskeyError);

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.example.com' },
      writable: true,
      configurable: true,
    });

    spaPasskey = {
      getSignupChallenge: jest.fn(),
      getTokenWithPasskey: jest.fn(),
    };
    (Auth0Client as unknown as jest.Mock).mockImplementation(() => ({
      passkey: spaPasskey,
    }));
    (HttpClient as unknown as jest.Mock).mockImplementation(() => ({}));
    (AuthenticationOrchestrator as unknown as jest.Mock).mockImplementation(
      () => ({})
    );
    (WebWebAuthProvider as unknown as jest.Mock).mockImplementation(() => ({}));
    (WebCredentialsManager as unknown as jest.Mock).mockImplementation(
      () => ({})
    );

    client = new WebAuth0Client({
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
    });
  });

  it('maps a retryable spa-js PasskeyGetTokenError to a PasskeyError that carries the retry payload', async () => {
    spaPasskey.getTokenWithPasskey.mockRejectedValue(
      new PasskeyGetTokenError('Invalid or expired session', {
        error: 'invalid_grant',
        error_description: 'Invalid or expired session',
        auth_session: 'session-2',
        verification_required: ['email'],
      })
    );

    const error = await exchange();

    expect(error).toBeInstanceOf(PasskeyError);
    expect(error.type).toBe(PasskeyErrorCodes.VERIFICATION_RETRYABLE);
    expect(error.getVerificationRetryPayload()).toEqual({
      authSession: 'session-2',
      verificationRequired: ['email'],
    });
  });

  it('keeps a PasskeyGetTokenError that is not retryable as PASSKEY_EXCHANGE_FAILED, with no payload', async () => {
    spaPasskey.getTokenWithPasskey.mockRejectedValue(
      new PasskeyGetTokenError('Access denied', {
        error: 'access_denied',
        error_description: 'Access denied',
      })
    );

    const error = await exchange();

    expect(error).toBeInstanceOf(PasskeyError);
    expect(error.type).toBe(PasskeyErrorCodes.EXCHANGE_FAILED);
    expect(error.getVerificationRetryPayload()).toBeNull();
  });

  it('rejects an empty or whitespace-only code with PASSKEY_INVALID_PARAMETER before calling spa-js', async () => {
    for (const verification of [{ email: '' }, { phone: '  ' }]) {
      const error = await client
        .getTokenByPasskey({
          authSession: 'session-1',
          authResponse: credential,
          verification,
        })
        .catch((e: unknown) => e as PasskeyError);

      expect(error).toBeInstanceOf(PasskeyError);
      expect(error.type).toBe(PasskeyErrorCodes.INVALID_PARAMETER);
      expect(error.getVerificationRetryPayload()).toBeNull();
    }
    expect(spaPasskey.getTokenWithPasskey).not.toHaveBeenCalled();
  });

  it('returns the identifiers to verify from the signup challenge, without the ones it does not know', async () => {
    spaPasskey.getSignupChallenge.mockResolvedValue({
      authSession: 'session-1',
      publicKey: { challenge: 'abc' },
      verificationRequired: ['email', 'phone', 'username'],
    });

    const challenge = await client.passkeySignupChallenge({
      email: 'user@example.com',
      phoneNumber: '+15551234567',
      deliveryMethod: 'voice',
    });

    expect(challenge.verificationRequired).toEqual(['email', 'phone']);
    expect(spaPasskey.getSignupChallenge).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryMethod: 'voice' })
    );
  });
});
