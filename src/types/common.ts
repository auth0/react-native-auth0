export type NativeCredentialsResponse = {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string | undefined;
  scope: string | undefined;
  [key: string]: any;
};

/**
 * Represents the credentials returned by Auth0 after a successful authentication.
 * This object is platform-agnostic and is the primary return type for most login flows.
 */
export type Credentials = {
  /** A token in JWT format containing user identity claims. */
  idToken: string;
  /** The token used to make API calls to protected resources (your APIs). */
  accessToken: string;
  /** The type of the token, typically "Bearer". */
  tokenType: string;
  /** The expiration time of the access token, represented as a UNIX timestamp (in seconds). */
  expiresAt: number;
  /**
   * The token used to refresh the access token.
   * This is only present if the `offline_access` scope was requested during authentication.
   */
  refreshToken?: string;
  /** A space-separated list of scopes granted for the access token. */
  scope?: string;
  /** Allows for additional, non-standard properties returned from the server. */
  [key: string]: any;
};

/**
 * Represents the standard profile information of an authenticated user,
 * typically decoded from the ID token.
 *
 * @remarks
 * Claims are mapped to camelCase for consistency within the JavaScript/TypeScript ecosystem.
 */
export type User = {
  /** The user's unique identifier (subject claim). */
  sub: string;
  /** The user's full name. */
  name?: string;
  /** The user's given name or first name. */
  givenName?: string;
  /** The user's family name or last name. */
  familyName?: string;
  /** The user's middle name. */
  middleName?: string;
  /** The user's nickname. */
  nickname?: string;
  /** The user's preferred username. */
  preferredUsername?: string;
  /** URL of the user's profile page. */
  profile?: string;
  /** URL of the user's profile picture. */
  picture?: string;
  /** URL of the user's website. */
  website?: string;
  /** The user's primary email address. */
  email?: string;
  /** `true` if the user's email address has been verified, `false` otherwise. */
  emailVerified?: boolean;
  /** The user's gender. */
  gender?: string;
  /** The user's birthdate, represented as a `YYYY-MM-DD` string. */
  birthdate?: string;
  /** The user's time zone, e.g., "America/Los_Angeles". */
  zoneinfo?: string;
  /** The user's locale, e.g., "en-US". */
  locale?: string;
  /** The user's phone number. */
  phoneNumber?: string;
  /** `true` if the user's phone number has been verified, `false` otherwise. */
  phoneNumberVerified?: boolean;
  /** The user's postal address. */
  address?: string;
  /** The timestamp when the user's profile was last updated. */
  updatedAt?: string;
  /** Allows for additional, non-standard claims in the user profile. */
  [key: string]: any;
};

/**
 * Core configuration options required to initialize the Auth0 client.
 * These options are common across all supported platforms.
 */
export interface Auth0Options {
  /** Your Auth0 application's domain. e.g., 'your-tenant.us.auth0.com' */
  domain: string;
  /** Your Auth0 application's client ID. */
  clientId: string;
  timeout?: number;
  headers?: Record<string, string>;
  // Telemetry and localAuthenticationOptions are platform-specific extensions
}

// ========= MFA Challenge Response Types =========

/** Base response for an MFA challenge request. */
export type MfaChallengeOtpResponse = { challengeType: 'otp' };

/** Response for an Out-of-Band (OOB) MFA challenge, containing the OOB code. */
export type MfaChallengeOobResponse = {
  challengeType: 'oob';
  oobCode: string;
};

/** Response for an OOB MFA challenge that requires a binding code. */
export type MfaChallengeOobWithBindingResponse = MfaChallengeOobResponse & {
  bindingMethod: string;
};

/** A union type representing all possible successful responses from an MFA challenge request. */
export type MfaChallengeResponse =
  | MfaChallengeOtpResponse
  | MfaChallengeOobResponse
  | MfaChallengeOobWithBindingResponse;

/**
 * Represents a generic authentication error from the library or the Auth0 service.
 * This class provides a consistent error structure across platforms.
 */
export class Auth0Error extends Error {
  public readonly json: any;
  public readonly status: number;
  public readonly code: string;

  constructor(
    message: string,
    name: string = 'Auth0Error',
    details?: {
      json?: any;
      status?: number;
      code?: string;
    }
  ) {
    super(message);
    this.name = name;
    this.json = details?.json ?? {};
    this.status = details?.status ?? 0;
    this.code = details?.code ?? 'unknown';
  }
}
