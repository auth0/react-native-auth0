export default class BaseError extends Error {
  constructor (name, message) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = name;
    this.message = message;
  }
};