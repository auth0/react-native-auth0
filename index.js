import Auth from './auth';
import Users from './management/users';
import WebAuth from './webauth';

/**
 * Auth0 for React Native client
 *
 * @export
 * @class Auth0
 */
export default class Auth0 {

  /**
   * Creates an instance of Auth0.
   * @param {Object} options your Auth0 client information
   * @param {String} options.domain your Auth0 domain
   * @param {String} options.clientId your Auth0 client identifier
   *
   * @memberof Auth0
   */
  constructor(options = {}) {
    const { domain, clientId, ...extras } = options;
    this.auth = new Auth({baseUrl: domain, clientId, ...extras});
    this.webAuth = new WebAuth(this.auth);
    this.options = options;
  }

  /**
   * Creates a Users API client
   * @param  {String} token for Management API
   * @return {Users}
   */
  users(token) {
    const { domain, clientId, ...extras } = this.options;
    return new Users({baseUrl: domain, clientId, ...extras, token});
  }
};
