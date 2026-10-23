import { AuthError } from 'react-native-auth0';

// A password-realm login that needs MFA fails with `mfa_required`. The token the
// MFA demo needs is in the response body, not in the message ResultView prints.
export const mfaTokenFrom = (error: unknown): string | undefined => {
  if (!(error instanceof AuthError)) {
    return undefined;
  }
  const body = error.json as { mfa_token?: unknown } | undefined;
  return typeof body?.mfa_token === 'string' ? body.mfa_token : undefined;
};
