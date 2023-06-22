class BaseError extends Error {
  constructor(name: string, message: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = name;
    this.message = message;
  }
}

export default BaseError;