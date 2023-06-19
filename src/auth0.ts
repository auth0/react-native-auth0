import { Auth, IAuthClient } from './auth';
import CredentialsManager, { ICredentialsManager } from './credentials-manager';
import { IUserClient, Users } from './management/users';
import { Telemetry } from './networking/telemetry';
import { IWebAuth, WebAuth } from './webauth';

/**
 * Options to instantiate the Auth0 class.
 */
export type Auth0Options = {
  /**
   * The Auth0 domain
   */
  domain: string;
  /**
   * The Auth0 client ID
   */
  clientId: string;
  /**
   * @ignore
   */
  telemetry?: Telemetry;
  /**
   * Can be used to specify an existing access token for the management API.
   */
  token?: string;
  /**
   * Timeout for network calls.
   *
   * @defaultValue 10 seconds
   */
  timeout?: number;
};

/**
 * Auth0 for React Native client
 */
export class Auth0 {
  public auth: IAuthClient;
  public webAuth: IWebAuth;
  public credentialsManager: ICredentialsManager;
  private options: Auth0Options;

  /**
   * Creates an instance of Auth0.
   */
  constructor(options: Auth0Options) {
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
  users(token: string): IUserClient {
    const { domain, ...extras } = this.options;
    return new Users({ baseUrl: domain, ...extras, token });
  }
}
