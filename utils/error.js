class Auth0Error extends Error {
  constructor (json) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = json.error || json.code || 'a0.internal.failed';
    this.message = json.description || json.error_description || response.statusText || response.status;
    this.json = json;
  }
}

module.exports = Auth0Error;
