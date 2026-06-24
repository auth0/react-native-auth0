import type { User } from '../../types';
import { Auth0User } from '../models';

/**
 * Decodes a JWT ID token and returns a {@link User} object with standard OIDC
 * profile claims (camelCased) and any custom claims present in the token.
 *
 * This provides the same user-parsing behavior that {@link Auth0Provider} uses
 * internally, for consumers managing auth state directly via the {@link Auth0} class.
 *
 * @param idToken - A JWT ID token string (e.g. from `credentials.idToken`).
 * @returns A parsed {@link User} containing profile and custom claims.
 * @throws If the token is missing the required `sub` claim.
 *
 * @example
 * ```typescript
 * import Auth0, { parseIdToken } from 'react-native-auth0';
 *
 * const auth0 = new Auth0({ domain, clientId });
 * const credentials = await auth0.webAuth.authorize({ scope: 'openid profile email' });
 * const user = parseIdToken(credentials.idToken);
 * // user.sub, user.name, user.email, etc.
 * ```
 */
export function parseIdToken(idToken: string): User {
  return Auth0User.fromIdToken(idToken);
}
