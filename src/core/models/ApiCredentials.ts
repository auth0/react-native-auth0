import type { ApiCredentials as IApiCredentials } from '../../types';

/**
 * A class representation of API-specific user credentials.
 * It encapsulates the tokens and provides helper methods for convenience.
 */
export class ApiCredentials implements IApiCredentials {
  public accessToken: string;
  public tokenType: string;
  public expiresAt: number;
  public scope?: string;

  /**
   * Creates an instance of ApiCredentials.
   *
   * @param params An object conforming to the ApiCredentials type definition.
   */
  constructor(params: IApiCredentials) {
    this.accessToken = params.accessToken;
    this.tokenType = params.tokenType;
    this.expiresAt = params.expiresAt;
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
}
