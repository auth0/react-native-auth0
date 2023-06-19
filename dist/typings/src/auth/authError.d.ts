import { Auth0Response } from '../networking';
import BaseError from '../utils/baseError';
export default class AuthError<AuthErrorDetails> extends BaseError {
  json: AuthErrorDetails | undefined;
  status: number;
  constructor(response: Auth0Response<AuthErrorDetails>);
}
export declare const handleInvalidToken: (
  response: Auth0Response<unknown>
) => 'invalid_token' | null;
export interface AuthErrorDetails {
  error: string;
  error_description: string;
}
