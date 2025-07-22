/**
 * Ensures that the 'openid' scope is always present, which is required
 * for receiving an ID token. It also adds 'profile' and 'email' as
 * sensible defaults if no other scopes are requested.
 *
 * @param inputScopes A space-separated string of scopes provided by the user.
 * @returns A finalized, space-separated string of scopes.
 */
export function finalizeScope(inputScopes?: string): string {
  const defaultScopes = ['openid', 'profile', 'email'];

  if (!inputScopes?.trim()) {
    return defaultScopes.join(' ');
  }

  const providedScopes = new Set(inputScopes.split(' ').filter((s) => s));

  // Ensure 'openid' is always included.
  providedScopes.add('openid');

  return Array.from(providedScopes).join(' ');
}
