import { jwtDecode } from 'jwt-decode';
import type { User } from '../../types';
import { snakeToCamel } from '../utils';

/**
 * A Set containing all OIDC protocol claims that are part of a standard ID token
 * but are not considered part of the user's "profile" information.
 * This is a direct equivalent of the `idTokenNonProfileClaims` from the original codebase.
 * @private
 */
const idTokenProtocolClaims = new Set([
  'iss',
  'aud',
  'exp',
  'nbf',
  'iat',
  'jti',
  'azp',
  'nonce',
  'auth_time',
  'at_hash',
  'c_hash',
  'acr',
  'amr',
  'sub_jwk',
  'cnf',
  'sip_from_tag',
  'sip_date',
  'sip_callid',
  'sip_cseq_num',
  'sip_via_branch',
  'orig',
  'dest',
  'mky',
  'events',
  'toe',
  'txn',
  'rph',
  'sid',
  'vot',
  'vtm',
]);

/**
 * A Set containing all the standard OIDC profile claims that should be
 * converted from snake_case to camelCase.
 * This is a direct equivalent of `claimsToCamelize` from the original `convertUser` function.
 * @private
 */
const profileClaimsToCamelize = new Set([
  'name',
  'given_name',
  'family_name',
  'middle_name',
  'nickname',
  'preferred_username',
  'profile',
  'picture',
  'website',
  'email',
  'email_verified',
  'gender',
  'birthdate',
  'zoneinfo',
  'locale',
  'phone_number',
  'phone_number_verified',
  'address',
  'updated_at',
  'sub',
]);

/**
 * A class representation of an authenticated user's profile.
 * This class and its factory method `fromIdToken` are a direct
 * translation of the old `convertUser` utility.
 */
export class Auth0User implements User {
  public sub: string;
  public name?: string;
  public givenName?: string;
  public familyName?: string;
  public middleName?: string;
  public nickname?: string;
  public preferredUsername?: string;
  public profile?: string;
  public picture?: string;
  public website?: string;
  public email?: string;
  public emailVerified?: boolean;
  public gender?: string;
  public birthdate?: string;
  public zoneinfo?: string;
  public locale?: string;
  public phoneNumber?: string;
  public phoneNumberVerified?: boolean;
  public address?: string;
  public updatedAt?: string;

  // Store all other custom claims
  [key: string]: any;

  /**
   * Constructs an instance of Auth0User.
   *
   * @param profile An object conforming to the User type definition, with camelCased keys.
   */
  constructor(profile: Partial<User>) {
    if (!profile.sub) {
      throw new Error('User profile must contain a "sub" claim.');
    }
    Object.assign(this, profile);
    this.sub = profile.sub;
  }

  /**
   * A static factory method to create a User instance by decoding a JWT ID token.
   * This method meticulously replicates the logic of the original `convertUser` function.
   *
   * @param idToken The JWT ID token string.
   * @returns A new Auth0User instance.
   */
  static fromIdToken(idToken: string): Auth0User {
    const decodedToken = jwtDecode<any>(idToken);

    if (!decodedToken.sub) {
      throw new Error('ID token is missing the required "sub" claim.');
    }

    const profile: { [key: string]: any } = {};

    // Iterate over every claim in the decoded token
    for (const claim in decodedToken) {
      if (Object.prototype.hasOwnProperty.call(decodedToken, claim)) {
        // First, check if the claim is a protocol claim that should be ignored.
        if (idTokenProtocolClaims.has(claim)) {
          continue;
        }

        // Next, check if it's a standard profile claim that needs camel-casing.
        if (profileClaimsToCamelize.has(claim)) {
          const camelKey = snakeToCamel(claim);
          profile[camelKey] = decodedToken[claim];
        } else {
          // If it's not a protocol claim and not a standard profile claim,
          // it must be a custom claim. Assign it directly without modification.
          profile[claim] = decodedToken[claim];
        }
      }
    }

    // The profile object now contains the exact same properties as the old
    // convertUser function would have produced.
    return new Auth0User(profile as User);
  }
}
