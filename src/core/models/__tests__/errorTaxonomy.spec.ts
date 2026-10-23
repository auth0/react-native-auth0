import { AuthError } from '../AuthError';
import { CredentialsManagerError, CredentialsManagerErrorCodes } from '../';
import { DPoPError, DPoPErrorCodes } from '../';
import { MfaError, MfaErrorCodes } from '../';
import { MyAccountError, MyAccountErrorCodes } from '../';
import { PasskeyError, PasskeyErrorCodes } from '../';
import { WebAuthError, WebAuthErrorCodes } from '../';
import { TimeoutError } from '../../utils/fetchWithTimeout';

/**
 * Structural invariants of the frozen error taxonomy.
 *
 * These assertions exist so the taxonomy cannot drift as new error classes and
 * codes are added: every class carries a normalized `type`, every code object is
 * self-consistent, and codes stay unique across classes so a `type` value maps
 * back to exactly one domain.
 */

function authError(code: string, status = 0, message = 'boom') {
  return new AuthError('AuthError', message, { status, code });
}

/**
 * Every error class in the taxonomy, with its companion codes object.
 *
 * `fromCode` builds an instance from an arbitrary wire code, and `recognized` is
 * a code that class is known to map, so the same assertions can cover both the
 * happy path and the unknown-code fallback.
 */
const TAXONOMY = [
  {
    name: 'WebAuthError',
    codes: WebAuthErrorCodes,
    fromCode: (code: string) => new WebAuthError(authError(code)),
    recognized: 'access_denied',
    unknown: WebAuthErrorCodes.UNKNOWN_ERROR,
  },
  {
    name: 'CredentialsManagerError',
    codes: CredentialsManagerErrorCodes,
    fromCode: (code: string) => new CredentialsManagerError(authError(code)),
    recognized: 'NO_CREDENTIALS',
    unknown: CredentialsManagerErrorCodes.UNKNOWN_ERROR,
  },
  {
    name: 'DPoPError',
    codes: DPoPErrorCodes,
    fromCode: (code: string) => new DPoPError(authError(code)),
    recognized: 'DPOP_PROOF_FAILED',
    unknown: DPoPErrorCodes.UNKNOWN_DPOP_ERROR,
  },
  {
    name: 'MfaError',
    codes: MfaErrorCodes,
    fromCode: (code: string) => new MfaError(authError(code)),
    recognized: 'invalid_otp',
    unknown: MfaErrorCodes.UNKNOWN_MFA_ERROR,
  },
  {
    name: 'PasskeyError',
    codes: PasskeyErrorCodes,
    fromCode: (code: string) => new PasskeyError(authError(code)),
    recognized: 'PASSKEY_CHALLENGE_FAILED',
    unknown: PasskeyErrorCodes.UNKNOWN_ERROR,
  },
  {
    name: 'MyAccountError',
    codes: MyAccountErrorCodes,
    fromCode: (code: string) => new MyAccountError(authError(code)),
    recognized: 'MY_ACCOUNT_ERROR',
    unknown: MyAccountErrorCodes.UNKNOWN_MY_ACCOUNT_ERROR,
  },
] as const;

describe('error taxonomy invariants', () => {
  describe.each(TAXONOMY)(
    '$name',
    ({ codes, fromCode, recognized, unknown }) => {
      it('extends AuthError', () => {
        expect(fromCode(recognized)).toBeInstanceOf(AuthError);
      });

      it('exposes a normalized `type` drawn from its codes object', () => {
        const values = Object.values(codes) as string[];
        expect(values).toContain(fromCode(recognized).type);
      });

      it('preserves the originating wire code separately from `type`', () => {
        // `code` is the raw platform/wire value; `type` is the normalized code.
        // Conflating them would break the cross-platform contract.
        expect(fromCode(recognized).code).toBe(recognized);
      });

      it('has a terminal unknown code for unrecognized input', () => {
        const values = Object.values(codes) as string[];
        expect(values).toContain(unknown);
      });

      it('falls back to the unknown code for an unrecognized wire code', () => {
        expect(fromCode('totally-unrecognized-code').type).toBe(unknown);
      });

      it('declares every code value as a non-empty SCREAMING_SNAKE_CASE string', () => {
        for (const value of Object.values(codes)) {
          expect(typeof value).toBe('string');
          expect(value).toMatch(/^[A-Z][A-Z0-9_]*$/);
        }
      });
    }
  );

  describe('code uniqueness across classes', () => {
    it('maps each normalized code to exactly one error class, except documented overlaps', () => {
      // Each entry is shared on purpose. Adding to this set is a taxonomy
      // decision, not a test fix: a code may only appear in two classes when it
      // denotes the *same* condition in both.
      const DOCUMENTED_OVERLAPS = new Set([
        // WebAuthErrorCodes and CredentialsManagerErrorCodes both use this as
        // their terminal fallback; renaming either would be breaking.
        'UNKNOWN_ERROR',
        // A web-authentication timeout and an HTTP timeout are the same
        // condition to a consumer, so they normalize to one code.
        'TIMEOUT_ERROR',
        // MfaError and MyAccountError both report "enrolling the authenticator
        // / authentication method failed" — one condition, two entry points.
        'ENROLLMENT_FAILED',
      ]);

      const owners = new Map<string, string[]>();
      for (const { name, codes } of TAXONOMY) {
        for (const value of Object.values(codes) as string[]) {
          owners.set(value, [...(owners.get(value) ?? []), name]);
        }
      }

      const collisions = [...owners.entries()].filter(
        ([code, names]) => names.length > 1 && !DOCUMENTED_OVERLAPS.has(code)
      );

      expect(collisions).toEqual([]);
    });

    it('prefixes every PasskeyErrorCodes value with PASSKEY_', () => {
      // The keys are deliberately unprefixed for ergonomics
      // (`PasskeyErrorCodes.NOT_AVAILABLE`) while the values carry the
      // `PASSKEY_` prefix to stay globally unique. This asymmetry is
      // intentional — do not "fix" it by aligning key and value.
      for (const value of Object.values(PasskeyErrorCodes)) {
        expect(value).toMatch(/^PASSKEY_/);
      }
      for (const key of Object.keys(PasskeyErrorCodes)) {
        expect(key).not.toMatch(/^PASSKEY_/);
      }
    });

    it('uses matching key and value for every other codes object', () => {
      const others = TAXONOMY.filter(
        ({ codes }) => codes !== PasskeyErrorCodes
      );
      for (const { codes } of others) {
        for (const [key, value] of Object.entries(codes)) {
          expect(value).toBe(key);
        }
      }
    });
  });

  describe('TimeoutError', () => {
    it('participates in the taxonomy with a normalized type', () => {
      const error = new TimeoutError('Request timed out');
      expect(error).toBeInstanceOf(AuthError);
      expect(error.type).toBe('TIMEOUT_ERROR');
    });
  });
});
