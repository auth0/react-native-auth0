import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';
export default class CredentialsManagerError<
  CredentialsManagerErrorDetails
> extends BaseError {
  json: CredentialsManagerErrorDetails | undefined;
  status: number;
  invalid_parameter: string | undefined;
  constructor(response: Auth0Response<CredentialsManagerErrorDetails>);
}
export interface CredentialsManagerErrorDetails {
  error?: string;
  error_description?: string;
  invalid_parameter?: string;
}
