import { NativeMyAccountClient } from '../NativeMyAccountClient';
import type { NativeBridge } from '../../bridge';
import {
  AuthError,
  MyAccountError,
  MyAccountErrorCodes,
} from '../../../../core/models';

const TOKEN = 'access-token-123';

const profile = {
  givenName: 'Jane',
  nickname: 'jane',
  profilePolicy: {
    '/given_name': {
      access: 'read_only',
      source: 'idp',
      reason: 'managed_by_identity_provider',
    },
  },
};

describe('NativeMyAccountClient', () => {
  let bridge: jest.Mocked<
    Pick<NativeBridge, 'getUserProfile' | 'updateUserProfile'>
  >;
  let client: NativeMyAccountClient;

  beforeEach(() => {
    bridge = {
      getUserProfile: jest.fn(),
      updateUserProfile: jest.fn(),
    };
    client = new NativeMyAccountClient(bridge as unknown as NativeBridge);
  });

  describe('getUserProfile', () => {
    it('defaults to every field and includeFields true', async () => {
      bridge.getUserProfile.mockResolvedValue(profile);

      const result = await client.getUserProfile({ accessToken: TOKEN });

      expect(bridge.getUserProfile).toHaveBeenCalledWith(
        TOKEN,
        undefined,
        true
      );
      expect(result).toEqual(profile);
    });

    it('passes fields and includeFields', async () => {
      bridge.getUserProfile.mockResolvedValue(profile);

      await client.getUserProfile({
        accessToken: TOKEN,
        fields: ['profile_policy'],
        includeFields: false,
      });

      expect(bridge.getUserProfile).toHaveBeenCalledWith(
        TOKEN,
        ['profile_policy'],
        false
      );
    });

    it('treats empty fields as every field', async () => {
      bridge.getUserProfile.mockResolvedValue(profile);

      await client.getUserProfile({ accessToken: TOKEN, fields: [] });

      expect(bridge.getUserProfile).toHaveBeenCalledWith(
        TOKEN,
        undefined,
        true
      );
    });

    it('wraps bridge errors in a MyAccountError', async () => {
      bridge.getUserProfile.mockRejectedValue(
        new AuthError(
          'AuthError',
          JSON.stringify({ title: 'Forbidden', statusCode: 403 }),
          { code: 'https://auth0.com/api-errors/A0E-403-0002' }
        )
      );

      await expect(
        client.getUserProfile({ accessToken: TOKEN })
      ).rejects.toMatchObject({
        constructor: MyAccountError,
        type: MyAccountErrorCodes.UNAUTHORIZED,
        statusCode: 403,
      });
    });

    it('rethrows non-AuthError errors unchanged', async () => {
      const boom = new Error('boom');
      bridge.getUserProfile.mockRejectedValue(boom);

      await expect(client.getUserProfile({ accessToken: TOKEN })).rejects.toBe(
        boom
      );
    });
  });

  describe('updateUserProfile', () => {
    it('passes every editable field in order', async () => {
      bridge.updateUserProfile.mockResolvedValue(profile);

      const result = await client.updateUserProfile({
        accessToken: TOKEN,
        givenName: 'Jane',
        familyName: 'Doe',
        name: 'Jane Doe',
        nickname: 'jane',
        picture: 'https://example.com/jane.png',
      });

      expect(bridge.updateUserProfile).toHaveBeenCalledWith(
        TOKEN,
        'Jane',
        'Doe',
        'Jane Doe',
        'jane',
        'https://example.com/jane.png'
      );
      expect(result).toEqual(profile);
    });

    it('sends missing fields as null and keeps empty strings', async () => {
      bridge.updateUserProfile.mockResolvedValue(profile);

      await client.updateUserProfile({ accessToken: TOKEN, nickname: '' });

      expect(bridge.updateUserProfile).toHaveBeenCalledWith(
        TOKEN,
        null,
        null,
        null,
        '',
        null
      );
    });

    it('still calls the bridge when no field is provided', async () => {
      bridge.updateUserProfile.mockResolvedValue(profile);

      await client.updateUserProfile({ accessToken: TOKEN });

      expect(bridge.updateUserProfile).toHaveBeenCalledWith(
        TOKEN,
        null,
        null,
        null,
        null,
        null
      );
    });

    it('surfaces validation errors from the native error', async () => {
      const validationErrors = [
        { detail: 'given_name is read-only', pointer: '/given_name' },
      ];
      bridge.updateUserProfile.mockRejectedValue(
        new AuthError(
          'AuthError',
          JSON.stringify({
            title: 'Bad Request',
            detail: 'Invalid request',
            statusCode: 400,
            validationErrors,
          }),
          { code: 'https://auth0.com/api-errors/A0E-400-0001' }
        )
      );

      await expect(
        client.updateUserProfile({ accessToken: TOKEN, givenName: 'Jane' })
      ).rejects.toMatchObject({
        constructor: MyAccountError,
        type: MyAccountErrorCodes.INVALID_REQUEST,
        validationErrors,
      });
    });
  });
});
