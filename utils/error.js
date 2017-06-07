export default class Auth0Error extends Error {
  constructor (json, response) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = json.error || json.code || 'a0.internal.failed';
    this.message = json.description || json.error_description;
    this.json = json;
  }
};
