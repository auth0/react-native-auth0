class BaseError extends Error {
  generic_error_code: string;
  constructor(name: string, message: string, generic_error_code?: string) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = name;
    this.message = message;
    this.generic_error_code = generic_error_code || '';
  }
}

export default BaseError;
