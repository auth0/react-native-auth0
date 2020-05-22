export default class A0Auth0 {
  showUrl(...args) {
    let closeOnLoad;
    let callback;
    this.url = args[0];
    if (args.length == 3) {
      closeOnLoad = args[1];
      callback = args[2];
    } else {
      this.ephemeralSession = args[1];
      closeOnLoad = args[2];
      callback = args[3];
    }
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

  bundleIdentifier = 'com.My.App';
}
