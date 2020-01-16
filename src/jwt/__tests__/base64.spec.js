import * as base64 from '../base64';

describe('helpers base64 url', function() {
  it('padding', function() {
    expect(base64.padding('')).toBe('');
    expect(base64.padding('a')).toBe('a===');
    expect(base64.padding('ab')).toBe('ab==');
    expect(base64.padding('abc')).toBe('abc=');
    expect(base64.padding('abcd')).toBe('abcd');
    expect(base64.padding('abced')).toBe('abced===');
    expect(base64.padding(base64.padding('abc'))).toBe('abc=');
  });

  it('decode to hex', function() {
    expect(base64.decodeToHEX('AQAB')).toBe('010001');
  });
});
