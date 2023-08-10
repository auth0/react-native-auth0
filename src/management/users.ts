import Client, { Auth0Response } from '../networking';
import { toCamelCase } from '../utils/camel';
import Auth0Error from './error';
import { Telemetry } from '../networking/telemetry';
import { GetUserOptions, PatchUserOptions, User } from '../types';
import { RawUser } from '../internal-types';

function responseHandler<TRawResult = unknown, TResult = unknown>(
  response: Auth0Response<TRawResult>,
  exceptions = {}
) {
  if (response.ok && response.json) {
    return toCamelCase(response.json, exceptions) as TResult;
  }
  throw new Auth0Error(response);
}

const attributes = [
  'name',
  'nickname',
  'picture',
  'user_id',
  'user_metadata',
  'app_metadata',
  'email',
  'email_verified',
  'given_name',
  'family_name',
];

/**
 * Auth0 Management API User endpoints
 *
 * @export
 * @see https://auth0.com/docs/api/management/v2#!/Users/
 * @class Users
 */
class Users {
  private client: Client;

  /**
   * @ignore
   */
  constructor(options: {
    baseUrl: string;
    telemetry?: Telemetry;
    token?: string;
    timeout?: number;
  }) {
    this.client = new Client(options);
    if (!options.token) {
      throw new Error('Missing token in parameters');
    }
  }

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
  getUser(parameters: GetUserOptions): Promise<User> {
    return this.client
      .get<RawUser>(`/api/v2/users/${encodeURIComponent(parameters.id)}`)
      .then((response) =>
        responseHandler<RawUser, User>(response, {
          attributes,
          whitelist: true,
          rootOnly: true,
        })
      );
  }

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
  patchUser(parameters: PatchUserOptions): Promise<User> {
    return this.client
      .patch<RawUser>(`/api/v2/users/${encodeURIComponent(parameters.id)}`, {
        user_metadata: parameters.metadata,
      })
      .then((response) =>
        responseHandler<RawUser, User>(response, {
          attributes,
          whitelist: true,
          rootOnly: true,
        })
      );
  }
}

export default Users;
