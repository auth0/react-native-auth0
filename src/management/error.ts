import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';

export default class Auth0Error<ErrorDetails> extends BaseError {
  public json;
  public status;
  public code;
  constructor(response: Auth0Response<ErrorDetails>) {
    const { status, json, text } = response;
    const {
      error,
      errorCode,
      message,
    }: { error?: string; errorCode?: string; message?: string } = json ?? {
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

export interface ErrorDetails {
  name?: string;
  description?: string;
  code?: string;
}
