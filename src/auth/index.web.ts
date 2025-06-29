import type { Auth0Client, User as SpaUser } from '@auth0/auth0-spa-js';
import type { Credentials, User, UserInfoOptions } from '../types';

class NotImplementedError extends Error {
  constructor(methodName: string) {
    super(
      `${methodName} is not implemented for the web. In a browser environment, you should always use the interactive, redirect-based 'authorize' method for authentication flows.`
    );
    this.name = 'NotImplementedError';
  }
}

class Auth {
  constructor(private client: Auth0Client) {}

  /**
   * Retrieves the user's profile information.
   * The token is managed internally by auth0-spa-js.
   */
  async userInfo(_options: UserInfoOptions): Promise<SpaUser | undefined> {
    return this.client.getUser();
  }

  // The methods below are not recommended for SPAs and are not implemented by auth0-spa-js.
  // We throw a specific error to guide the developer towards the correct, secure flow.
  async passwordRealm(): Promise<Credentials> {
    throw new NotImplementedError('auth.passwordRealm');
  }
  async exchange(): Promise<Credentials> {
    throw new NotImplementedError('auth.exchange');
  }
  async refreshToken(): Promise<Credentials> {
    throw new NotImplementedError('auth.refreshToken');
  }
  async revoke(): Promise<void> {
    throw new NotImplementedError('auth.revoke');
  }
  async createUser(): Promise<Partial<User>> {
    throw new NotImplementedError('auth.createUser');
  }
  async resetPassword(): Promise<void> {
    throw new NotImplementedError('auth.resetPassword');
  }
}

export default Auth;
