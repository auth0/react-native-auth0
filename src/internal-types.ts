import { JwtPayload } from 'jwt-decode';
import LocalAuthenticationStrategy from './credentials-manager/localAuthenticationStrategy';
import { Credentials } from './types';

export type CredentialsResponse = {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  [key: string]: any;
};

export type RawCredentials = {
  idToken: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope?: string;
  [key: string]: any;
};

export type RawUser = {
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

export type RawMultifactorChallengeOTPResponse = { challenge_type: string };

export type RawMultifactorChallengeOOBResponse =
  RawMultifactorChallengeOTPResponse & {
    oob_code: string;
  };
export type RawMultifactorChallengeOOBWithBindingResponse =
  RawMultifactorChallengeOOBResponse & {
    binding_method: string;
  };

export type RawMultifactorChallengeResponse =
  | RawMultifactorChallengeOTPResponse
  | RawMultifactorChallengeOOBResponse
  | RawMultifactorChallengeOOBWithBindingResponse;

export type CustomJwtPayload = JwtPayload & RawUser;

/**
 * Type representing the Native Auth0 API's on iOS and Android
 */
export type Auth0Module = {
  bundleIdentifier: string;
  webAuth: (
    scheme: string,
    redirectUri: string,
    state?: string,
    nonce?: string,
    audience?: string,
    scope?: string,
    connection?: string,
    maxAge?: number,
    organization?: string,
    invitationUrl?: string,
    leeway?: number,
    ephemeralSession?: boolean,
    safariViewControllerPresentationStyle?: number,
    additionalParameters?: { [key: string]: string }
  ) => Promise<Credentials>;
  webAuthLogout: (
    scheme: string,
    federated: boolean,
    redirectUri: string
  ) => Promise<void>;
  resumeWebAuth: (url: string) => Promise<void>;
  saveCredentials: (credentials: Credentials) => Promise<void>;
  getCredentials: (
    scope?: string,
    minTtl?: number,
    parameters?: Record<string, unknown>,
    forceRefresh?: boolean
  ) => Promise<Credentials>;
  enableLocalAuthentication:
    | ((
        title?: string,
        cancelTitle?: string,
        fallbackTitle?: string,
        strategy?: LocalAuthenticationStrategy
      ) => Promise<void>)
    | ((title?: string, description?: string) => Promise<void>);
  hasValidCredentials: (minTtl?: number) => Promise<boolean>;
  clearCredentials: () => Promise<void>;
  hasValidAuth0Instance: () => Promise<boolean>;
  initializeAuth0: (clientId: string, domain: string) => Promise<void>;
};

export type AgentParameters = {
  clientId: string;
  domain: string;
};

export type AgentLogoutOptions = {
  customScheme?: string;
  federated?: boolean;
  returnToUrl?: string;
  useLegacyCallbackUrl?: boolean;
};

export interface AgentLoginOptions {
  state?: string;
  nonce?: string;
  audience?: string;
  scope?: string;
  connection?: string;
  maxAge?: number;
  organization?: string;
  invitationUrl?: string;
  customScheme?: string;
  leeway?: number;
  ephemeralSession?: boolean;
  redirectUrl?: string;
  safariViewControllerPresentationStyle?: number;
  additionalParameters?: { [key: string]: string };
  useLegacyCallbackUrl?: boolean;
}
