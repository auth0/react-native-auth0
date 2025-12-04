import { fetchWithTimeout, TimeoutError } from '../utils/fetchWithTimeout';
import { toUrlQueryParams } from '../utils';
import { AuthError } from '../models';
import base64 from 'base-64';
import { telemetry } from '../utils/telemetry';

/**
 * Function type for getting DPoP headers from the native/platform layer.
 */
export type DPoPHeadersProvider = (params: {
  url: string;
  method: string;
  accessToken: string;
  tokenType: string;
  nonce?: string;
}) => Promise<Record<string, string>>;

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
 * Returns the Bearer authentication header.
 * @param token - The token value
 * @returns A record with the Authorization header containing the Bearer token
 */
export function getBearerHeader(token: string): Record<string, string> {
  return { Authorization: `${TokenType.bearer} ${token}` };
}

export interface HttpClientOptions {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  telemetry?: { name: string; version: string };
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout ?? 10000;

    const encodedTelemetry = base64.encode(
      JSON.stringify(options.telemetry ?? telemetry)
    );

    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Auth0-Client': encodedTelemetry,
      ...options.headers,
    };
  }

  async get<T>(
    path: string,
    query?: Record<string, any>,
    headers: Record<string, string> = {}
  ): Promise<{ json: T; response: Response }> {
    const url = this.buildUrl(path, query);
    return this.request(url, 'GET', undefined, headers);
  }

  async post<T>(
    path: string,
    body: any,
    headers: Record<string, string> = {}
  ): Promise<{ json: T; response: Response }> {
    const url = this.buildUrl(path);
    return this.request(url, 'POST', body, headers);
  }

  async patch<T>(
    path: string,
    body: any,
    headers: Record<string, string> = {}
  ): Promise<{ json: T; response: Response }> {
    const url = this.buildUrl(path);
    return this.request(url, 'PATCH', body, headers);
  }

  public buildUrl(path: string, query?: Record<string, any>): string {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const queryString = toUrlQueryParams(query);
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return url;
  }

  /**
   * Parses the WWW-Authenticate header to extract error information.
   * Per RFC 6750, OAuth 2.0 Bearer Token errors are returned in this header with format:
   * Bearer error="invalid_token", error_description="The access token expired"
   *
   * @see https://datatracker.ietf.org/doc/html/rfc6750#section-3
   */
  private parseWwwAuthenticateHeader(
    response: Response
  ): { error: string; error_description?: string } | null {
    const wwwAuthenticate = response.headers.get('WWW-Authenticate');
    if (!wwwAuthenticate) {
      return null;
    }

    // Parse key="value" pairs from the header
    // Matches: error="invalid_token", error_description="The access token expired"
    const errorMatch = wwwAuthenticate.match(/error="([^"]+)"/);
    const descriptionMatch = wwwAuthenticate.match(
      /error_description="([^"]+)"/
    );

    if (errorMatch?.[1]) {
      return {
        error: errorMatch[1],
        error_description: descriptionMatch?.[1],
      };
    }

    return null;
  }

  /**
   * Safely parses a JSON response, handling cases where the body might be empty or invalid JSON.
   * This prevents "body already consumed" errors by reading text first, then parsing.
   *
   * For error responses (4xx/5xx), if the body is not valid JSON, we check the WWW-Authenticate
   * header for OAuth 2.0 Bearer token errors (RFC 6750), which is how endpoints like /userinfo
   * return errors.
   */
  private async safeJson(response: Response): Promise<any> {
    if (response.status === 204) {
      // No Content
      return {};
    }

    let text = '';
    try {
      text = await response.text();
      return JSON.parse(text);
    } catch {
      // For error responses, check WWW-Authenticate header (RFC 6750)
      // This is how OAuth 2.0 protected resources like /userinfo return errors
      if (!response.ok) {
        const wwwAuthError = this.parseWwwAuthenticateHeader(response);
        if (wwwAuthError) {
          return wwwAuthError;
        }

        // Fallback: return a generic HTTP error with the status code
        return {
          error: `http_error_${response.status}`,
          error_description:
            text || response.statusText || `HTTP ${response.status} error`,
        };
      }

      // For successful responses with invalid JSON, return invalid_json error
      return {
        error: 'invalid_json',
        error_description: text || 'Failed to parse response body',
      };
    }
  }

  private async request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH',
    body?: any,
    requestHeaders: Record<string, string> = {}
  ): Promise<{ json: T; response: Response }> {
    try {
      const finalHeaders = {
        ...this.defaultHeaders,
        ...requestHeaders,
      };
      const response = await fetchWithTimeout(
        url,
        {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : undefined,
        },
        this.timeout
      );

      const json = await this.safeJson(response);

      return { json: json as T, response };
    } catch (e) {
      if (e instanceof TimeoutError) throw e;
      throw new AuthError('NetworkError', (e as Error).message, {
        code: 'network_error',
      });
    }
  }
}
