import type {
  Credentials as ICredentials,
  NativeCredentialsResponse,
} from '../../types';

/**
 * A class representation of user credentials.
 * It encapsulates the tokens and provides helper methods for convenience.
 */
export class Credentials implements ICredentials {
  public idToken: string;
  public accessToken: string;
  public tokenType: string;
  public expiresAt: number;
  public refreshToken?: string;
  public scope?: string;

  /**
   * Creates an instance of Credentials.
   *
   * @param params An object conforming to the Credentials type definition.
   */
  constructor(params: ICredentials) {
    this.idToken = params.idToken;
    this.accessToken = params.accessToken;
    this.tokenType = params.tokenType;
    this.expiresAt = params.expiresAt;
    this.refreshToken = params.refreshToken;
    this.scope = params.scope;
  }

  /**
   * Checks if the access token is expired.
   *
   * @param [leeway=0] - A buffer in seconds to account for clock skew. The token will be
   * considered expired if it expires within this buffer.
   * @returns `true` if the token is expired, `false` otherwise.
   */
  isExpired(leeway: number = 0): boolean {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return this.expiresAt <= nowInSeconds + leeway;
  }

  /**
   * A static factory method to create a Credentials instance from a raw OAuth2
   * token response, which typically includes `expires_in` instead of `expiresAt`.
   *
   * @param response The raw token response from the server.
   * @returns A new Credentials instance.
   */
  static fromResponse(response: NativeCredentialsResponse): Credentials {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = nowInSeconds + response.expires_in;

    return new Credentials({
      idToken: response.id_token,
      accessToken: response.access_token,
      tokenType: response.token_type,
      expiresAt: expiresAt,
      refreshToken: response.refresh_token,
      scope: response.scope,
    });
  }
}
