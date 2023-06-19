import { IAuthClient } from './auth';
import { ICredentialsManager } from './credentials-manager';
import { IUserClient } from './management/users';
import { Telemetry } from './networking/telemetry';
import { IWebAuth } from './webauth';
/**
 * Options to instantiate the Auth0 class.
 */
export declare type Auth0Options = {
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
export declare class Auth0 {
  auth: IAuthClient;
  webAuth: IWebAuth;
  credentialsManager: ICredentialsManager;
  private options;
  /**
   * Creates an instance of Auth0.
   */
  constructor(options: Auth0Options);
  /**
   * Creates a Users client for the management API
   *
   * @returns Instance of Users
   */
  users(token: string): IUserClient;
}
