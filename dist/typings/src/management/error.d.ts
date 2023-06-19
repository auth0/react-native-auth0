import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';
export default class Auth0Error<ErrorDetails> extends BaseError {
  json: ErrorDetails | undefined;
  status: number;
  code: string | undefined;
  constructor(response: Auth0Response<ErrorDetails>);
}
export interface ErrorDetails {
  name?: string;
  description?: string;
  code?: string;
}
