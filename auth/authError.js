import BaseError from '../utils/baseError';

export default class AuthError extends BaseError {
  constructor(response) {
    const { status, json = {}, text } = response;
    const { error, error_description: description } = json;
    super(error || 'a0.response.invalid', description || text || 'unknown error');
    this.json = json;
    this.status = status;
  }
}