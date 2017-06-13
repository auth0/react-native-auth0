import defaults from './telemetry';
import url from 'url';
import base64 from 'base-64';

export default class Client {
  constructor(options) {
    const {baseUrl, telemetry = {}, token} = options;
    if (!baseUrl) { throw new Error('Missing Auth0 domain'); }
    const {
      name = defaults.name,
      version = defaults.version,
      ...extras
    } = telemetry;
    this.telemetry = {name, version, ...extras};
    if (name !== defaults.name) {
      this.telemetry.lib_version = defaults.version;
    }
    const parsed = url.parse(baseUrl);
    this.baseUrl = parsed.protocol === 'https:' || parsed.protocol === 'http:' ? baseUrl : `https://${baseUrl}`;
    this.domain = parsed.hostname || baseUrl;
    if (token) {
      this.bearer = `Bearer ${token}`;
    }
  }

  post(path, body) {
    return this.request('POST', this.url(path), body);
  }

  patch(path, body) {
    return this.request('PATCH', this.url(path), body);
  }

  get(path, query) {
    return this.request('GET', this.url(path, query));
  }

  url(path, query, includeTelemetry = false) {
    let endpoint = url.resolve(this.baseUrl, path);
    if ((query && query.length !== 0) || includeTelemetry) {
      const parsed = url.parse(endpoint);
      parsed.query = query || {};
      if (includeTelemetry) {
        parsed.query.auth0Client = this._encodedTelemetry();
      }
      endpoint = url.format(parsed);
    }
    return endpoint;
  }

  request(method, url, body) {
    const options = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Auth0-Client': this._encodedTelemetry()
      }
    };
    if (this.bearer) {
      options.headers['Authorization'] = this.bearer;
    }
    if (body) {
      options.body = JSON.stringify(body);
    }
    return fetch(url, options)
      .then((response) => {
        const payload = { status: response.status, ok: response.ok, headers: response.headers };
        return response.json()
          .then((json) => {
            return { ...payload, json };
          })
          .catch(() => {
            return response.text()
              .then((text) => {
                return { ...payload, text };
              })
              .catch(() => {
                return { ...payload, text: response.statusText };
              });
          });
      });
  }

  _encodedTelemetry() {
    return base64.encode(JSON.stringify(this.telemetry))
  }
}