import { deepCamelCase, toUrlQueryParams } from '../conversion';

describe('conversion utilities', () => {
  describe('deepCamelCase', () => {
    it('should convert top-level snake_case keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        email_verified: true,
      };
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: true,
      };
      expect(deepCamelCase(input)).toEqual(expected);
    });

    it('should convert nested snake_case keys to camelCase', () => {
      const input = {
        user_profile: {
          first_name: 'Jane',
          phone_number: '555-555-5555',
        },
        app_metadata: {
          plan_type: 'premium',
        },
      };
      const expected = {
        userProfile: {
          firstName: 'Jane',
          phoneNumber: '555-555-5555',
        },
        appMetadata: {
          planType: 'premium',
        },
      };
      expect(deepCamelCase(input)).toEqual(expected);
    });

    it('should convert keys in an array of objects', () => {
      const input = [
        { user_id: '123', display_name: 'user_one' },
        { user_id: '456', display_name: 'user_two' },
      ];
      const expected = [
        { userId: '123', displayName: 'user_one' },
        { userId: '456', displayName: 'user_two' },
      ];
      expect(deepCamelCase(input)).toEqual(expected);
    });

    it('should handle keys with numbers like "claim_1"', () => {
      const input = { custom_claim_1: 'value1', custom_claim_2: 'value2' };
      const expected = { customClaim1: 'value1', customClaim2: 'value2' };
      expect(deepCamelCase(input)).toEqual(expected);
    });

    it('should not modify keys that are already camelCased', () => {
      const input = {
        firstName: 'John',
        userProfile: {
          lastName: 'Doe',
        },
      };
      // It should be identical
      expect(deepCamelCase(input)).toEqual(input);
    });

    it('should return primitives, null, and undefined as-is', () => {
      expect(deepCamelCase('a string')).toBe('a string');
      expect(deepCamelCase(12345)).toBe(12345);
      expect(deepCamelCase(true)).toBe(true);
      expect(deepCamelCase(null)).toBeNull();
      expect(deepCamelCase(undefined)).toBeUndefined();
    });

    it('should handle an empty object and an empty array', () => {
      expect(deepCamelCase({})).toEqual({});
      expect(deepCamelCase([])).toEqual([]);
    });
  });

  describe('toUrlQueryParams', () => {
    it('should convert a simple object to a query string', () => {
      const params = {
        response_type: 'code',
        client_id: '12345',
        state: 'xyz',
      };
      const expected = 'response_type=code&client_id=12345&state=xyz';
      expect(toUrlQueryParams(params)).toBe(expected);
    });

    it('should correctly URL-encode special characters', () => {
      const params = {
        scope: 'openid profile email',
        redirect_uri: 'https://my-app.com/callback',
      };
      const expected =
        'scope=openid+profile+email&redirect_uri=https%3A%2F%2Fmy-app.com%2Fcallback';
      expect(toUrlQueryParams(params)).toBe(expected);
    });

    it('should ignore keys with null or undefined values', () => {
      const params = {
        scope: 'openid',
        connection: null,
        audience: undefined,
        state: 'xyz',
      };
      const expected = 'scope=openid&state=xyz';
      expect(toUrlQueryParams(params)).toBe(expected);
    });

    it('should return an empty string for an empty object', () => {
      expect(toUrlQueryParams({})).toBe('');
    });

    it('should handle numbers and booleans correctly', () => {
      const params = {
        max_age: 3600,
        ephemeral: true,
      };
      const expected = 'max_age=3600&ephemeral=true';
      expect(toUrlQueryParams(params)).toBe(expected);
    });
  });
});
