import { AuthError } from './AuthError';

/**
 * Represents an error from the My Account API, mirroring the properties
 * exposed by the native Auth0 SDKs (Auth0.swift and Auth0.Android).
 *
 * @example
 * ```typescript
 * import { MyAccountError } from 'react-native-auth0';
 *
 * try {
 *   await myAccount.enrollPhone({ accessToken, phoneNumber: '+1234567890' });
 * } catch (error) {
 *   if (error instanceof MyAccountError) {
 *     console.log(error.type);       // e.g. "https://auth0.com/api-errors/A0E-401-0001"
 *     console.log(error.statusCode); // e.g. 401
 *     console.log(error.title);      // e.g. "Unauthorized"
 *     console.log(error.detail);     // e.g. "The access token is invalid or has expired"
 *   }
 * }
 * ```
 */
export class MyAccountError extends AuthError {
  /** Error type URI from the API (e.g., "https://auth0.com/api-errors/A0E-401-0001") */
  public readonly type: string;
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

    this.type = (parsed?.type as string) ?? originalError.code;
    this.title = (parsed?.title as string) ?? '';
    this.detail = (parsed?.detail as string) ?? originalError.message;
    this.statusCode = (parsed?.statusCode as number) ?? originalError.status;
  }
}
