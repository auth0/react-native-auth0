import { Telemetry } from '../networking/telemetry';
import { GetUserOptions, PatchUserOptions, User } from '../types';
export interface IUserClient {
  getUser(parameters: GetUserOptions): Promise<User>;
  patchUser(parameters: PatchUserOptions): Promise<User>;
}
/**
 * Auth0 Management API User endpoints.
 */
export declare class Users implements IUserClient {
  private client;
  constructor(options: {
    baseUrl: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  });
  /**
   * Returns the user by identifier
   *
   * @param {Object} parameters get user by identifier parameters
   * @param {String} parameters.id identifier of the user to obtain
   * @returns {Promise}
   * @see https://auth0.com/docs/api/management/v2#!/Users/get_users_by_id
   *
   * @memberof Users
   */
  getUser(parameters: GetUserOptions): Promise<User>;
  /**
   * Patch a user's `user_metadata`
   *
   * @param {Object} parameters patch user metadata parameters
   * @param {String} parameters.id identifier of the user to patch
   * @param {Object} parameters.metadata object with attributes to store in user_metadata.
   * @returns {Promise}
   * @see https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id
   *
   * @memberof Users
   */
  patchUser(parameters: PatchUserOptions): Promise<User>;
}
