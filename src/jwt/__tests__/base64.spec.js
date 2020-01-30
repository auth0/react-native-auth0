import * as base64 from '../base64';

describe('helpers base64 url', function() {
  describe('padding', function() {
    it('does not add to multiple of 4', function() {
      expect(base64.padding('')).toBe('');
      expect(base64.padding('abcd')).toBe('abcd');
    });
    it('adds to non multiple of 4', function() {
      expect(base64.padding('a')).toBe('a===');
      expect(base64.padding('ab')).toBe('ab==');
      expect(base64.padding('abc')).toBe('abc=');
      expect(base64.padding('abced')).toBe('abced===');
    });
    it('does not change already padded value', function() {
      const padded = base64.padding('abc');
      expect(padded).toBe('abc=');
      const again = base64.padding(padded);
      expect(again).toBe('abc=');
    });
  });

  describe('decoding to hex', function() {
    it('should convert base64 input into hex output', function() {
      expect(base64.decodeToHEX('AQAB')).toBe('010001');
      expect(base64.decodeToHEX('uGbXWiK3dQTyCbX5')).toBe(
        'b866d75a22b77504f209b5f9',
      );
    });
  });
});
