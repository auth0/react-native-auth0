import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';

export default class Auth0Error<Auth0ErrorDetails> extends BaseError {
  public json;
  public status;
  public code;

  constructor(response: Auth0Response<Auth0ErrorDetails>) {
    const { status, json = {}, text } = response;
    const {
      name,
      description,
      code,
    }: { name?: string; description?: string; code?: string } = json ?? {
      name: undefined,
      description: undefined,
      code: undefined,
    };
    super(
      name || 'a0.response.invalid',
      description || text || 'unknown error'
    );
    this.json = json;
    this.status = status;
    this.code = code;
  }
}

export interface Auth0ErrorDetails {
  name?: string;
  description?: string;
  code?: string;
}
