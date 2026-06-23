import { getConfigSignature } from '../configSignature';
import type { Auth0Options } from '../../../types';

describe('getConfigSignature', () => {
  const base: Auth0Options = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  it('produces the same signature for identical configs', () => {
    expect(getConfigSignature(base)).toBe(getConfigSignature({ ...base }));
  });

  it('is insensitive to top-level key order', () => {
    const a = getConfigSignature({
      domain: 'd',
      clientId: 'c',
    } as Auth0Options);
    const b = getConfigSignature({
      clientId: 'c',
      domain: 'd',
    } as Auth0Options);
    expect(a).toBe(b);
  });

  it('is insensitive to nested object key order', () => {
    const a = getConfigSignature({
      ...base,
      localAuthenticationOptions: {
        title: 'A',
        evaluationPolicy: 1,
      } as Auth0Options['localAuthenticationOptions'],
    });
    const b = getConfigSignature({
      ...base,
      localAuthenticationOptions: {
        evaluationPolicy: 1,
        title: 'A',
      } as Auth0Options['localAuthenticationOptions'],
    });
    expect(a).toBe(b);
  });

  it('differs when domain changes', () => {
    expect(getConfigSignature(base)).not.toBe(
      getConfigSignature({ ...base, domain: 'other.auth0.com' })
    );
  });

  it('differs when clientId changes', () => {
    expect(getConfigSignature(base)).not.toBe(
      getConfigSignature({ ...base, clientId: 'Other' })
    );
  });

  it('differs when useDPoP changes', () => {
    expect(getConfigSignature({ ...base, useDPoP: true })).not.toBe(
      getConfigSignature({ ...base, useDPoP: false })
    );
  });

  it('differs when timeout changes', () => {
    expect(getConfigSignature({ ...base, timeout: 1000 })).not.toBe(
      getConfigSignature({ ...base, timeout: 2000 })
    );
  });

  it('is unaffected by headers (not part of client identity)', () => {
    expect(getConfigSignature({ ...base, headers: { A: '1' } })).toBe(
      getConfigSignature({ ...base, headers: { A: '2' } })
    );
  });

  it('is unaffected by maxRetries (not part of client identity)', () => {
    expect(getConfigSignature({ ...base, maxRetries: 0 })).toBe(
      getConfigSignature({ ...base, maxRetries: 3 })
    );
  });
});
