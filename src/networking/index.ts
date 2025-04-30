import { defaults } from './telemetry';
import type { Telemetry } from './telemetry';
import url from 'url';
import base64 from 'base-64';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

/**
 * @ignore
 */
class Client {
  public telemetry: Telemetry;
  public baseUrl: string;
  public domain: string;
  private bearer?: string;
  private timeout: number;
  private globalHeaders: Record<string, string>;

  constructor(options: {
    baseUrl: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
    headers?: Record<string, string>;
  }) {
    const {
      baseUrl,
      telemetry = {},
      token,
      timeout = 10000,
      headers = {},
    }: {
      baseUrl: string;
      telemetry?: Telemetry;
      token?: string;
      timeout?: number;
      headers?: Record<string, string>
    } = options;
    if (!baseUrl) {
      throw new Error('Missing Auth0 domain');
    }
    const { name = defaults.name, version = defaults.version } = telemetry;
    this.telemetry = { name, version };
    if (name !== defaults.name) {
      this.telemetry.env = {};
      this.telemetry.env[defaults.name] = defaults.version;
    }
    const parsed = url.parse(baseUrl);
    this.baseUrl =
      parsed.protocol === 'https:' || parsed.protocol === 'http:'
        ? baseUrl
        : `https://${baseUrl}`;
    this.domain = parsed.hostname || baseUrl;
    if (token) {
      this.bearer = `Bearer ${token}`;
    }

    this.timeout = timeout;
    this.globalHeaders = headers;
  }

  post<TData = unknown, TBody = unknown>(path: string, body: TBody, headers?: Record<string, string>) {
    return this.request<TData, TBody>('POST', this.url(path), body, headers);
  }

  patch<TData = unknown, TBody = unknown>(path: string, body: TBody, headers?: Record<string, string>) {
    return this.request<TData, TBody>('PATCH', this.url(path), body, headers);
  }

  get<TData = unknown>(path: string, query?: unknown, headers?: Record<string, string>) {
    return this.request<TData>('GET', this.url(path, query), undefined, headers);
  }

  url(path: string, query?: any, includeTelemetry: boolean = false) {
    let endpoint = url.resolve(this.baseUrl, path);
    if ((query && query.length !== 0) || includeTelemetry) {
      const parsed: any = url.parse(endpoint);
      parsed.query = query || {};
      if (includeTelemetry) {
        parsed.query.auth0Client = this._encodedTelemetry();
      }
      endpoint = url.format(parsed);
    }
    return endpoint;
  }

  request<TData, TBody = unknown>(
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    body?: TBody,
    requestHeaders?: Record<string, string>
  ): Promise<Auth0Response<TData>> {
    const headers = new Headers();

    // Set default headers first
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    headers.set('Auth0-Client', this._encodedTelemetry());

    if (this.bearer) {
      headers.set('Authorization', this.bearer);
    }

    // Combine global headers with request-specific headers
    const finalHeaders = { ...this.globalHeaders, ...requestHeaders };

    // Apply custom headers, but don't override headers that are already set
    for (const key in finalHeaders) {
      if (Object.prototype.hasOwnProperty.call(finalHeaders, key)) {
        if (finalHeaders[key] !== undefined && !headers.has(key)) {
          headers.set(key, finalHeaders[key] as string);
        }
      }
    }

    const options: RequestInit = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetchWithTimeout(url, options, this.timeout).then(
      (response: Response) => {
        const payload = {
          status: response.status,
          ok: response.ok,
          headers: response.headers,
        };
        return response
          .json()
          .then((json: TData) => {
            return { ...payload, json };
          })
          .catch(() => {
            return response
              .text()
              .then((text: string) => {
                return { ...payload, text };
              })
              .catch(() => {
                return { ...payload, text: response.statusText };
              });
          });
      }
    );
  }

  _encodedTelemetry() {
    return base64.encode(JSON.stringify(this.telemetry));
  }
}

export type Auth0Response<TData> = {
  json?: TData;
  text?: string;
  status: number;
  ok?: boolean;
  headers?: Headers;
};

export default Client;
