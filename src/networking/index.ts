import {Telemetry, defaults} from './telemetry';
import url from 'url';
import base64 from 'base-64';
import {RequestOptions, fetchWithTimeout} from '../utils/fetchWithTimeout';

export default class Client {
  public telemetry: Telemetry;
  public baseUrl: string;
  public domain: string;
  private bearer?: string;
  private timeout: number;

  constructor(options: {
    baseUrl: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  }) {
    const {
      baseUrl,
      telemetry = {},
      token,
      timeout = 10000,
    }: {
      baseUrl: string;
      telemetry?: Telemetry;
      token?: string;
      timeout?: number;
    } = options;
    if (!baseUrl) {
      throw new Error('Missing Auth0 domain');
    }
    const {name = defaults.name, version = defaults.version} = telemetry;
    this.telemetry = {name, version};
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
  }

  post(path: string, body: unknown) {
    return this.request('POST', this.url(path), body);
  }

  patch(path: string, body: unknown) {
    return this.request('PATCH', this.url(path), body);
  }

  get(path: string, query?: unknown) {
    return this.request('GET', this.url(path, query));
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

  request(method: 'GET' | 'POST' | 'PATCH', url: string, body?: unknown) {
    const options: RequestOptions = {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Auth0-Client': this._encodedTelemetry(),
      },
    };

    if (this.bearer) {
      options.headers.Authorization = this.bearer;
    }
    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetchWithTimeout(url, options, this.timeout).then(
      (response: any) => {
        const payload = {
          status: response.status,
          ok: response.ok,
          headers: response.headers,
        };
        return response
          .json()
          .then((json: any) => {
            return {...payload, json};
          })
          .catch(() => {
            return response
              .text()
              .then((text: any) => {
                return {...payload, text};
              })
              .catch(() => {
                return {...payload, text: response.statusText};
              });
          });
      },
    );
  }

  _encodedTelemetry() {
    return base64.encode(JSON.stringify(this.telemetry));
  }
}
