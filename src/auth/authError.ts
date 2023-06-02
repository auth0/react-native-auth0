import BaseError from '../utils/baseError';

export default class AuthError extends BaseError {
  public json;
  public status;

  constructor(response: {status: number; json?: any; text?: string}) {
    const {status, json = {}, text} = response;
    const {error, error_description: description} = json;
    super(
      error || 'a0.response.invalid',
      description || text || handleInvalidToken(response) || 'unknown error',
    );
    this.json = json;
    this.status = status;
  }
}

export const handleInvalidToken = (response: any) =>
  response?.headers?.get('www-authenticate')?.match(/error="invalid_token"/g)
    ? 'invalid_token'
    : null;
