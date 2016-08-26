import UsersAPI from '../management/api';
import MockedAPI from '../test-utils/mocks';
import faker from 'faker';
import { verifyError } from '../test-utils/matchers.js';

describe('UsersAPI', () => {
  const baseUrl = faker.internet.url();
  const token = faker.random.uuid();
  const api = new MockedAPI(baseUrl);
  const userId = faker.random.uuid();
  const metadata = {
    'first_name': faker.name.firstName(),
    'last_name': faker.name.lastName()
  };

  beforeEach(() => {
    api.reset();
  });

  describe('patch', () => {

    const patch = `${baseUrl}/api/v2/users/${encodeURIComponent(userId)}`;
    const users = new UsersAPI(token, baseUrl);

    it('should fail with empty values', () => users.patch().catch(error => expect(error.message).toBe('must supply an identifier of the user to be updated')));

    it('should fail with null id', () => users.patch(null).catch(error => expect(error.message).toBe('must supply an identifier of the user to be updated')));

    it('should fail with null metadata', () => users.patch(userId, null).catch(error => expect(error.message).toBe('must supply a non empty user metadata object')));

    it('should fail with empty metadata', () => users.patch(userId, {}).catch(error => expect(error.message).toBe('must supply a non empty user metadata object')));

    it('should fail with invalid metadata', () => users.patch(userId, "invalid").catch(error => expect(error.message).toBe('must supply a non empty user metadata object')));

    it('should report api error', () => verifyError(users.patch(userId, metadata), api, 'PATCH', patch));

    it('should patch user', async () => {
      const expected = {'user_metadata': metadata};
      api.mockResponse(patch, expected, 200, 'PATCH', {'Authorization': `Bearer ${token}`});
      const user = await users.patch(userId, metadata);
      expect(user).toEqual(expected);
      expect(api.lastRequestBody(patch)).toEqual({
        'user_metadata': metadata,
      });
    });

  });

  describe('link', () => {

    const link = `${baseUrl}/api/v2/users/${encodeURIComponent(userId)}/identities`;
    const users = new UsersAPI(token, baseUrl);
    const otherUserToken = faker.random.uuid();

    it('should fail with empty values', () => users.link().catch(error => expect(error.message).toBe('must supply an identifier of the user to to link to')));

    it('should fail with null id', () => users.link(null).catch(error => expect(error.message).toBe('must supply an identifier of the user to to link to')));

    it('should fail with null other id', () => users.link(userId, null).catch(error => expect(error.message).toBe('must supply a valid token of the user to to link')));

    it('should report api error', () => verifyError(users.link(userId, otherUserToken), api, 'POST', link));

    it('should link users', async () => {
      const expected = {'user_id': userId};
      api.mockResponse(link, expected, 200, 'POST', {'Authorization': `Bearer ${token}`});
      const user = await users.link(userId, otherUserToken);
      expect(user).toEqual(expected);
      expect(api.lastRequestBody(link)).toEqual({
        'link_with': otherUserToken,
      });
    });

  });

  describe('unlink', () => {

    const users = new UsersAPI(token, baseUrl);
    const identityId = faker.random.uuid();
    const provider = faker.internet.domainName();
    const unlink = `${baseUrl}/api/v2/users/${encodeURIComponent(userId)}/identities/${encodeURIComponent(provider)}/${encodeURIComponent(identityId)}`;

    it('should fail with empty values', () => users.unlink().catch(error => expect(error.message).toBe('must provider a user identifier from where the identity will be unlinked')));

    it('should fail with null id', () => users.unlink(null).catch(error => expect(error.message).toBe('must provider a user identifier from where the identity will be unlinked')));

    it('should fail with null identity id', () => users.unlink(userId, null).catch(error => expect(error.message).toBe('must supply an identity identifier to be unlinked')));

    it('should fail with null provider name', () => users.unlink(userId, identityId, null).catch(error => expect(error.message).toBe('must supply a provider name of the identity to be unlinked')));

    it('should report api error', () => verifyError(users.unlink(userId, identityId, provider), api, 'DELETE', unlink));

    it('should unlink users', async () => {
      const expected = {'identity_id': identityId, 'provider': provider};
      api.mockResponse(unlink, expected, 200, 'DELETE', {'Authorization': `Bearer ${token}`});
      const identity = await users.unlink(userId, identityId, provider);
      expect(identity).toEqual(expected);
    });

  });

});
