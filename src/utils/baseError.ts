class BaseError extends Error {
  type: string;
  constructor(name: string, message: string, type?: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = name;
    this.message = message;
    this.type = type || '';
  }
}

export default BaseError;
