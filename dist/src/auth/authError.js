import BaseError from '../utils/baseError';
export default class AuthError extends BaseError {
  json;
  status;
  constructor(response) {
    const { status, json, text } = response;
    const { error, error_description: description } = json ?? {
      error: undefined,
      error_description: undefined,
    };
    super(
      error || 'a0.response.invalid',
      description || text || handleInvalidToken(response) || 'unknown error'
    );
    this.json = json;
    this.status = status;
  }
}
export const handleInvalidToken = (response) =>
  response?.headers?.get('www-authenticate')?.match(/error="invalid_token"/g)
    ? 'invalid_token'
    : null;
