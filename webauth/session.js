import url from 'url';

export default class Session {
  constructor(data, resolve, reject) {
    this.state = data.state;
    this.verifier = data.verifier;
    this.redirectUri = data.redirectUri;
    this.authorizeUrl = data.authorizeUrl;
    this.tokenUrl = url.format({
      protocol: 'https',
      host: data.domain,
      pathname: 'oauth/token'
    });
    this.clientId = data.clientId;
    this.resolve = resolve;
    this.reject = reject;
  }

  start(browser) {
    browser.show(this.authorizeUrl, this.reject);
  }

  resume(browser, redirectUrl) {
    if (!redirectUrl || !redirectUrl.startsWith(this.redirectUri)) {
      return
    }
    browser.hide();
    const { code, state } = url.parse(redirectUrl, true).query;
    if (this.state !== state) {
      return this.reject(new Error('Invalid state'));
    }
    fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        code_verifier: this.verifier,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      })
    })
    .then(this.resolve)
    .catch(this.reject);
  }
}