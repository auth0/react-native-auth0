import { Auth0Client, type Auth0ClientOptions } from '@auth0/auth0-spa-js';

/**
 * Auth0 for React Native client
 */
class Auth0 {
  public webAuth: Auth0Client;

  constructor(options: Auth0ClientOptions) {
    this.webAuth = new Auth0Client(options);
  }
}

export default Auth0;
