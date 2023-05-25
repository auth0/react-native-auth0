import { handleInvalidToken } from '../auth/authError';
import BaseError from '../utils/baseError';

export default class CredentialsManagerError extends BaseError {
  public json;
  public status;
  public invalid_parameter;
  
  constructor(response) {
    const {status, json = {}, text} = response;
    const {error, error_description: description, invalid_parameter} = json;
    super(
      error || 'a0.response.invalid',
      description || text || handleInvalidToken(response) || 'unknown error',
    );
    this.json = json;
    this.status = status;
    if (invalid_parameter) {
      this.invalid_parameter = invalid_parameter;
    }
  }
}
