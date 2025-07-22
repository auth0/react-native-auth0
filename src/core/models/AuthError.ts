/**
 * Represents a generic authentication or API error from Auth0.
 *
 * This class provides a structured way to handle errors, with consistent
 * access to status codes, error codes, and response bodies.
 */
export class AuthError extends Error {
  /** The HTTP status code of the error response, if available. */
  public readonly status: number;
  /** The error code returned by Auth0 (e.g., 'invalid_grant'), if available. */
  public readonly code: string;
  /** The full JSON response body of the error, if available. */
  public readonly json: unknown;

  /**
   * Constructs a new AuthError instance.
   *
   * @param name The primary error identifier (e.g., the 'error' field from an OAuth2 response).
   * @param message A human-readable description of the error (e.g., the 'error_description' field).
   * @param details An object containing additional error context.
   */
  constructor(
    name: string,
    message: string,
    details?: {
      status?: number;
      code?: string;
      json?: unknown;
    }
  ) {
    super(message);
    this.name = name;
    this.status = details?.status ?? 0;
    this.code = details?.code ?? 'unknown_error';
    this.json = details?.json;

    // This is for V8 environments (like Node.js, Chrome) to capture the stack trace correctly.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }

  /**
   * A static factory method to create an AuthError from a fetch Response object.
   * This is a utility that platform adapters can use for consistency.
   *
   * @param response The fetch Response object.
   * @param body The parsed body of the response (can be JSON or text).
   * @returns A new AuthError instance.
   */
  static fromResponse(response: Response, body: any): AuthError {
    const {
      error = 'a0.response.invalid',
      error_description = 'Unknown error',
      code = undefined,
      message = undefined,
    } = typeof body === 'object' && body !== null ? body : {};

    return new AuthError(
      error,
      // Use message if it exists (for Management API errors), otherwise fall back to error_description.
      message ?? error_description,
      {
        status: response.status,
        // Use the specific 'code' if it exists, otherwise fall back to the 'error' property.
        code: code ?? error,
        json: body,
      }
    );
  }
}
