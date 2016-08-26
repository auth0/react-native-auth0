class AuthenticationError extends Error {
  constructor (json) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = json.error || json.code || 'A0.AuthError';
    this.message = json.description || json.error_description || response.statusText || response.status;
    this.json = json;
  }
}

module.exports = AuthenticationError;
