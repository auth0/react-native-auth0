import type { IUsersClient } from '../interfaces/IUsersClient';
import type { GetUserParameters, PatchUserParameters, User } from '../../types';
import { Auth0User, AuthError } from '../models';
import { HttpClient } from '../services/HttpClient';
import { deepCamelCase } from '../utils';

/**
 * Orchestrates interactions with the Auth0 Management API's user endpoints.
 */
export class ManagementApiOrchestrator implements IUsersClient {
  private readonly client: HttpClient;
  private readonly token: string;

  constructor(options: { token: string; httpClient: HttpClient }) {
    this.token = options.token;
    this.client = options.httpClient;
  }
  /**
   * Creates the specific headers required for Management API requests,
   * including the Bearer token.
   * @returns A record of headers for the request.
   */
  private getRequestHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
    };
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

    const { json, response } = await this.client.get<any>(
      path,
      undefined, // No query parameters
      this.getRequestHeaders()
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

    const { json, response } = await this.client.patch<any>(
      path,
      body,
      this.getRequestHeaders()
    );

    if (!response.ok) {
      throw AuthError.fromResponse(response, json);
    }

    const processedProfile = this.processUserProfile(json);
    return new Auth0User(processedProfile);
  }
}
