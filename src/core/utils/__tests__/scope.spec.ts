import { finalizeScope } from '../scope';

describe('finalizeScope', () => {
  it('should return default scopes when input is undefined', () => {
    const result = finalizeScope(undefined);
    // The order of default scopes doesn't matter, but the content does.
    // We split and sort for a reliable test.
    expect(result.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
  });

  it('should return default scopes when input is an empty string', () => {
    const result = finalizeScope('');
    expect(result.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
  });

  it('should return default scopes when input is only whitespace', () => {
    const result = finalizeScope('   ');
    expect(result.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
  });

  it('should add "openid" to a scope string that does not contain it', () => {
    const result = finalizeScope('read:messages');
    expect(result.split(' ').sort()).toEqual(['openid', 'read:messages']);
  });

  it('should not add "openid" if it is already present', () => {
    const result = finalizeScope('openid read:messages');
    expect(result.split(' ').sort()).toEqual(['openid', 'read:messages']);
  });

  it('should not add "openid" if it is already present with other default scopes', () => {
    const result = finalizeScope('openid profile write:items');
    expect(result.split(' ').sort()).toEqual([
      'openid',
      'profile',
      'write:items',
    ]);
  });

  it('should handle extra whitespace in the input string', () => {
    const result = finalizeScope('  openid   read:data  write:data ');
    expect(result.split(' ').sort()).toEqual([
      'openid',
      'read:data',
      'write:data',
    ]);
  });

  it('should not add default "profile" and "email" if other scopes are provided', () => {
    const result = finalizeScope('read:appointments');
    // It should ONLY add openid, not the other defaults.
    expect(result.split(' ').sort()).toEqual(['openid', 'read:appointments']);
    expect(result).not.toContain('profile');
    expect(result).not.toContain('email');
  });

  it('should handle being given all default scopes plus custom ones', () => {
    const result = finalizeScope('openid profile email read:stuff');
    expect(result.split(' ').sort()).toEqual([
      'email',
      'openid',
      'profile',
      'read:stuff',
    ]);
  });
});
