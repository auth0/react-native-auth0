import {
  RawCredentials,
  RawMultifactorChallengeOOBResponse,
  RawMultifactorChallengeOOBWithBindingResponse,
  RawMultifactorChallengeOTPResponse,
  RawMultifactorChallengeResponse,
  RawUser,
} from './internal-types';

export type CamelizeString<ObjectProperty extends string> =
  ObjectProperty extends `${infer F}_${infer R}`
    ? `${F}${Capitalize<CamelizeString<R>>}`
    : ObjectProperty;

export type Camelize<GenericObject> = {
  [ObjectProperty in keyof GenericObject as CamelizeString<
    ObjectProperty & string
  >]: GenericObject[ObjectProperty] extends Array<infer ArrayItem>
    ? ArrayItem extends Record<string, unknown>
      ? Array<Camelize<ArrayItem>>
      : GenericObject[ObjectProperty]
    : GenericObject[ObjectProperty] extends Record<string, unknown>
    ? Camelize<GenericObject[ObjectProperty]>
    : GenericObject[ObjectProperty];
};

export type Credentials = Camelize<RawCredentials>;
export type User = Camelize<RawUser>;

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

export interface GetUserOptions {
  id: string;
  [key: string]: any;
}

export interface PatchUserOptions {
  id: string;
  metadata: object;
  [key: string]: any;
}

export interface AuthorizeUrlOptions {
  responseType: string;
  redirectUri: object;
  state: object;
  [key: string]: any;
}

export interface LogoutUrlOptions {
  federated?: boolean;
  clientId?: string;
  returnTo?: string;
  [key: string]: any;
}

export interface ExchangeOptions {
  code: string;
  verifier: string;
  redirectUri: string;
  [key: string]: any;
}

export interface ExchangeNativeSocialOptions {
  subjectToken: string;
  subjectTokenType: string;
  userProfile?: object;
  audience?: string;
  scope?: string;
  [key: string]: any;
}

export interface PasswordRealmOptions {
  username: string;
  password: string;
  realm: string;
  audience?: string;
  scope?: string;
  [key: string]: any;
}

export interface RefreshTokenOptions {
  refreshToken: string;
  scope?: string;
  [key: string]: any;
}

export interface PasswordlessWithEmailOptions {
  email: string;
  send?: string;
  authParams?: string;
  [key: string]: any;
}

export interface PasswordlessWithSMSOptions {
  phoneNumber: string;
  send?: string;
  authParams?: string;
  [key: string]: any;
}

export interface LoginWithEmailOptions {
  email: string;
  code: string;
  audience?: string;
  scope?: string;
  [key: string]: any;
}

export interface LoginWithSMSOptions {
  phoneNumber: string;
  code: string;
  audience?: string;
  scope?: string;
  [key: string]: any;
}

export interface LoginWithOTPOptions {
  mfaToken: string;
  otp: string;
  audience?: string;
  [key: string]: any;
}

export interface LoginWithOOBOptions {
  mfaToken: string;
  oobCode: string;
  bindingCode?: string;
  [key: string]: any;
}

export interface LoginWithRecoveryCodeOptions {
  mfaToken: string;
  recoveryCode: string;
  [key: string]: any;
}

export interface MultifactorChallengeOptions {
  mfaToken: string;
  challengeType?: string;
  authenticatorId?: string;
  [key: string]: any;
}

export interface RevokeOptions {
  refreshToken: string;
  [key: string]: any;
}

export interface UserInfoOptions {
  token: string;
}

export interface ResetPasswordOptions {
  email: string;
  connection: string;
  [key: string]: any;
}

export interface CreateUserOptions {
  email: string;
  password: string;
  connection: string;
  username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  metadata?: string;
  [key: string]: any;
}

export type MultifactorChallengeResponse =
  | Camelize<RawMultifactorChallengeOTPResponse>
  | Camelize<RawMultifactorChallengeOOBResponse>
  | Camelize<RawMultifactorChallengeOOBWithBindingResponse>;
