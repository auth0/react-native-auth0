import { newSession } from './oauth';
import Browser from './browser';

export default class WebAuth {

  /**
   * @param  {String} clientId
   * @param  {String} domain of Auth0 account
   * @return {AuthenticationAPI}
   */
  constructor(clientId, domain, client) {
    if (domain == null) {
      throw new Error("must supply a valid Auth0 domain");
    }
    this.domain = domain;
    this.clientId = clientId;
    this.browser = new Browser();
    this.client = client;
  }

  authorize() {
    let self = this;
    return newSession(this.clientId, this.domain, (session) => {
      session.start(self.browser);
      self.currentSession = session;
    });
  }

  resume(url) {
    this.browser.hide();
    if (this.currentSession) {
      this.currentSession.resume(this.browser, url, this.client);
    }
    this.currentSession = null;
  }
}