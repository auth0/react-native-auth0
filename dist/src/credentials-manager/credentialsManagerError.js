import { handleInvalidToken } from '../auth/authError';
import BaseError from '../utils/baseError';
export default class CredentialsManagerError extends BaseError {
  json;
  status;
  invalid_parameter;
  constructor(response) {
    const { status, json, text } = response;
    const {
      error,
      error_description: description,
      invalid_parameter,
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
