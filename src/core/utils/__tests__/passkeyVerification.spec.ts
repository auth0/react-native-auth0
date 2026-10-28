import {
  toVerificationCodes,
  toVerificationMethods,
} from '../passkeyVerification';
import { AuthError } from '../../models/AuthError';

describe('toVerificationMethods', () => {
  it('keeps the identifiers the SDK knows about, in order', () => {
    expect(toVerificationMethods(['phone', 'email'])).toEqual([
      'phone',
      'email',
    ]);
  });

  it('drops unknown identifiers and values that are not strings', () => {
    expect(toVerificationMethods(['email', 'username', 7, null])).toEqual([
      'email',
    ]);
  });

  it('returns undefined when nothing recognizable is left, so a caller can fall back to the original list', () => {
    expect(toVerificationMethods(['username'])).toBeUndefined();
    expect(toVerificationMethods([])).toBeUndefined();
  });

  it('returns undefined for anything that is not an array', () => {
    expect(toVerificationMethods(undefined)).toBeUndefined();
    expect(toVerificationMethods('email')).toBeUndefined();
    expect(toVerificationMethods({ 0: 'email' })).toBeUndefined();
  });
});

describe('toVerificationCodes', () => {
  it('keeps string codes for the identifiers the SDK knows about', () => {
    expect(toVerificationCodes({ email: '123456', phone: '654321' })).toEqual({
      email: '123456',
      phone: '654321',
    });
  });

  it('drops codes that are not strings', () => {
    expect(toVerificationCodes({ email: '123456', phone: undefined })).toEqual({
      email: '123456',
    });
    expect(toVerificationCodes({ email: 123456 })).toBeUndefined();
  });

  it('drops identifiers the SDK does not know about', () => {
    expect(
      toVerificationCodes({ email: '123456', username: '111111' })
    ).toEqual({
      email: '123456',
    });
    expect(toVerificationCodes({ username: '111111' })).toBeUndefined();
  });

  it('throws an InvalidParameter AuthError for an empty or whitespace-only code', () => {
    for (const verification of [
      { email: '' },
      { phone: '   ' },
      { email: '123456', phone: '\t\n' },
    ]) {
      let error: unknown;
      try {
        toVerificationCodes(verification);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(AuthError);
      expect((error as AuthError).code).toBe('InvalidParameter');
    }
  });

  it('returns undefined when there is nothing to send', () => {
    expect(toVerificationCodes(undefined)).toBeUndefined();
    expect(toVerificationCodes({})).toBeUndefined();
  });
});
