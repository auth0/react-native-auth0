import {
  json
} from '../utils/networking';

import {
  nonNull,
  anObject,
  anyOf,
  nonEmptyObject
} from '../utils/validation';

import { isEmpty } from '../utils/helper';

class UsersAPI {
  constructor(token, baseUrl) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  patch(id, metadata) {
    return Promise.all([
      nonNull(id, 'must supply an identifier of the user to be updated'),
      nonEmptyObject(metadata, 'must supply a non empty user metadata object')
    ]).then(([id, metadata]) => {
      return json('PATCH', `${this.baseUrl}/api/v2/users/${encodeURIComponent(id)}`, {'user_metadata': metadata}, {'Authorization': `Bearer ${this.token}`});
    });
  }

  link(id, otherUserToken) {
    return Promise.all([
      nonNull(id, 'must supply an identifier of the user to to link to'),
      nonNull(otherUserToken, 'must supply a valid token of the user to to link')
    ]).then(([id, otherUserToken]) => {
      return json('POST', `${this.baseUrl}/api/v2/users/${encodeURIComponent(id)}/identities`, {'link_with': otherUserToken}, {'Authorization': `Bearer ${this.token}`});
    });
  }

  unlink(id, identityId, provider) {
    return Promise.all([
      nonNull(id, 'must provider a user identifier from where the identity will be unlinked'),
      nonNull(identityId, 'must supply an identity identifier to be unlinked'),
      nonNull(provider, 'must supply a provider name of the identity to be unlinked')
    ]).then(([id, identityId, provider]) => {
      return json('DELETE', `${this.baseUrl}/api/v2/users/${encodeURIComponent(id)}/identities/${encodeURIComponent(provider)}/${encodeURIComponent(identityId)}`, null, {'Authorization': `Bearer ${this.token}`});
    });
  }
}

module.exports = UsersAPI;
