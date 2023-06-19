import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';
export default class Auth0Error<Auth0ErrorDetails> extends BaseError {
  json: Auth0ErrorDetails | {};
  status: number;
  code: string | undefined;
  constructor(response: Auth0Response<Auth0ErrorDetails>);
}
export interface Auth0ErrorDetails {
  name?: string;
  description?: string;
  code?: string;
}
