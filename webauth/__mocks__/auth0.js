export default class A0Auth0 {
  showUrl(url, closeOnLoad, callback) {
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
    this.url = null;
    this.error = null;
    this.hidden = true;
    this.parameters = null;
    this.onUrl = () => {};
  }

  oauthParameters(callback) {
    callback(this.parameters);
  }
}