import { Auth0ClientFactory } from '../Auth0ClientFactory.web';
import type { WebAuth0Client } from '../../platforms/web';

// A real Auth0Client won't construct on jsdom's insecure origin, and we need a
// distinct object per construction to tell shared instances apart.
jest.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: jest.fn().mockImplementation(() => ({ mfa: {}, passkey: {} })),
}));

const options = {
  domain: 'tenant-a.us.auth0.com',
  clientId: 'client-a',
  useDPoP: false,
};

const spaClientOf = (client: unknown) => (client as WebAuth0Client).client;

describe('Auth0ClientFactory (web) in a browser', () => {
  beforeEach(() => {
    Auth0ClientFactory.resetClientCache();
  });

  it('reuses the cached client when the config has not changed', () => {
    const first = Auth0ClientFactory.createClient(options);
    const second = Auth0ClientFactory.createClient(options);

    expect(second).toBe(first);
  });

  it('creates a new client when the config signature changes', () => {
    const tenantA = Auth0ClientFactory.createClient(options);
    const tenantB = Auth0ClientFactory.createClient({
      ...options,
      domain: 'tenant-b.eu.auth0.com',
    });

    expect(tenantB).not.toBe(tenantA);
  });

  it('gives the new client its own spa-js client', () => {
    const tenantA = Auth0ClientFactory.createClient(options);
    const tenantB = Auth0ClientFactory.createClient({
      ...options,
      domain: 'tenant-b.eu.auth0.com',
    });

    expect(spaClientOf(tenantB)).not.toBe(spaClientOf(tenantA));
  });
});
