import type { IUsersClient } from '../interfaces/IUsersClient';
import {
  TokenType,
  type GetUserParameters,
  type PatchUserParameters,
  type User,
} from '../../types';
import { Auth0User, AuthError } from '../models';
import {
  HttpClient,
  getBearerHeader,
  type DPoPHeadersProvider,
} from '../services/HttpClient';
import { deepCamelCase } from '../utils';

/**
 * Orchestrates interactions with the Auth0 Management API's user endpoints.
 */
export class ManagementApiOrchestrator implements IUsersClient {
  private readonly client: HttpClient;
  private readonly token: string;
  private readonly tokenType: TokenType;
  private readonly baseUrl: string;
  private readonly getDPoPHeaders?: DPoPHeadersProvider;

  constructor(options: {
    token: string;
    httpClient: HttpClient;
    tokenType?: TokenType;
    baseUrl?: string;
    getDPoPHeaders?: DPoPHeadersProvider;
  }) {
    this.token = options.token;
    this.client = options.httpClient;
    this.tokenType = options.tokenType ?? TokenType.bearer;
    this.baseUrl = options.baseUrl ?? '';
    this.getDPoPHeaders = options.getDPoPHeaders;
  }

  /**
   * Creates the specific headers required for Management API requests,
   * including the Bearer or DPoP token based on tokenType.
   * @param path - The API path (used to build full URL for DPoP proof generation)
   * @param method - The HTTP method (needed for DPoP proof generation)
   * @returns A promise that resolves to a record of headers for the request.
   */
  private async getRequestHeaders(
    path: string,
    method: string
  ): Promise<Record<string, string>> {
    if (this.tokenType === TokenType.dpop && this.getDPoPHeaders) {
      const fullUrl = `${this.baseUrl}${path}`;
      return this.getDPoPHeaders({
        url: fullUrl,
        method,
        accessToken: this.token,
        tokenType: TokenType.dpop,
      });
    }
    return getBearerHeader(this.token);
  }

  /**
   * A helper to process the raw user profile from the Management API.
   * It camelCases the keys and maps `userId` to `sub`.
   */
  private processUserProfile(rawProfile: any): User {
    const camelCasedProfile = deepCamelCase<any>(rawProfile);

    // FIX: The Management API returns `user_id`. We must map it to `sub`
    // for our `Auth0User` model to be valid.
    if (camelCasedProfile.userId && !camelCasedProfile.sub) {
      camelCasedProfile.sub = camelCasedProfile.userId;
    }

    return camelCasedProfile as User;
  }

  async getUser(parameters: GetUserParameters): Promise<User> {
    const path = `/api/v2/users/${encodeURIComponent(parameters.id)}`;
    const headers = await this.getRequestHeaders(path, 'GET');

    const { json, response } = await this.client.get<any>(
      path,
      undefined, // No query parameters
      headers
    );

    if (!response.ok) {
      throw AuthError.fromResponse(response, json);
    }

    const processedProfile = this.processUserProfile(json);
    return new Auth0User(processedProfile);
  }

  async patchUser(parameters: PatchUserParameters): Promise<User> {
    const path = `/api/v2/users/${encodeURIComponent(parameters.id)}`;
    const body = {
      user_metadata: parameters.metadata,
    };
    const headers = await this.getRequestHeaders(path, 'PATCH');

    const { json, response } = await this.client.patch<any>(
      path,
      body,
      headers
    );

    if (!response.ok) {
      throw AuthError.fromResponse(response, json);
    }

    const processedProfile = this.processUserProfile(json);
    return new Auth0User(processedProfile);
  }
}
