import BaseError from '../utils/baseError';
export default class Auth0Error extends BaseError {
  json;
  status;
  code;
  constructor(response) {
    const { status, json, text } = response;
    const { error, errorCode, message } = json ?? {
      error: undefined,
      errorCode: undefined,
      message: undefined,
    };
    super(error || 'a0.response.invalid', message || text || 'unknown error');
    this.json = json;
    this.status = status;
    this.code = errorCode;
  }
}
