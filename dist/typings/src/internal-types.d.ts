import { JwtPayload } from 'jwt-decode';
export declare type RawCredentials = {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  [key: string]: any;
};
export declare type RawUser = {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: any;
};
export declare type RawMultifactorChallengeOTPResponse = {
  challenge_type: string;
};
export declare type RawMultifactorChallengeOOBResponse =
  RawMultifactorChallengeOTPResponse & {
    oob_code: string;
  };
export declare type RawMultifactorChallengeOOBWithBindingResponse =
  RawMultifactorChallengeOOBResponse & {
    binding_method: string;
  };
export declare type RawMultifactorChallengeResponse =
  | RawMultifactorChallengeOTPResponse
  | RawMultifactorChallengeOOBResponse
  | RawMultifactorChallengeOOBWithBindingResponse;
export declare type CustomJwtPayload = JwtPayload & RawUser;
