import { handleInvalidToken } from '../auth/authError';
import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';

export default class CredentialsManagerError<
  CredentialsManagerErrorDetails
> extends BaseError {
  public json;
  public status;
  public invalid_parameter;

  constructor(response: Auth0Response<CredentialsManagerErrorDetails>) {
    const { status, json, text } = response;
    const {
      error,
      error_description: description,
      invalid_parameter,
    }: {
      error?: string;
      error_description?: string;
      invalid_parameter?: string;
    } = json ?? {
      error: undefined,
      error_description: undefined,
      invalid_parameter: undefined,
    };
    super(
      error || 'a0.response.invalid',
      description || text || handleInvalidToken(response) || 'unknown error'
    );
    this.json = json;
    this.status = status;
    if (invalid_parameter) {
      this.invalid_parameter = invalid_parameter;
    }
  }
}

export interface CredentialsManagerErrorDetails {
  error?: string;
  error_description?: string;
  invalid_parameter?: string;
}
