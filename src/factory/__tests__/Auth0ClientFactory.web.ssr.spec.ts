/**
 * @jest-environment node
 */
import { Auth0ClientFactory } from '../Auth0ClientFactory.web';
import type { WebAuth0Client } from '../../platforms/web';

const options = {
  domain: 'tenant-a.us.auth0.com',
  clientId: 'client-a',
  useDPoP: false,
};

const spaClientOf = (client: unknown) => (client as WebAuth0Client).client;

describe('Auth0ClientFactory (web) outside a browser', () => {
  it('runs without browser globals', () => {
    expect(typeof window).toBe('undefined');
  });

  it('creates a new client on every call', () => {
    const first = Auth0ClientFactory.createClient(options);
    const second = Auth0ClientFactory.createClient(options);

    expect(second).not.toBe(first);
  });

  it('does not share the spa-js client, so token caches stay separate', () => {
    const first = Auth0ClientFactory.createClient(options);
    const second = Auth0ClientFactory.createClient(options);

    expect(spaClientOf(second)).not.toBe(spaClientOf(first));
  });

  it('does not share the spa-js client across tenants', () => {
    const tenantA = Auth0ClientFactory.createClient(options);
    const tenantB = Auth0ClientFactory.createClient({
      domain: 'tenant-b.eu.auth0.com',
      clientId: 'client-b',
      useDPoP: false,
    });

    expect(spaClientOf(tenantB)).not.toBe(spaClientOf(tenantA));
  });
});
