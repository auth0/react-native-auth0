import { parseIdToken } from '../parseIdToken';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode');

describe('parseIdToken', () => {
  const mockJwtDecode = jwtDecode as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a User with decoded profile claims', () => {
    mockJwtDecode.mockReturnValue({
      sub: 'auth0|123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      email_verified: true,
      given_name: 'Jane',
      family_name: 'Doe',
    });

    const user = parseIdToken('mock-id-token');

    expect(user.sub).toBe('auth0|123');
    expect(user.name).toBe('Jane Doe');
    expect(user.email).toBe('jane@example.com');
    expect(user.emailVerified).toBe(true);
    expect(user.givenName).toBe('Jane');
    expect(user.familyName).toBe('Doe');
  });

  it('should exclude protocol claims', () => {
    mockJwtDecode.mockReturnValue({
      sub: 'auth0|123',
      iss: 'https://tenant.auth0.com/',
      aud: 'client-id',
      exp: 9999999999,
      iat: 1000000000,
    });

    const user = parseIdToken('mock-id-token');

    expect(user.sub).toBe('auth0|123');
    expect((user as any).iss).toBeUndefined();
    expect((user as any).aud).toBeUndefined();
    expect((user as any).exp).toBeUndefined();
    expect((user as any).iat).toBeUndefined();
  });

  it('should throw if the token is missing the sub claim', () => {
    mockJwtDecode.mockReturnValue({
      name: 'No Sub',
      email: 'nosub@example.com',
    });

    expect(() => parseIdToken('bad-token')).toThrow(
      'ID token is missing the required "sub" claim.'
    );
  });
});
