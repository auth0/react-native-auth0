import type { CredentialsManagerErrorCode } from './CredentialsManagerError';
import type { DPoPErrorCode } from './DPoPError';
import type { MfaErrorCode } from './MfaError';
import type { MyAccountErrorCode } from './MyAccountError';
import type { PasskeyErrorCode } from './PasskeyError';
import type { WebAuthErrorCode } from './WebAuthError';

/**
 * Every normalized error code the SDK can report, across all platforms.
 *
 * This is the union of the per-domain code unions. Prefer the specific union
 * (e.g. {@link WebAuthErrorCode}) when handling a single error class — narrowing
 * to one domain keeps `switch` statements exhaustive and rejects codes that
 * cannot occur there. Use this umbrella union only for code that handles errors
 * generically, such as logging or telemetry.
 *
 * @example
 * ```typescript
 * import type { Auth0ErrorCode } from 'react-native-auth0';
 *
 * function report(code: Auth0ErrorCode, message: string) {
 *   analytics.track('auth0_error', { code, message });
 * }
 * ```
 */
export type Auth0ErrorCode =
  | WebAuthErrorCode
  | CredentialsManagerErrorCode
  | DPoPErrorCode
  | MfaErrorCode
  | PasskeyErrorCode
  | MyAccountErrorCode
  | 'TIMEOUT_ERROR';
