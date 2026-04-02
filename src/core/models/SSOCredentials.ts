import type {
  SessionTransferCredentials,
  SSOCredentialsResponse,
} from '../../types';

/**
 * A class representation of SSO credentials returned by the session transfer token exchange.
 * Maps the raw API response (snake_case) to the SDK's SessionTransferCredentials type (camelCase).
 */
export class SSOCredentials implements SessionTransferCredentials {
  public sessionTransferToken: string;
  public tokenType: string;
  public expiresIn: number;
  public idToken?: string;
  public refreshToken?: string;

  constructor(params: SessionTransferCredentials) {
    this.sessionTransferToken = params.sessionTransferToken;
    this.tokenType = params.tokenType;
    this.expiresIn = params.expiresIn;
    this.idToken = params.idToken;
    this.refreshToken = params.refreshToken;
  }

  /**
   * Creates an SSOCredentials instance from a raw /oauth/token response.
   * The API returns `access_token` as the session transfer token and
   * `issued_token_type` as the token type.
   */
  static fromResponse(response: SSOCredentialsResponse): SSOCredentials {
    return new SSOCredentials({
      sessionTransferToken: response.access_token,
      tokenType: response.issued_token_type,
      expiresIn: response.expires_in,
      idToken: response.id_token,
      refreshToken: response.refresh_token,
    });
  }
}
