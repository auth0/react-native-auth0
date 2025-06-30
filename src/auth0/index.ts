import Auth from '../auth';
import CredentialsManager from '../credentials-manager';
import Users from '../management/users';
import WebAuth from '../webauth';
import addDefaultLocalAuthOptions from '../utils/addDefaultLocalAuthOptions';
import type { Auth0Options } from '../types';

/**
 * Auth0 for React Native client
 */
class Auth0 {
  public auth: Auth;
  public webAuth: WebAuth;
  public credentialsManager: CredentialsManager;
  private options: Auth0Options;
  private globalHeaders?: Record<string, string>;
  /**
   * Creates an instance of Auth0.
   * @param {Object} options Your Auth0 application information
   * @param {String} options.domain Your Auth0 domain
   * @param {String} options.clientId Your Auth0 application client identifier
   * @param {String} options.telemetry The telemetry information to be sent along with the requests
   * @param {String} options.token Token to be used for Management APIs
   * @param {String} options.timeout Timeout to be set for requests.
   * @param {LocalAuthenticationOptions} options.localAuthenticationOptions The options for configuring the display of local authentication prompt, authentication level (Android only) and evaluation policy (iOS only).
   */
  constructor(options: Auth0Options) {
    const { domain, clientId, headers, ...extras } = options;
    const localAuthenticationOptions = options.localAuthenticationOptions
      ? addDefaultLocalAuthOptions(options.localAuthenticationOptions)
      : undefined;
    this.auth = new Auth({ baseUrl: domain, clientId, headers, ...extras });
    this.webAuth = new WebAuth(this.auth, localAuthenticationOptions);
    this.credentialsManager = new CredentialsManager(
      this.auth,
      localAuthenticationOptions
    );
    this.options = options;
    this.globalHeaders = headers;
  }

  /**
   * Creates a Users API client
   * @param  {String} token for Management API
   * @return {Users}
   */
  users(token: string) {
    const { domain, ...extras } = this.options;
    return new Users({
      baseUrl: domain,
      ...extras,
      token,
      headers: this.globalHeaders,
    });
  }
}

export default Auth0;
