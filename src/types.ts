export type Credentials = {
  idToken: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope?: string;
  [key: string]: any;
};

export class User {
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
}

export interface WebAuthorizeParameters {
  state?: string;
  nonce?: string;
  audience?: string;
  scope?: string;
  connection?: string;
  max_age?: number;
  organization?: string;
  invitationUrl?: string;
}

export interface WebAuthorizeOptions {
  leeway?: number;
  ephemeralSession?: boolean;
  customScheme?: string;
  skipLegacyListener?: boolean;
}

export interface ClearSessionParameters {
  federated?: boolean;
  customScheme?: string;
}

export interface ClearSessionOptions {
  skipLegacyListener?: boolean;
}
