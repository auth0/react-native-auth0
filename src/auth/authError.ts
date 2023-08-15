import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';

export default class AuthError<AuthErrorDetails> extends BaseError {
  public json;
  public status;

  constructor(response: Auth0Response<AuthErrorDetails>) {
    const { status, json, text } = response;
    const {
      error,
      error_description: description,
    }: { error?: string; error_description?: string } = json ?? {
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

export const handleInvalidToken = (response: Auth0Response<unknown>) =>
  response?.headers?.get('www-authenticate')?.match(/error="invalid_token"/g)
    ? 'invalid_token'
    : null;

export interface AuthErrorDetails {
  error: string;
  error_description: string;
}
