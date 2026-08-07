import { AuthError } from './AuthError';

/**
 * Platform-agnostic error code constants for My Account API operations.
 *
 * Use these constants for type-safe error handling when enrolling, confirming,
 * or managing authentication methods. Each constant corresponds to a specific
 * error type in the {@link MyAccountError.type} property.
 *
 * @remarks
 * The My Account API reports failures as RFC 7807 type URIs (e.g.
 * `"https://auth0.com/api-errors/A0E-401-0001"`). Those URIs are normalized to
 * these codes so error handling matches every other error class in the SDK. The
 * original URI remains available on {@link MyAccountError.typeUri}.
 *
 * @example
 * ```typescript
 * import { MyAccountError, MyAccountErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   await myAccount.enrollPhone({ accessToken, phoneNumber: '+1234567890' });
 * } catch (e) {
 *   if (e instanceof MyAccountError) {
 *     switch (e.type) {
 *       case MyAccountErrorCodes.UNAUTHORIZED:
 *         // Access token expired or missing the required scopes
 *         break;
 *       case MyAccountErrorCodes.ENROLLMENT_FAILED:
 *         // The factor could not be enrolled
 *         break;
 *     }
 *   }
 * }
 * ```
 *
 * @see {@link MyAccountError}
 */
export const MyAccountErrorCodes = {
  /** The access token is missing, expired, or lacks the required scopes */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** The request was rejected as malformed or invalid by the API */
  INVALID_REQUEST: 'INVALID_REQUEST',
  /** Enrolling the authentication method failed */
  ENROLLMENT_FAILED: 'ENROLLMENT_FAILED',
  /** Confirming or verifying the enrollment failed */
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  /** The requested authentication method does not exist */
  NOT_FOUND: 'NOT_FOUND',
  /** The authentication method already exists or conflicts with an existing one */
  CONFLICT: 'CONFLICT',
  /** Too many requests - rate limited */
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  /** Generic My Account API error */
  MY_ACCOUNT_ERROR: 'MY_ACCOUNT_ERROR',
  /** Unknown or uncategorized My Account error */
  UNKNOWN_MY_ACCOUNT_ERROR: 'UNKNOWN_MY_ACCOUNT_ERROR',
} as const;

/**
 * A normalized My Account API error code.
 *
 * Derived from {@link MyAccountErrorCodes} so the union and the runtime
 * constants cannot drift apart.
 */
export type MyAccountErrorCode =
  (typeof MyAccountErrorCodes)[keyof typeof MyAccountErrorCodes];

const ERROR_CODE_MAP: Record<string, MyAccountErrorCode> = {
  // --- Native bridge local validation errors (iOS MyAccount.swift, Android MyAccount.kt) ---
  MY_ACCOUNT_ERROR: MyAccountErrorCodes.MY_ACCOUNT_ERROR,
  MY_ACCOUNT_ENROLLMENT_FAILED: MyAccountErrorCodes.ENROLLMENT_FAILED,
  MY_ACCOUNT_VERIFICATION_FAILED: MyAccountErrorCodes.VERIFICATION_FAILED,
};

/**
 * Maps an HTTP status code to a normalized error code.
 *
 * The My Account API's RFC 7807 type URIs embed the status (`A0E-401`,
 * `A0E-400-0001`), and the granular suffixes are not a closed set, so the
 * status is the only stable signal to normalize on.
 */
function fromStatusCode(status: number): MyAccountErrorCode | undefined {
  switch (status) {
    case 400:
      return MyAccountErrorCodes.INVALID_REQUEST;
    case 401:
    case 403:
      return MyAccountErrorCodes.UNAUTHORIZED;
    case 404:
      return MyAccountErrorCodes.NOT_FOUND;
    case 409:
      return MyAccountErrorCodes.CONFLICT;
    case 429:
      return MyAccountErrorCodes.TOO_MANY_REQUESTS;
    default:
      return undefined;
  }
}

/**
 * Represents an error from the My Account API, mirroring the properties
 * exposed by the native Auth0 SDKs (Auth0.swift and Auth0.Android).
 *
 * The `type` property provides a normalized, platform-agnostic error code that
 * applications can use for consistent error handling across iOS, Android, and
 * Web. The raw RFC 7807 type URI is preserved on {@link MyAccountError.typeUri}.
 *
 * @example
 * ```typescript
 * import { MyAccountError, MyAccountErrorCodes } from 'react-native-auth0';
 *
 * try {
 *   await myAccount.enrollPhone({ accessToken, phoneNumber: '+1234567890' });
 * } catch (error) {
 *   if (error instanceof MyAccountError) {
 *     console.log(error.type);       // e.g. "UNAUTHORIZED"
 *     console.log(error.typeUri);    // e.g. "https://auth0.com/api-errors/A0E-401-0001"
 *     console.log(error.statusCode); // e.g. 401
 *     console.log(error.title);      // e.g. "Unauthorized"
 *     console.log(error.detail);     // e.g. "The access token is invalid or has expired"
 *   }
 * }
 * ```
 */
export class MyAccountError extends AuthError {
  /**
   * A normalized error type that is consistent across platforms.
   * This can be used for reliable error handling in application code.
   */
  public readonly type: MyAccountErrorCode;
  /**
   * The raw RFC 7807 error type URI from the API
   * (e.g., "https://auth0.com/api-errors/A0E-401-0001"), when the API supplied
   * one. Falls back to the originating error code otherwise.
   */
  public readonly typeUri: string;
  /** Human-readable error title (e.g., "Unauthorized", "Bad Request") */
  public readonly title: string;
  /** Detailed error description from the API */
  public readonly detail: string;
  /** HTTP status code of the error response */
  public readonly statusCode: number;

  constructor(originalError: AuthError) {
    super(originalError.name, originalError.message, {
      status: originalError.status,
      code: originalError.code,
      json: originalError.json,
    });

    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = JSON.parse(originalError.message);
    } catch {
      // message is not JSON — fall back to raw values
    }

    this.typeUri = (parsed?.type as string) ?? originalError.code;
    this.title = (parsed?.title as string) ?? '';
    this.detail = (parsed?.detail as string) ?? originalError.message;
    this.statusCode = (parsed?.statusCode as number) ?? originalError.status;

    this.type =
      ERROR_CODE_MAP[originalError.code] ??
      fromStatusCode(this.statusCode) ??
      MyAccountErrorCodes.UNKNOWN_MY_ACCOUNT_ERROR;
  }
}
