import BaseError from '../utils/baseError';

export default class Auth0Error extends BaseError {
  public json;
  public status;
  public code;

  constructor(response: {status: number; json?: any; text?: string}) {
    const {status, json = {}, text} = response;
    const {name, description, code} = json;
    super(
      name || 'a0.response.invalid',
      description || text || 'unknown error',
    );
    this.json = json;
    this.status = status;
    this.code = code;
  }
}
