import { AuthError } from '../models/AuthError';
import type { PasskeyVerificationMethod } from '../../types/parameters';

const isKnownMethod = (value: unknown): value is PasskeyVerificationMethod =>
  value === 'email' || value === 'phone';

/**
 * Keeps the identifiers this SDK knows about (`email`, `phone`) from a list that
 * came from a platform library, in order.
 *
 * Returns `undefined` when nothing recognizable is left, so a caller can fall
 * back to the identifiers of the original challenge. The web adapter (challenge
 * and retry payload) and the retry payload of `PasskeyError` go through here;
 * on native, the Swift/Kotlin bridge filters the identifiers of a challenge
 * before they reach JS.
 */
export const toVerificationMethods = (
  value: unknown
): PasskeyVerificationMethod[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const known = value.filter(isKnownMethod);
  return known.length > 0 ? known : undefined;
};

// Blank as JavaScript, Swift (`whitespacesAndNewlines`, which adds U+0085) and
// Kotlin (`isBlank`, which adds U+001C-U+001F) see it, so that a blank code is
// always rejected here, never by a native SDK with a different error.
const isBlank = (code: string): boolean =>
  /^[\s\u0085\u001c-\u001f]*$/.test(code);

/**
 * Keeps the string codes for the identifiers this SDK knows about from a
 * `verification` map, and nothing else. Returns `undefined` when there is
 * nothing to send.
 *
 * @throws {AuthError} With code `InvalidParameter` when a code is empty or only
 *   whitespace. The native bridges would send it to Auth0 (which fails the
 *   exchange and loses the session), so it is rejected here, before any
 *   platform call, to behave the same everywhere. Callers wrap it in a
 *   `PasskeyError`, whose type is then `PASSKEY_INVALID_PARAMETER`.
 */
export const toVerificationCodes = (
  verification?: Record<string, unknown>
): Partial<Record<PasskeyVerificationMethod, string>> | undefined => {
  const codes: Partial<Record<PasskeyVerificationMethod, string>> = {};
  for (const method of ['email', 'phone'] as const) {
    const code = verification?.[method];
    if (typeof code === 'string') {
      if (isBlank(code)) {
        throw new AuthError(
          'InvalidParameter',
          `The verification code for '${method}' must not be empty.`,
          { code: 'InvalidParameter' }
        );
      }
      codes[method] = code;
    }
  }
  return Object.keys(codes).length > 0 ? codes : undefined;
};
