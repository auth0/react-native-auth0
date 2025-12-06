import type { LocalAuthenticationOptions } from './platform-specific';

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
  /** The type of the token, typically "Bearer" or "DPoP" */
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
 * Represents the session transfer credentials used for Native to Web SSO.
 * These credentials are obtained by exchanging a refresh token and can be used
 * to authenticate in web contexts without requiring the user to log in again.
 *
 * @remarks
 * Session transfer tokens are short-lived and expire after a few minutes.
 * Once expired, they can no longer be used for web SSO.
 *
 * @see https://auth0.com/docs/authenticate/login/configure-silent-authentication
 */
export type SessionTransferCredentials = {
  /** The session transfer token used for web SSO. */
  sessionTransferToken: string;
  /** The type of the token issued (typically "N_A" for session transfer tokens). */
  tokenType: string;
  /** The expiration time of the session transfer token in seconds. */
  expiresIn: number;
  /**
   * A new ID token, if one was issued during the token exchange.
   * This is typically present when Refresh Token Rotation is enabled.
   */
  idToken?: string;
  /**
   * A new refresh token, if one was issued during the token exchange.
   * This is present when Refresh Token Rotation is enabled.
   */
  refreshToken?: string;
};

/**
 * Represents API-specific credentials, primarily containing an access token.
 * This is returned when requesting tokens for a specific API (audience).
 */
export type ApiCredentials = {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  scope?: string;
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
  localAuthenticationOptions?: LocalAuthenticationOptions;
  /** Your Auth0 application's client ID. */
  clientId: string;
  timeout?: number;
  headers?: Record<string, string>;
  /**
   * Enables DPoP (Demonstrating Proof-of-Possession) for enhanced token security.
   * When enabled, access and refresh tokens are cryptographically bound to a client-specific key pair.
   * @default true
   * @see https://datatracker.ietf.org/doc/html/rfc9449
   */
  useDPoP?: boolean;
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

// ========= DPoP Types =========

/**
 * Represents the type of access token used for API authentication.
 *
 * This enum provides type-safe constants for token types returned by Auth0
 * and used when making authenticated API requests.
 *
 * @remarks
 * - `TokenType.bearer` - Standard OAuth 2.0 Bearer token (default)
 * - `TokenType.dpop` - Demonstrating Proof-of-Possession (DPoP) bound token
 *
 * @example
 * ```typescript
 * import { TokenType } from 'react-native-auth0';
 *
 * // Check if credentials use DPoP
 * if (credentials.tokenType === TokenType.dpop) {
 *   const headers = await auth0.getDPoPHeaders({
 *     url: 'https://api.example.com/data',
 *     method: 'GET',
 *     accessToken: credentials.accessToken,
 *     tokenType: credentials.tokenType
 *   });
 * }
 * ```
 *
 * @public
 */
export enum TokenType {
  /**
   * Standard OAuth 2.0 Bearer token authentication.
   * This is the default token type used by most OAuth 2.0 implementations.
   */
  bearer = 'Bearer',
  /**
   * Demonstrating Proof-of-Possession (DPoP) token authentication.
   * DPoP tokens are sender-constrained, providing additional security
   * by cryptographically binding the token to the client.
   * @see {@link https://datatracker.ietf.org/doc/html/rfc9449 | RFC 9449}
   */
  dpop = 'DPoP',
}

/**
 * Parameters required to generate DPoP headers for custom API requests.
 * These headers cryptographically bind the access token to the specific HTTP request.
 */
export interface DPoPHeadersParams {
  /** The full URL of the API endpoint being called. */
  url: string;
  /** The HTTP method of the request (e.g., 'GET', 'POST'). */
  method: string;
  /** The access token to bind to the request. */
  accessToken: string;
  /** The type of the token (should be 'DPoP' when DPoP is enabled). */
  tokenType: string;
  /** Optional nonce value */
  nonce?: string;
}
