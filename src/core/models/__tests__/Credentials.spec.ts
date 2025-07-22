import { Credentials } from '../Credentials';
import type { NativeCredentialsResponse } from '../../../types';

describe('Credentials', () => {
  // Use a fixed date for all tests to ensure predictable `expiresAt` calculations.
  const baseTime = new Date('2023-01-01T12:00:00.000Z').getTime(); // 1672574400 seconds

  beforeEach(() => {
    // Mock `Date.now()` to return our fixed time.
    jest.spyOn(Date, 'now').mockReturnValue(baseTime);
  });

  afterEach(() => {
    // Restore the original `Date.now()` after each test.
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should correctly assign all properties from the input object', () => {
      const credsData = {
        idToken: 'id_token_123',
        accessToken: 'access_token_456',
        tokenType: 'Bearer',
        expiresAt: 1672578000, // Some time in the future
        refreshToken: 'refresh_token_789',
        scope: 'openid profile email',
      };

      const credentials = new Credentials(credsData);

      expect(credentials.idToken).toBe(credsData.idToken);
      expect(credentials.accessToken).toBe(credsData.accessToken);
      expect(credentials.tokenType).toBe(credsData.tokenType);
      expect(credentials.expiresAt).toBe(credsData.expiresAt);
      expect(credentials.refreshToken).toBe(credsData.refreshToken);
      expect(credentials.scope).toBe(credsData.scope);
    });

    it('should handle missing optional properties', () => {
      const credsData = {
        idToken: 'id_token_123',
        accessToken: 'access_token_456',
        tokenType: 'Bearer',
        expiresAt: 1672578000,
      };

      const credentials = new Credentials(credsData);

      expect(credentials.refreshToken).toBeUndefined();
      expect(credentials.scope).toBeUndefined();
    });
  });

  describe('isExpired', () => {
    it('should return false for a token that has not expired', () => {
      const credentials = new Credentials({
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 1672574400 + 3600, // Expires in 1 hour
      });
      expect(credentials.isExpired()).toBe(false);
    });

    it('should return true for a token that has expired', () => {
      const credentials = new Credentials({
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 1672574400 - 1, // Expired 1 second ago
      });
      expect(credentials.isExpired()).toBe(true);
    });

    it('should return true for a token that expires at the current exact time', () => {
      const credentials = new Credentials({
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 1672574400, // Expires exactly now
      });
      expect(credentials.isExpired()).toBe(true);
    });

    it('should return false when a leeway makes an almost-expired token valid', () => {
      const credentials = new Credentials({
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 1672574400 + 50, // Expires in 50 seconds
      });
      // A leeway of 60 seconds means we treat tokens expiring in the next 60s as expired.
      // Since our token expires in 50s, it's considered expired with this leeway.
      // Wait, let's re-read the logic. isExpired() should be true if it expires WITHIN the leeway.
      // So let's rephrase the test.
      // A token expiring in 50 seconds is NOT expired if the leeway is 30 seconds.
      expect(credentials.isExpired(30)).toBe(false);
    });

    it('should return true when a leeway makes a soon-to-expire token invalid', () => {
      const credentials = new Credentials({
        idToken: 'a',
        accessToken: 'b',
        tokenType: 'c',
        expiresAt: 1672574400 + 50, // Expires in 50 seconds
      });
      // A leeway of 60 seconds means we treat tokens expiring in the next 60s as expired.
      // Since our token expires in 50s, it falls within this window and is considered expired.
      expect(credentials.isExpired(60)).toBe(true);
    });
  });

  describe('fromResponse', () => {
    it('should correctly convert expires_in to a future expiresAt timestamp', () => {
      const serverResponse: NativeCredentialsResponse = {
        id_token: 'id_token_123',
        access_token: 'access_token_456',
        token_type: 'Bearer',
        expires_in: 3600, // Expires in 1 hour
        refresh_token: 'refresh_token_789',
        scope: 'openid profile',
      };

      const credentials = Credentials.fromResponse(serverResponse);

      const expectedExpiresAt = baseTime / 1000 + 3600;

      expect(credentials).toBeInstanceOf(Credentials);
      expect(credentials.idToken).toBe(serverResponse.id_token);
      expect(credentials.accessToken).toBe(serverResponse.access_token);
      expect(credentials.tokenType).toBe(serverResponse.token_type);
      expect(credentials.refreshToken).toBe(serverResponse.refresh_token);
      expect(credentials.scope).toBe(serverResponse.scope);
      expect(credentials.expiresAt).toBe(expectedExpiresAt);
    });

    it('should handle a response with no optional fields', () => {
      const serverResponse: NativeCredentialsResponse = {
        id_token: 'id_token_123',
        access_token: 'access_token_456',
        token_type: 'Bearer',
        expires_in: 7200,
        refresh_token: undefined,
        scope: undefined,
      };

      const credentials = Credentials.fromResponse(serverResponse);

      expect(credentials.refreshToken).toBeUndefined();
      expect(credentials.scope).toBeUndefined();
    });
  });
});
