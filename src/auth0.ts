import Auth from './auth';
import CredentialsManager from './credentials-manager';
import Users from './management/users';
import {Telemetry} from './networking/telemetry';
import WebAuth from './webauth';

/**
 * Auth0 for React Native client
 */
class Auth0 {
  public auth: Auth;
  public webAuth: WebAuth;
  public credentialsManager: CredentialsManager;
  private options;

  /**
   * Creates an instance of Auth0.
   * @param {Object} options your Auth0 application information
   * @param {String} options.domain your Auth0 domain
   * @param {String} options.clientId your Auth0 application client identifier=
   */
  constructor(options: {
    domain: string;
    clientId: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  }) {
    const {domain, clientId, ...extras} = options;
    this.auth = new Auth({baseUrl: domain, clientId, ...extras});
    this.webAuth = new WebAuth(this.auth);
    this.credentialsManager = new CredentialsManager(domain, clientId);
    this.options = options;
  }

  /**
   * Creates a Users API client
   * @param  {String} token for Management API
   * @return {Users}
   */
  users(token: string) {
    const {domain, ...extras} = this.options;
    return new Users({baseUrl: domain, ...extras, token});
  }
}

export default Auth0;
