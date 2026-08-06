import Auth0 from '../Auth0';
import { Auth0ClientFactory } from '../factory/Auth0ClientFactory';

jest.mock('../factory/Auth0ClientFactory');

const MockFactory = Auth0ClientFactory as jest.Mocked<
  typeof Auth0ClientFactory
>;

describe('Auth0 deprecations', () => {
  let usersClient: { getUser: jest.Mock; patchUser: jest.Mock };
  let mockClient: { users: jest.Mock };
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    usersClient = { getUser: jest.fn(), patchUser: jest.fn() };
    mockClient = { users: jest.fn().mockReturnValue(usersClient) };
    MockFactory.createClient.mockReturnValue(mockClient as any);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('users()', () => {
    const auth0 = () =>
      new Auth0({ domain: 'test.auth0.com', clientId: 'client-id' });

    it('warns that it is deprecated and points to the replacement', () => {
      auth0().users('a-token');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const message = warnSpy.mock.calls[0]?.[0] as string;
      expect(message).toContain('`users()` is deprecated');
      expect(message).toContain('v6');
      expect(message).toContain('userInfo()');
    });

    it('still delegates to the platform client so v5 behaviour is unchanged', () => {
      const result = auth0().users('a-token', 'DPoP' as any);

      expect(mockClient.users).toHaveBeenCalledWith('a-token', 'DPoP');
      expect(result).toBe(usersClient);
    });
  });
});
