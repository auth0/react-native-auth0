import Client from '../networking';
import { apply } from '../utils/whitelist';
import { toCamelCase } from '../utils/camel';
import Auth0Error from './error';

function responseHandler (response, exceptions = {}) {
  if (response.ok && response.json) {
    return toCamelCase(response.json, exceptions);
  }
  throw new Auth0Error(response);
}

const attributes = [
  "name",
  "nickname",
  "picture",
  "user_id",
  "user_metadata",
  "app_metadata",
  "email",
  "email_verified",
  "given_name",
  "family_name"
];

/**
 * Auth0 Management API User endpoints
 *
 * @export
 * @see https://auth0.com/docs/api/management/v2#!/Users/
 * @class Users
 */
export default class Users {
  constructor(options = {}) {
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
  getUser(parameters = {}) {
    const payload = apply({
      parameters: {
        id: { required: true }
      }
    }, parameters);
    return this.client
      .get(`/api/v2/users/${encodeURIComponent(payload.id)}`)
      .then((response) => responseHandler(response, {attributes, whitelist: true, rootOnly: true}));
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
  patchUser(parameters = {}) {
    const payload = apply({
      parameters: {
        id: { required: true },
        metadata: { required: true }
      }
    }, parameters);
    return this.client
      .patch(`/api/v2/users/${encodeURIComponent(payload.id)}`, {user_metadata: payload.metadata})
      .then((response) => responseHandler(response, {attributes, whitelist: true, rootOnly: true}));
  }
}