import BaseError from '../utils/baseError';

export default class Auth0Error extends BaseError {
  public json;
  public status;
  public code;
  constructor(response) {
    const {status, json = {}, text} = response;
    const {error, errorCode, message} = json;
    super(error || 'a0.response.invalid', message || text || 'unknown error');
    this.json = json;
    this.status = status;
    this.code = errorCode;
  }
}
