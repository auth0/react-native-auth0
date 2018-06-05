export default class A0Auth0 {
  showAuthorization(url, callbackScheme) {
    this.showAuthorizationCalled = true;
    this.url = url;
    this.callbackScheme = callbackScheme;
    return new Promise((resolve, reject) => {
      if (this.error) {
        reject(this.error);
      } else {
        resolve(this.callbackUrl);
      }
    });
  }
  
  showUrl(url, closeOnLoad, callback) {
    this.showUrlCalled = true;
    this.url = url;
    this.hidden = false;
    if (this.error || closeOnLoad) {
      callback(this.error);
    } else {
      this.onUrl();
    }
  }

  hide() {
    this.hidden = true;
  }

  reset() {
    this.showAuthorizationCalled = false;
    this.showUrlCalled = false;
    this.url = null;
    this.callbackScheme = null;
    this.callbackUrl = null;
    this.error = null;
    this.hidden = true;
    this.parameters = null;
    this.onUrl = () => {};
  }

  oauthParameters(callback) {
    callback(this.parameters);
  }
}