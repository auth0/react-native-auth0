import {JwtPayload} from 'jwt-decode';
import {RawUser} from '../internal-types';
import {User} from '../types';
import {idTokenNonProfileClaims} from '../jwt/utils';

export function convertUser(payload: JwtPayload): User {
  return Object.keys(payload).reduce((profile: RawUser, claim) => {
    if (!idTokenNonProfileClaims.has(claim)) {
      profile[claim] = payload[claim];
    }
    const user: User = {
      name: profile.name,
      givenName: profile.given_name,
      familyName: profile.family_name,
      middleName: profile.middle_name,
      nickname: profile.nickname,
      preferredUsername: profile.preferred_username,
      profile: profile.profile,
      picture: profile.picture,
      website: profile.website,
      email: profile.email,
      emailVerified: profile.email_verified,
      gender: profile.gender,
      birthdate: profile.birthdate,
      zoneinfo: profile.zoneinfo,
      locale: profile.locale,
      phoneNumber: profile.phone_number,
      phoneNumberVerified: profile.phone_number_verified,
      address: profile.address,
      updatedAt: profile.updated_at,
      sub: profile.sub,
    };
    delete profile.name;
    delete profile.given_name;
    delete profile.family_name;
    delete profile.middle_name;
    delete profile.nickname;
    delete profile.preferred_username;
    delete profile.profile;
    delete profile.picture;
    delete profile.website;
    delete profile.email;
    delete profile.email_verified;
    delete profile.gender;
    delete profile.birthdate;
    delete profile.zoneinfo;
    delete profile.locale;
    delete profile.phone_number;
    delete profile.phone_number_verified;
    delete profile.address;
    delete profile.updated_at;
    delete profile.sub;
    Object.keys(user).forEach(key => {
      if (user[key] === undefined) {
        delete user[key];
      }
    });
    return {...user, ...profile};
  }, {});
}
