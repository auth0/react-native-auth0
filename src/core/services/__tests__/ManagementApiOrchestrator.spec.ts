import { ManagementApiOrchestrator } from '../ManagementApiOrchestrator';
import { HttpClient } from '../HttpClient';
import { AuthError, Auth0User } from '../../models';

jest.mock('../HttpClient');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

const baseUrl = 'https://samples.auth0.com';
const managementToken = 'a.management.api.token';
const userId = 'auth0|53b995f8bce68d9fc900099c';

// This response now includes `user_id` as the Management API does.
const userProfileResponse = {
  user_id: 'auth0|53b995f8bce68d9fc900099c',
  email: 'info@auth0.com',
  name: 'John Doe',
  nickname: 'johnny',
  picture: 'https://example.com/pic.jpg',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe',
  },
  app_metadata: {
    plan: 'premium',
  },
};

const managementApiErrorResponse = {
  statusCode: 403,
  error: 'Forbidden',
  message: 'User to be acted on does not match subject in bearer token.',
  code: 'unowned_resource',
};

describe('ManagementApiOrchestrator', () => {
  let orchestrator: ManagementApiOrchestrator;
  let mockHttpClientInstance: jest.Mocked<HttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHttpClientInstance = new MockHttpClient({ baseUrl });
    orchestrator = new ManagementApiOrchestrator({
      token: managementToken,
      httpClient: mockHttpClientInstance,
    });
  });

  describe('getUser', () => {
    it('should call the http client with the correct path and authorization header', async () => {
      mockHttpClientInstance.get.mockResolvedValue({
        json: userProfileResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.getUser({ id: userId });
      expect(mockHttpClientInstance.get).toHaveBeenCalledWith(
        `/api/v2/users/${encodeURIComponent(userId)}`,
        undefined,
        { Authorization: `Bearer ${managementToken}` }
      );
    });

    it('should return a successful response as an Auth0User model', async () => {
      mockHttpClientInstance.get.mockResolvedValue({
        json: userProfileResponse,
        response: new Response(null, { status: 200 }),
      });
      const user = await orchestrator.getUser({ id: userId });

      expect(user).toBeInstanceOf(Auth0User);
      // Assert that the mapping from `user_id` to `sub` was successful
      expect(user.sub).toBe(userProfileResponse.user_id);
      expect(user.email).toBe(userProfileResponse.email);
      // Assert that camelCasing worked for nested objects
      expect(user.userMetadata).toEqual({ firstName: 'John', lastName: 'Doe' });
    });

    it('should handle a management API error', async () => {
      mockHttpClientInstance.get.mockResolvedValue({
        json: managementApiErrorResponse,
        response: new Response(null, { status: 403 }),
      });

      await expect(orchestrator.getUser({ id: userId })).rejects.toMatchObject({
        name: 'Forbidden',
        message: 'User to be acted on does not match subject in bearer token.',
        status: 403,
        code: 'unowned_resource',
      });
    });
  });

  describe('patchUser', () => {
    const metadataToPatch = {
      first_name: 'John-updated',
      last_name: 'Doe-updated',
    };

    it('should call the http client with the correct path, body, and authorization header', async () => {
      mockHttpClientInstance.patch.mockResolvedValue({
        json: userProfileResponse,
        response: new Response(null, { status: 200 }),
      });
      await orchestrator.patchUser({ id: userId, metadata: metadataToPatch });

      expect(mockHttpClientInstance.patch).toHaveBeenCalledWith(
        `/api/v2/users/${encodeURIComponent(userId)}`,
        { user_metadata: metadataToPatch },
        { Authorization: `Bearer ${managementToken}` }
      );
    });

    it('should return the updated user profile on success', async () => {
      const updatedProfile = {
        ...userProfileResponse,
        user_metadata: { firstName: 'John-updated', lastName: 'Doe-updated' },
      };
      mockHttpClientInstance.patch.mockResolvedValue({
        json: updatedProfile,
        response: new Response(null, { status: 200 }),
      });

      const user = await orchestrator.patchUser({
        id: userId,
        metadata: metadataToPatch,
      });

      expect(user).toBeInstanceOf(Auth0User);
      expect(user.userMetadata).toEqual({
        firstName: 'John-updated',
        lastName: 'Doe-updated',
      });
    });

    it('should handle a management API error', async () => {
      // FIX: The mock now resolves with a non-ok response.
      mockHttpClientInstance.patch.mockResolvedValue({
        json: managementApiErrorResponse,
        response: new Response(null, { status: 403 }),
      });

      await expect(
        orchestrator.patchUser({ id: userId, metadata: metadataToPatch })
      ).rejects.toThrow(AuthError);
    });
  });
});
