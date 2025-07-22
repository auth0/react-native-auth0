import { Auth0User } from '../Auth0User';
import { jwtDecode } from 'jwt-decode';

// Mock the jwt-decode library
jest.mock('jwt-decode');

describe('Auth0User', () => {
  const mockJwtDecode = jwtDecode as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('fromIdToken', () => {
    it('should correctly map standard OIDC claims from snake_case to camelCase', () => {
      const idTokenPayload = {
        sub: 'auth0|123456789',
        name: 'John Doe',
        given_name: 'John',
        family_name: 'Doe',
        middle_name: 'Danger',
        nickname: 'Johnny',
        preferred_username: 'john.doe',
        profile: 'https://example.com/john.doe',
        picture: 'https://example.com/john.doe.jpg',
        website: 'https://example.com',
        email: 'john.doe@example.com',
        email_verified: true,
        gender: 'male',
        birthdate: '1980-01-01',
        zoneinfo: 'America/Los_Angeles',
        locale: 'en-US',
        phone_number: '+1-555-555-5555',
        phone_number_verified: true,
        address: '123 Main St',
        updated_at: '2023-10-27T10:00:00.000Z',
      };
      mockJwtDecode.mockReturnValue(idTokenPayload);

      const user = Auth0User.fromIdToken('a-mock-id-token');

      expect(user.sub).toBe('auth0|123456789');
      expect(user.name).toBe('John Doe');
      expect(user.givenName).toBe('John');
      expect(user.familyName).toBe('Doe');
      expect(user.middleName).toBe('Danger');
      expect(user.nickname).toBe('Johnny');
      expect(user.preferredUsername).toBe('john.doe');
      expect(user.profile).toBe('https://example.com/john.doe');
      expect(user.picture).toBe('https://example.com/john.doe.jpg');
      expect(user.website).toBe('https://example.com');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.emailVerified).toBe(true);
      expect(user.gender).toBe('male');
      expect(user.birthdate).toBe('1980-01-01');
      expect(user.zoneinfo).toBe('America/Los_Angeles');
      expect(user.locale).toBe('en-US');
      expect(user.phoneNumber).toBe('+1-555-555-5555');
      expect(user.phoneNumberVerified).toBe(true);
      expect(user.address).toBe('123 Main St');
      expect(user.updatedAt).toBe('2023-10-27T10:00:00.000Z');
    });

    it('should correctly handle custom claims', () => {
      const idTokenPayload = {
        'sub': 'auth0|123456789',
        'https://my-app.example.com/roles': ['admin', 'editor'],
        'custom_claim_1': 'customValue',
        'custom_claim_2': { nested: true },
      };
      mockJwtDecode.mockReturnValue(idTokenPayload);

      const user = Auth0User.fromIdToken('a-mock-id-token');

      expect(user['https://my-app.example.com/roles']).toEqual([
        'admin',
        'editor',
      ]);
    });

    it('should ignore standard protocol claims', () => {
      const idTokenPayload = {
        sub: 'auth0|123456789',
        name: 'John Doe',
        // Protocol claims that should be ignored
        iss: 'https://my-tenant.auth0.com/',
        aud: 'my-client-id',
        exp: 1672531200,
        iat: 1672531140,
        nonce: 'a-nonce-value',
      };
      mockJwtDecode.mockReturnValue(idTokenPayload);

      const user = Auth0User.fromIdToken('a-mock-id-token');

      expect(user.iss).toBeUndefined();
      expect(user.aud).toBeUndefined();
      expect(user.exp).toBeUndefined();
      expect(user.iat).toBeUndefined();
      expect(user.nonce).toBeUndefined();
      // A standard claim should still be present
      expect(user.name).toBe('John Doe');
    });

    it('should throw an error if the ID token is missing the "sub" claim', () => {
      const invalidPayload = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      mockJwtDecode.mockReturnValue(invalidPayload);

      expect(() => Auth0User.fromIdToken('a-bad-id-token')).toThrow(
        'ID token is missing the required "sub" claim.'
      );
    });
  });

  describe('constructor', () => {
    it('should correctly assign all properties from a valid User profile object', () => {
      const profile = {
        sub: 'auth0|123456789',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        customClaim: 'a value',
      };

      const user = new Auth0User(profile);

      expect(user.sub).toBe(profile.sub);
      expect(user.name).toBe(profile.name);
      expect(user.email).toBe(profile.email);
      expect(user.customClaim).toBe(profile.customClaim);
      expect(user.givenName).toBeUndefined();
    });
  });
});
