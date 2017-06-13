import Auth from './auth';
import Users from './management';
import WebAuth from './webauth';

export default class Auth0 {
  constructor(options = {}) {
    const { domain, clientId, ...extras } = options;
    this.auth = new Auth({baseUrl: domain, clientId, ...extras});
    this.options = options;
  }

  /**
   * Creates a Users API client
   * @param  {String} token for Management API
   * @return {Users}
   */
  users(token) {
    const { domain, clientId, ...extras } = options;
    return new Users({baseUrl: domain, clientId, ...extras, token});
  }

  webAuth() {
    return new WebAuth(this.auth);
  }
};
