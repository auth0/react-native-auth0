import Auth0 from '../';

describe('Auth0', () => {

  describe('constructor', () => {

    it('should build with domain', () => {
      expect(new Auth0('samples.auth0.com')).not.toBeNull();
    });

    it('should make domain into https url', () => {
      const auth0 = new Auth0('samples.auth0.com');
      expect(auth0.baseUrl).toBe('https://samples.auth0.com');
    });

    it('should make use https url', () => {
      const auth0 = new Auth0('https://tenant.auth0.com');
      expect(auth0.baseUrl).toBe('https://tenant.auth0.com');
    });

    it('should fail with no domain', () => {
      expect(() => new Auth0()).toThrow('Must supply a valid Auth0 domain');
    });

  });

  describe('authentication', () => {

    const auth0 = new Auth0('samples.auth0.com');

    it('should return authentication api', () => {
      expect(auth0.authentication("CLIENT_ID")).not.toBeNull();
    });

    it('should return authentication api with domain & clientId', () => {
      const auth = auth0.authentication('CLIENT_ID');
      expect(auth.baseUrl).toBe('https://samples.auth0.com');
      expect(auth.clientId).toBe('CLIENT_ID');
    });

  });

  describe('users', () => {

    const auth0 = new Auth0('samples.auth0.com');

    it('should return users api', () => {
      expect(auth0.users('JWT TOKEN')).not.toBeNull();
    });

    it('should return users api with domain & token', () => {
      const users = auth0.users('JWT TOKEN');
      expect(users.baseUrl).toBe('https://samples.auth0.com');
      expect(users.token).toBe('JWT TOKEN');
    });

  });
});
