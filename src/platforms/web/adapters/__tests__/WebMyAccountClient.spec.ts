import { WebMyAccountClient } from '../WebMyAccountClient';
import {
  MyAccountError,
  MyAccountErrorCodes,
  PasskeyError,
  PasskeyErrorCodes,
} from '../../../../core/models';

const mockApiInstance = {
  getFactors: jest.fn(),
  getAuthenticationMethods: jest.fn(),
  getAuthenticationMethod: jest.fn(),
  updateAuthenticationMethod: jest.fn(),
  deleteAuthenticationMethod: jest.fn(),
  enrollmentChallenge: jest.fn(),
  enrollmentVerify: jest.fn(),
};

jest.mock('@auth0/auth0-spa-js', () => {
  class MyAccountApiError extends Error {
    type: string;
    status: number;
    title: string;
    detail: string;
    validation_errors?: unknown;
    constructor(body: any) {
      super(body.detail);
      this.name = 'MyAccountApiError';
      this.type = body.type;
      this.status = body.status;
      this.title = body.title;
      this.detail = body.detail;
      this.validation_errors = body.validation_errors;
    }
  }
  return {
    Auth0Client: jest.fn(),
    MyAccountApiClient: jest.fn(() => mockApiInstance),
    MyAccountApiError,
  };
});

const {
  MyAccountApiClient,
  MyAccountApiError,
} = require('@auth0/auth0-spa-js');

const DOMAIN = 'example.auth0.com';
const API_BASE = `https://${DOMAIN}/me/`;
const TOKEN = 'access-token-123';

