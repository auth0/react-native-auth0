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

export default class Management {
  constructor(options = {}) {
    this.client = new Client(options);
    if (!options.token) {
      throw new Error('Missing token in parameters');
    }
  }

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