import {CustomJwtPayload, RawUser} from '../internal-types';
import {idTokenNonProfileClaims} from '../jwt/utils';
import {User} from '../types';

function snakeToCamel(str: string): string {
  var parts = str.split('_');
  return (
    parts.reduce(function (p, c) {
      return p + c.charAt(0).toUpperCase() + c.slice(1);
    }, parts.shift()) ?? ''
  );
}

export function convertUser(payload: CustomJwtPayload): User {
  const claimsToCamelize: Array<keyof RawUser> = [
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
  ];

  return Object.keys(payload).reduce(
    (profile: Partial<RawUser>, claim: string) => {
      if ((claimsToCamelize as string[]).includes(claim)) {
        return {
          ...profile,
          [snakeToCamel(claim)]: payload[claim],
        };
      } else if (!idTokenNonProfileClaims.has(claim)) {
        return {
          ...profile,
          [claim]: payload[claim],
        };
      } else {
        return profile;
      }
    },
    {},
  );
}
