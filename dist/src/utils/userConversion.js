import { idTokenNonProfileClaims } from '../jwt/utils';
function snakeToCamel(str) {
  var parts = str.split('_');
  return (
    parts.reduce(function (p, c) {
      return p + c.charAt(0).toUpperCase() + c.slice(1);
    }, parts.shift()) ?? ''
  );
}
export function convertUser(payload) {
  const claimsToCamelize = [
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
  return Object.keys(payload).reduce((profile, claim) => {
    if (claimsToCamelize.includes(claim)) {
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
  }, {});
}
