import { Auth } from './auth';
import CredentialsManager from './credentials-manager';
import { Users } from './management/users';
import { WebAuth } from './webauth';
/**
 * Auth0 for React Native client
 */
export class Auth0 {
  auth;
  webAuth;
  credentialsManager;
  options;
  /**
   * Creates an instance of Auth0.
   */
  constructor(options) {
    const { domain, clientId, ...extras } = options;
    this.auth = new Auth({ baseUrl: domain, clientId, ...extras });
    this.webAuth = new WebAuth(this.auth);
    this.credentialsManager = new CredentialsManager(domain, clientId);
    this.options = options;
  }
  /**
   * Creates a Users client for the management API
   *
   * @returns Instance of Users
   */
  users(token) {
    const { domain, ...extras } = this.options;
    return new Users({ baseUrl: domain, ...extras, token });
  }
}
