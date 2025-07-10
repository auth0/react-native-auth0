import { fetchWithTimeout, TimeoutError } from '../utils/fetchWithTimeout';
import { toUrlQueryParams } from '../utils';
import { AuthError } from '../models';
import base64 from 'base-64';
import pkg from '../../../package.json';

const telemetry = { name: 'react-native-auth0', version: pkg.version };

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

  private buildUrl(path: string, query?: Record<string, any>): string {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const queryString = toUrlQueryParams(query);
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return url;
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

      let json: any;
      if (response.status === 204) {
        // No Content
        json = {};
      } else {
        try {
          json = await response.json();
        } catch {
          json = {
            error: 'invalid_json',
            error_description: await response.text(),
          };
        }
      }

      return { json: json as T, response };
    } catch (e) {
      if (e instanceof TimeoutError) throw e;
      throw new AuthError('NetworkError', (e as Error).message, {
        code: 'network_error',
      });
    }
  }
}