describe('WebMyAccountClient', () => {
  let createFetcher: jest.Mock;
  let fetcherStub: object;
  let spaClient: any;

  const makeClient = (useDPoP = true) => {
    fetcherStub = { id: 'fetcher' };
    createFetcher = jest.fn().mockReturnValue(fetcherStub);
    spaClient = { createFetcher };
    return new WebMyAccountClient(spaClient, DOMAIN, useDPoP);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetcher configuration', () => {
    it('overrides getAccessToken with the passed token and sets dpopNonceId when useDPoP', async () => {
      const client = makeClient(true);
      mockApiInstance.getFactors.mockResolvedValue([]);

      await client.getFactors({ accessToken: TOKEN });

      const config = createFetcher.mock.calls[0][0];
      expect(config.baseUrl).toBe(API_BASE);
      expect(config.dpopNonceId).toBe('__auth0_my_account_api__');
      await expect(config.getAccessToken()).resolves.toBe(TOKEN);
      expect(MyAccountApiClient).toHaveBeenCalledWith(fetcherStub, API_BASE);
    });

    it('omits dpopNonceId when useDPoP is false', async () => {
      const client = makeClient(false);
      mockApiInstance.getFactors.mockResolvedValue([]);

      await client.getFactors({ accessToken: TOKEN });

      const config = createFetcher.mock.calls[0][0];
      expect(config.dpopNonceId).toBeUndefined();
    });
  });

  describe('direct methods', () => {
    it('getFactors maps factors through', async () => {
      const client = makeClient();
      mockApiInstance.getFactors.mockResolvedValue([
        { type: 'phone', usage: ['secondary'] },
      ]);

      const result = await client.getFactors({ accessToken: TOKEN });

      expect(result).toEqual([{ type: 'phone', usage: ['secondary'] }]);
    });

    it('getAuthenticationMethods forwards the type filter and maps snake_case', async () => {
      const client = makeClient();
      mockApiInstance.getAuthenticationMethods.mockResolvedValue([
        {
          id: 'am_1',
          type: 'phone',
          created_at: '2024-01-01T00:00:00Z',
          usage: ['secondary'],
          phone_number: '+1555',
          preferred_authentication_method: 'sms',
        },
      ]);

      const result = await client.getAuthenticationMethods({
        accessToken: TOKEN,
        type: 'phone',
      });

      expect(mockApiInstance.getAuthenticationMethods).toHaveBeenCalledWith(
        'phone'
      );
      expect(result[0]).toMatchObject({
        id: 'am_1',
        type: 'phone',
        createdAt: '2024-01-01T00:00:00Z',
        phoneNumber: '+1555',
        preferredAuthenticationMethod: 'sms',
      });
    });

    it('updateAuthenticationMethodById maps camelCase params to snake_case body', async () => {
      const client = makeClient();
      mockApiInstance.updateAuthenticationMethod.mockResolvedValue({
        id: 'am_1',
        type: 'phone',
        created_at: 'x',
        usage: [],
      });

      await client.updateAuthenticationMethodById({
        accessToken: TOKEN,
        id: 'am_1',
        name: 'My Phone',
        preferredAuthenticationMethod: 'voice',
      });

      expect(mockApiInstance.updateAuthenticationMethod).toHaveBeenCalledWith(
        'am_1',
        { name: 'My Phone', preferred_authentication_method: 'voice' }
      );
    });

    it('deleteAuthenticationMethodById delegates by id', async () => {
      const client = makeClient();
      mockApiInstance.deleteAuthenticationMethod.mockResolvedValue(undefined);

      await client.deleteAuthenticationMethodById({
        accessToken: TOKEN,
        id: 'am_1',
      });

      expect(mockApiInstance.deleteAuthenticationMethod).toHaveBeenCalledWith(
        'am_1'
      );
    });
  });

  describe('enrollment challenges', () => {
    it('enrollPhone maps request + response', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentChallenge.mockResolvedValue({
        id: 'am_1',
        auth_session: 'sess',
      });

      const result = await client.enrollPhone({
        accessToken: TOKEN,
        phoneNumber: '+1555',
        preferredAuthenticationMethod: 'sms',
      });

      expect(mockApiInstance.enrollmentChallenge).toHaveBeenCalledWith({
        type: 'phone',
        phone_number: '+1555',
        preferred_authentication_method: 'sms',
      });
      expect(result).toEqual({ id: 'am_1', authSession: 'sess' });
    });

    it('enrollTOTP maps barcode fields', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentChallenge.mockResolvedValue({
        id: 'am_2',
        auth_session: 'sess',
        barcode_uri: 'otpauth://x',
        manual_input_code: 'ABCD',
      });

      const result = await client.enrollTOTP({ accessToken: TOKEN });

      expect(result).toEqual({
        id: 'am_2',
        authSession: 'sess',
        barcodeUri: 'otpauth://x',
        manualInputCode: 'ABCD',
      });
    });

    it('enrollRecoveryCode maps recovery code', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentChallenge.mockResolvedValue({
        id: 'am_3',
        auth_session: 'sess',
        recovery_code: 'REC-123',
      });

      const result = await client.enrollRecoveryCode({ accessToken: TOKEN });

      expect(result).toEqual({
        id: 'am_3',
        authSession: 'sess',
        recoveryCode: 'REC-123',
      });
    });

    it('passkeyEnrollmentChallenge maps identity + response fields', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentChallenge.mockResolvedValue({
        id: 'am_4',
        auth_session: 'sess',
        authn_params_public_key: { challenge: 'abc' },
      });

      const result = await client.passkeyEnrollmentChallenge({
        accessToken: TOKEN,
        userIdentity: 'user_1',
        connection: 'conn',
      });

      expect(mockApiInstance.enrollmentChallenge).toHaveBeenCalledWith({
        type: 'passkey',
        connection: 'conn',
        identity_user_id: 'user_1',
      });
      expect(result).toEqual({
        authenticationMethodId: 'am_4',
        authSession: 'sess',
        authParamsPublicKey: { challenge: 'abc' },
      });
    });
  });

  describe('enrollment verify (location reconstruction)', () => {
    it('confirmPhoneEnrollment reconstructs location from id', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentVerify.mockResolvedValue({
        id: 'am_1',
        type: 'phone',
        created_at: 'x',
        usage: [],
      });

      await client.confirmPhoneEnrollment({
        accessToken: TOKEN,
        id: 'am_1',
        authSession: 'sess',
        otpCode: '000000',
      });

      expect(mockApiInstance.enrollmentVerify).toHaveBeenCalledWith({
        type: 'phone',
        location: `${API_BASE}v1/authentication-methods/am_1`,
        auth_session: 'sess',
        otp_code: '000000',
      });
    });

    it('confirmRecoveryCodeEnrollment omits otp_code', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentVerify.mockResolvedValue({
        id: 'am_3',
        type: 'recovery-code',
        created_at: 'x',
        usage: [],
      });

      await client.confirmRecoveryCodeEnrollment({
        accessToken: TOKEN,
        id: 'am_3',
        authSession: 'sess',
      });

      expect(mockApiInstance.enrollmentVerify).toHaveBeenCalledWith({
        type: 'recovery-code',
        location: `${API_BASE}v1/authentication-methods/am_3`,
        auth_session: 'sess',
      });
    });

    it('enrollPasskey parses authResponse and maps passkey fields', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentVerify.mockResolvedValue({
        id: 'pk_1',
        type: 'passkey',
        created_at: '2024-01-01',
        identity_user_id: 'user_1',
        key_id: 'key_1',
        public_key: 'pub',
        user_handle: 'handle',
        credential_device_type: 'multi_device',
        credential_backed_up: true,
        aaguid: 'guid',
        relying_party_id: 'rp',
      });

      const result = await client.enrollPasskey({
        accessToken: TOKEN,
        authenticationMethodId: 'pk_1',
        authSession: 'sess',
        authResponse: '{"id":"cred"}',
        authParamsPublicKey: {},
      });

      const verifyArg = mockApiInstance.enrollmentVerify.mock.calls[0][0];
      expect(verifyArg.type).toBe('passkey');
      expect(verifyArg.location).toBe(
        `${API_BASE}v1/authentication-methods/pk_1`
      );
      expect(verifyArg.authn_response).toEqual({ id: 'cred' });
      expect(result).toMatchObject({
        id: 'pk_1',
        userIdentityId: 'user_1',
        keyId: 'key_1',
        credentialBackedUp: true,
      });
    });
  });

  describe('error translation', () => {
    it('wraps MyAccountApiError into MyAccountError with parsed fields', async () => {
      const client = makeClient();
      mockApiInstance.getFactors.mockRejectedValue(
        new MyAccountApiError({
          type: 'https://auth0.com/api-errors/A0E-401',
          status: 401,
          title: 'Unauthorized',
          detail: 'Token expired',
        })
      );

      await expect(client.getFactors({ accessToken: TOKEN })).rejects.toThrow(
        MyAccountError
      );

      try {
        await client.getFactors({ accessToken: TOKEN });
      } catch (e) {
        const err = e as MyAccountError;
        expect(err.statusCode).toBe(401);
        expect(err.title).toBe('Unauthorized');
        expect(err.detail).toBe('Token expired');
        // `type` is the normalized, cross-platform code; the raw RFC 7807 type
        // URI stays available on `typeUri`.
        expect(err.type).toBe(MyAccountErrorCodes.UNAUTHORIZED);
        expect(err.typeUri).toBe('https://auth0.com/api-errors/A0E-401');
      }
    });

    it('wraps passkey challenge errors into PasskeyError with CHALLENGE_FAILED type', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentChallenge.mockRejectedValue(
        new MyAccountApiError({
          type: 'https://auth0.com/api-errors/A0E-400-0001',
          status: 400,
          title: 'Bad Request',
          detail: 'nope',
        })
      );

      await expect(
        client.passkeyEnrollmentChallenge({ accessToken: TOKEN })
      ).rejects.toMatchObject({
        constructor: PasskeyError,
        type: PasskeyErrorCodes.CHALLENGE_FAILED,
      });
    });

    it('wraps passkey verify errors into PasskeyError with EXCHANGE_FAILED type', async () => {
      const client = makeClient();
      mockApiInstance.enrollmentVerify.mockRejectedValue(
        new MyAccountApiError({
          type: 'https://auth0.com/api-errors/A0E-400-0002',
          status: 400,
          title: 'Bad Request',
          detail: 'nope',
        })
      );

      await expect(
        client.enrollPasskey({
          accessToken: TOKEN,
          authenticationMethodId: 'am_1',
          authSession: 'sess_1',
          authResponse: '{}',
        })
      ).rejects.toMatchObject({
        constructor: PasskeyError,
        type: PasskeyErrorCodes.EXCHANGE_FAILED,
      });
    });

    it('rethrows non-MyAccountApiError errors unchanged', async () => {
      const client = makeClient();
      const boom = new Error('network down');
      mockApiInstance.getFactors.mockRejectedValue(boom);

      await expect(client.getFactors({ accessToken: TOKEN })).rejects.toBe(
        boom
      );
    });
  });
});
